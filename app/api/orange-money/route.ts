import { NextResponse } from 'next/server';
import { requestPayment, checkPaymentStatus } from '@/lib/orangeMoney';

// Handle POST request to initiate a payment
export async function POST(request: Request) {
  try {
    const { amount, phoneNumber, orderId, reference } = await request.json();

    if (!amount || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Amount and phone number are required' },
        { status: 400 }
      );
    }

    const result = await requestPayment(
      amount,
      phoneNumber,
      orderId || `ORDER-${Date.now()}`,
      reference || `REF-${Date.now()}`
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: result.paymentUrl,
      orderId: result.orderId,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Orange Money API error:', error);
    return NextResponse.json(
      { success: false, error: `Failed to process payment: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Handle GET request to check payment status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const result = await checkPaymentStatus(orderId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      data: result.data,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { success: false, error: `Failed to check payment status: ${errorMessage}` },
      { status: 500 }
    );
  }
}
