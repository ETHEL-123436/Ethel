import axios, { AxiosError } from 'axios';

type ApiResponse<T = Record<string, unknown>> = {
  success: boolean;
  status?: string;
  data?: T;
  error?: string;
};

interface PaymentStatusResponse {
  status: string;
  [key: string]: unknown;
}

interface ErrorResponse {
  message?: string;
  [key: string]: unknown;
}

// Initialize the Orange Money API client
const orangeMoneyApi = axios.create({
  baseURL: 'https://api.orange.com/orange-money-webpay/dev/v1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Get the authentication token
export async function getAuthToken() {
  try {
    const authHeader = Buffer.from(
      `${process.env.ORANGE_MERCHANT_KEY}:${process.env.ORANGE_MERCHANT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      'https://api.orange.com/oauth/v3/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Orange Money auth token:', error);
    throw error;
  }
}

// Make a payment request
export async function requestPayment(amount: number, phoneNumber: string, orderId: string, reference: string) {
  try {
    const token = await getAuthToken();
    
    const response = await orangeMoneyApi.post(
      '/webpayment',
      {
        merchant_key: process.env.ORANGE_MERCHANT_KEY,
        currency: 'XAF',
        order_id: orderId,
        amount: amount.toString(),
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        notif_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback/orange`,
        lang: 'en',
        reference: reference,
        channel_user_mobile: phoneNumber,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      paymentUrl: response.data.payment_url,
      orderId: response.data.order_id,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred';
      
    const responseData = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    
    console.error('Orange Money payment error:', responseData || errorMessage);
    return {
      success: false,
      error: responseData || 'Failed to initiate payment',
    };
  }
}

// Check payment status
export async function checkPaymentStatus(orderId: string): Promise<ApiResponse<PaymentStatusResponse>> {
  try {
    const token = await getAuthToken();
    
    const response = await orangeMoneyApi.get(
      `/payment/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      status: response.data.status,
      data: response.data,
    };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error('Error checking payment status:', axiosError.response?.data || axiosError.message);
    return {
      success: false,
      error: (axiosError.response?.data as ErrorResponse)?.message || 'Failed to check payment status',
    };
  }
}
