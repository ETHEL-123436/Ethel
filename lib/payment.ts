import axios from 'axios';

type PaymentProvider = 'mtn' | 'orange';

interface PaymentRequest {
  phone: string;
  amount: number;
  reference: string;
}

export async function processPayment(
  provider: PaymentProvider,
  paymentData: PaymentRequest
) {
  try {
    const response = await axios.post(
      `/api/payments/${provider}`,
      paymentData
    );
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: {
        data?: {
          error?: string;
        };
      };
      message?: string;
    };
    console.error(`Error processing ${provider} payment:`, error);
    return {
      success: false,
      error: axiosError.response?.data?.error || axiosError.message || 'An unknown error occurred',
    };
  }
}

// Example usage in a React component:
/*
const handlePayment = async () => {
  const result = await processPayment('mtn', {
    phone: '2376XXXXXXX', // User's phone number
    amount: 1000, // Amount in XAF
    reference: 'ORDER-123', // Your order reference
  });
  
  if (result.success) {
    // Payment initiated successfully
    console.log('Payment initiated:', result.data);
  } else {
    // Handle error
    console.error('Payment failed:', result.error);
  }
};
*/
