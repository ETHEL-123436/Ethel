import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { phone, amount, reference } = await request.json();
    
    // MTN API credentials - these should be in your environment variables
    const subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY;
    if (!subscriptionKey) {
      throw new Error('MTN subscription key is not configured');
    }
    const targetEnvironment = process.env.MTN_TARGET_ENVIRONMENT || 'sandbox';
    const currency = 'XAF';

    // Generate a UUID for the transaction
    const transactionId = crypto.randomUUID();

    // MTN API endpoint
    const url = 'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay';
    
    const headers = {
      'X-Reference-Id': transactionId,
      'X-Target-Environment': targetEnvironment,
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json',
      'X-Callback-Url': `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback/mtn`,
    };

    const data = {
      amount: amount.toString(),
      currency,
      externalId: reference,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phone,
      },
      payerMessage: 'Payment for service',
      payeeNote: 'Thank you for your payment',
    };

    // Make the API call to MTN
    const response = await axios.post(url, data, { headers });

    return NextResponse.json({
      success: true,
      transactionId,
      status: response.status,
      data: response.data,
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
    console.error('MTN Payment Error:', errorMessage, errorData);
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
