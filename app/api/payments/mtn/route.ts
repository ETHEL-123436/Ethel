import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { phone, amount, reference } = await request.json();
    
    // MTN API credentials - these should be in your environment variables
    const apiKey = process.env.MTN_API_KEY;
    const subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY;
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
  } catch (error: any) {
    console.error('MTN Payment Error:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: error.response?.data?.message || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}
