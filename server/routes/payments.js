import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import axios from 'axios';

const router = express.Router();

// MTN Mobile Money API configuration
const MTN_API_BASE = process.env.MTN_API_BASE || 'https://sandbox.momodeveloper.mtn.com';
const MTN_SUBSCRIPTION_KEY = process.env.MTN_SUBSCRIPTION_KEY;
const MTN_API_USER = process.env.MTN_API_USER;
const MTN_API_KEY = process.env.MTN_API_KEY;

// Orange Money API configuration  
const ORANGE_API_BASE = process.env.ORANGE_API_BASE || 'https://api.orange.com';
const ORANGE_CLIENT_ID = process.env.ORANGE_CLIENT_ID;
const ORANGE_CLIENT_SECRET = process.env.ORANGE_CLIENT_SECRET;

// @route   POST /api/payments/create-payment-intent
// @desc    Create payment intent for booking (supports mobile money)
// @access  Private
router.post('/create-payment-intent', [
  body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('paymentMethod').isIn(['mtn', 'orange', 'card']).withMessage('Valid payment method required'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number required for mobile money')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { bookingId, paymentMethod, phoneNumber } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('ride')
      .populate('passenger', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the passenger
    if (booking.passenger._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if payment already completed
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }

    let paymentResponse;
    
    switch (paymentMethod) {
      case 'mtn':
        paymentResponse = await initiateMTNPayment(booking, phoneNumber);
        break;
      case 'orange':
        paymentResponse = await initiateOrangePayment(booking, phoneNumber);
        break;
      case 'card':
        // Keep Stripe for card payments if needed
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // const paymentIntent = await stripe.paymentIntents.create({
        //   amount: Math.round(booking.totalAmount * 100),
        //   currency: 'usd',
        //   metadata: {
        //     bookingId: booking._id.toString(),
        //     passengerId: booking.passenger._id.toString(),
        //     rideId: booking.ride._id.toString()
        //   }
        // });
        // paymentResponse = {
        //   paymentId: paymentIntent.id,
        //   clientSecret: paymentIntent.client_secret
        // };
        // break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
    }

    // Update booking with payment intent ID
    booking.paymentIntentId = paymentResponse.paymentId;
    booking.paymentMethod = paymentMethod;
    await booking.save();

    res.json({
      success: true,
      data: {
        ...paymentResponse,
        paymentMethod
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// MTN Mobile Money payment initiation
async function initiateMTNPayment(booking, phoneNumber) {
  try {
    // Get access token
    const tokenResponse = await axios.post(`${MTN_API_BASE}/collection/token/`, {}, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${MTN_API_USER}:${MTN_API_KEY}`).toString('base64')}`,
        'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY
      }
    });

    const accessToken = tokenResponse.data.access_token;
    const referenceId = `RC_${booking._id}_${Date.now()}`;

    // Initiate payment request
    const response = await axios.post(`${MTN_API_BASE}/collection/v1_0/requesttopay`, {
      amount: booking.totalAmount.toString(),
      currency: 'XAF',
      externalId: booking._id.toString(),
      payer: {
        partyIdType: 'MSISDN',
        partyId: phoneNumber.replace(/\D/g, '') // Remove non-digits
      },
      payerMessage: `Payment for ride booking ${booking.bookingReference}`,
      payeeNote: 'RideConnect booking payment'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': process.env.MTN_ENVIRONMENT || 'sandbox',
        'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true // This ensures we get the response even for non-2xx status codes
    });

    // Check if the request was successful (MTN returns 202 for successful initiation)
    if (response.status === 202) {
      return {
        paymentId: referenceId,
        status: 'pending',
        message: 'Payment request sent to your phone. Please approve the transaction.'
      };
    }

    // If we get here, there was an error with the request
    const errorMessage = response.data?.message || 'Failed to initiate payment';
    throw new Error(`MTN API error: ${errorMessage}`);

  } catch (error) {
    console.error('MTN payment error:', error);
    throw new Error('Failed to initiate MTN Mobile Money payment');
  }
}

// Orange Money payment initiation
async function initiateOrangePayment(booking) {
  try {
    // Get access token
    const tokenResponse = await axios.post(`${ORANGE_API_BASE}/oauth/v3/token`, {
      grant_type: 'client_credentials'
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${ORANGE_CLIENT_ID}:${ORANGE_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenResponse.data.access_token;
    const referenceId = `RC_OM_${booking._id}_${Date.now()}`;

    // Initiate payment request
    const paymentResponse = await axios.post(`${ORANGE_API_BASE}/orange-money-webpay/cm/v1/webpayment`, {
      merchant_key: process.env.ORANGE_MERCHANT_KEY,
      currency: 'XAF',
      order_id: referenceId,
      amount: booking.totalAmount,
      return_url: `${process.env.FRONTEND_URL}/passenger/booking-confirmation/${booking._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/passenger/book/${booking.ride._id}`,
      notif_url: `${process.env.BACKEND_URL}/api/payments/orange-webhook`,
      lang: 'fr',
      reference: booking.bookingReference
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      paymentId: referenceId,
      paymentUrl: paymentResponse.data.payment_url,
      status: 'pending',
      message: 'Redirecting to Orange Money payment page...'
    };

  } catch (error) {
    console.error('Orange payment error:', error);
    throw new Error('Failed to initiate Orange Money payment');
  }
}

// @route   POST /api/payments/confirm-payment
// @desc    Confirm payment completion
// @access  Private
router.post('/confirm-payment', [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { paymentIntentId } = req.body;

    // Find and update booking
    const booking = await Booking.findOne({ paymentIntentId })
      .populate('ride')
      .populate('passenger', 'firstName lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the passenger
    if (booking.passenger._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Verify payment status based on payment method
    let paymentVerified = false;
    
    if (booking.paymentMethod === 'mtn') {
      paymentVerified = await verifyMTNPayment(paymentIntentId);
    } else if (booking.paymentMethod === 'orange') {
      paymentVerified = await verifyOrangePayment(paymentIntentId);
    } else if (booking.paymentMethod === 'card') {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paymentVerified = paymentIntent.status === 'succeeded';
    }

    if (!paymentVerified) {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed or verification failed'
      });
    }

    // Update booking payment status
    booking.paymentStatus = 'paid';
    if (booking.status === 'pending') {
      booking.status = 'confirmed';
    }
    await booking.save();

    // Update ride seats
    await booking.ride.bookSeats(booking.seatsBooked);

    // Add booking to ride's bookings array if not already there
    if (!booking.ride.bookings.includes(booking._id)) {
      booking.ride.bookings.push(booking._id);
      await booking.ride.save();
    }

    // Update driver earnings
    const driver = await User.findById(booking.ride.driver);
    if (driver) {
      const driverEarnings = booking.totalAmount - booking.serviceFee;
      driver.driverProfile.earnings.pending += driverEarnings;
      await driver.save();
    }

    // Notify driver of confirmed booking
    req.io.to(`user_${booking.ride.driver}`).emit('bookingConfirmed', {
      booking: booking.toObject(),
      message: `Booking confirmed and paid by ${booking.passenger.firstName} ${booking.passenger.lastName}`
    });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Verify MTN payment status
async function verifyMTNPayment(referenceId) {
  try {
    const tokenResponse = await axios.post(`${MTN_API_BASE}/collection/token/`, {}, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${MTN_API_USER}:${MTN_API_KEY}`).toString('base64')}`,
        'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY
      }
    });

    const accessToken = tokenResponse.data.access_token;

    const statusResponse = await axios.get(`${MTN_API_BASE}/collection/v1_0/requesttopay/${referenceId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': process.env.MTN_ENVIRONMENT || 'sandbox',
        'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY
      }
    });

    return statusResponse.data.status === 'SUCCESSFUL';
  } catch (error) {
    console.error('MTN payment verification error:', error);
    return false;
  }
}

// Verify Orange payment status
async function verifyOrangePayment(referenceId) {
  try {
    const tokenResponse = await axios.post(`${ORANGE_API_BASE}/oauth/v3/token`, {
      grant_type: 'client_credentials'
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${ORANGE_CLIENT_ID}:${ORANGE_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenResponse.data.access_token;

    const statusResponse = await axios.get(`${ORANGE_API_BASE}/orange-money-webpay/cm/v1/webpayment/${referenceId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return statusResponse.data.status === 'SUCCESS';
  } catch (error) {
    console.error('Orange payment verification error:', error);
    return false;
  }
}

// @route   POST /api/payments/mtn-webhook
// @desc    Handle MTN Mobile Money webhooks
// @access  Public
router.post('/mtn-webhook', async (req, res) => {
  try {
    const { referenceId, status } = req.body;
    
    const booking = await Booking.findOne({ paymentIntentId: referenceId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (status === 'SUCCESSFUL') {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();
      
      // Update ride and driver earnings
      await booking.ride.bookSeats(booking.seatsBooked);
      const driver = await User.findById(booking.ride.driver);
      if (driver) {
        const driverEarnings = booking.totalAmount - booking.serviceFee;
        driver.driverProfile.earnings.pending += driverEarnings;
        await driver.save();
      }
    } else if (status === 'FAILED') {
      booking.paymentStatus = 'failed';
      booking.status = 'cancelled';
      await booking.save();
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('MTN webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/payments/orange-webhook
// @desc    Handle Orange Money webhooks
// @access  Public
router.post('/orange-webhook', async (req, res) => {
  try {
    const { order_id, status } = req.body;
    
    const booking = await Booking.findOne({ paymentIntentId: order_id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (status === 'SUCCESS') {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();
      
      // Update ride and driver earnings
      await booking.ride.bookSeats(booking.seatsBooked);
      const driver = await User.findById(booking.ride.driver);
      if (driver) {
        const driverEarnings = booking.totalAmount - booking.serviceFee;
        driver.driverProfile.earnings.pending += driverEarnings;
        await driver.save();
      }
    } else if (status === 'FAILED') {
      booking.paymentStatus = 'failed';
      booking.status = 'cancelled';
      await booking.save();
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Orange webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/payments/refund
// @desc    Process refund for cancelled booking
// @access  Private
router.post('/refund', [
  body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { bookingId, reason } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('ride')
      .populate('passenger', 'firstName lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization (passenger or driver can request refund)
    const isPassenger = booking.passenger._id.toString() === req.user.id;
    const isDriver = booking.ride.driver.toString() === req.user.id;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'No payment to refund'
      });
    }

    if (booking.cancellation && booking.cancellation.refundStatus === 'processed') {
      return res.status(400).json({
        success: false,
        message: 'Refund already processed'
      });
    }

    // Calculate refund amount
    const refundAmount = booking.calculateRefund();

    if (refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No refund available for this cancellation time'
      });
    }

    // Process refund through Stripe
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const refund = await stripe.refunds.create({
      payment_intent: booking.paymentIntentId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: 'requested_by_customer',
      metadata: {
        bookingId: booking._id.toString(),
        originalAmount: booking.totalAmount.toString(),
        refundReason: reason || 'Booking cancelled'
      }
    });

    // Update booking with refund information
    if (!booking.cancellation) {
      booking.cancellation = {};
    }
    
    booking.cancellation.refundAmount = refundAmount;
    booking.cancellation.refundStatus = 'processed';
    booking.paymentStatus = 'refunded';
    
    await booking.save();

    // Update driver earnings if applicable
    if (isPassenger) {
      const driver = await User.findById(booking.ride.driver);
      if (driver) {
        const driverLoss = refundAmount - booking.serviceFee;
        driver.driverProfile.earnings.pending = Math.max(0, 
          driver.driverProfile.earnings.pending - driverLoss
        );
        await driver.save();
      }
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundAmount,
        refundId: refund.id,
        booking
      }
    });

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments/earnings
// @desc    Get driver earnings summary
// @access  Private (Drivers only)
router.get('/earnings', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can view earnings'
      });
    }

    // Get detailed earnings from bookings
    const earnings = await Booking.aggregate([
      {
        $lookup: {
          from: 'rides',
          localField: 'ride',
          foreignField: '_id',
          as: 'rideInfo'
        }
      },
      {
        $match: {
          'rideInfo.driver': user._id,
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: { $subtract: ['$totalAmount', '$serviceFee'] } },
          totalBookings: { $sum: 1 },
          thisMonth: {
            $sum: {
              $cond: [
                {
                  $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
                },
                { $subtract: ['$totalAmount', '$serviceFee'] },
                0
              ]
            }
          },
          thisWeek: {
            $sum: {
              $cond: [
                {
                  $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]
                },
                { $subtract: ['$totalAmount', '$serviceFee'] },
                0
              ]
            }
          }
        }
      }
    ]);

    const earningsData = earnings[0] || {
      totalEarnings: 0,
      totalBookings: 0,
      thisMonth: 0,
      thisWeek: 0
    };

    res.json({
      success: true,
      data: {
        earnings: {
          ...earningsData,
          pending: user.driverProfile.earnings.pending,
          available: user.driverProfile.earnings.total - user.driverProfile.earnings.pending
        }
      }
    });

  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;