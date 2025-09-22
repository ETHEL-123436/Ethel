import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { phone, amount, reference } = await request.json();
    
    // Orange Money API credentials - these should be in your environment variables
    const merchantKey = process.env.ORANGE_MERCHANT_KEY;
    const authHeader = process.env.ORANGE_AUTH_HEADER;
    const currency = 'XAF';
    
    // Generate a unique order ID
    const orderId = `ORD-${Date.now()}`;
    
    // Generate signature for request validation (commented out as it's not used in the current request)
    // const signatureData = `${merchantKey}${phone}${amount}${orderId}${reference}`;
    // const signature = crypto
    //   .createHash('sha256')
    //   .update(signatureData)
    //   .digest('hex');

    // Orange Money API endpoint (sandbox)
    const url = 'https://api.orange.com/orange-money-webpay/dev/v1/webpayment';
    
    const headers = {
      'Authorization': `Basic ${authHeader}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    const data = {
      merchant_key: merchantKey,
      currency,
      order_id: orderId,
      amount: amount.toString(),
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      notif_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback/orange`,
      lang: 'en',
      reference,
      channel_user_mobile: phone,
    };

    // Make the API call to Orange Money
    const response = await axios.post(url, data, { headers });

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl: response.data.payment_url,
      status: response.status,
    });
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    let statusCode = 500;
    let errorData: Record<string, unknown> = {};

    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
      statusCode = error.response?.status || 500;
      errorData = error.response?.data || {};
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Orange Money Payment Error:', errorMessage, errorData);
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        ...(Object.keys(errorData).length > 0 && { details: errorData })
      },
      { status: statusCode }
    );
  }
}
