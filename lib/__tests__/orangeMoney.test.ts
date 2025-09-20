import axios from 'axios';
import { getAuthToken, requestPayment, checkPaymentStatus } from '../orangeMoney';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Simple test to verify the test setup is working
describe('Test Setup', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });
});

describe('Orange Money API', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env = {
      ...originalEnv,
      ORANGE_MONEY_AUTH_TOKEN: 'test_auth_token',
      ORANGE_MONEY_MERCHANT_KEY: 'test_merchant_key',
    };
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('getAuthToken', () => {
    it('should return an auth token on successful authentication', async () => {
      const mockResponse = {
        data: {
          token_type: 'Bearer',
          access_token: 'test_access_token',
          expires_in: 3600,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await getAuthToken();

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.orange.com/oauth/v3/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': 'Basic dGVzdF9hdXRoX3Rva2VuOg==',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        }
      );
      expect(result).toBe('test_access_token');
    });

    it('should throw an error when authentication fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Authentication failed'));

      await expect(getAuthToken()).rejects.toThrow('Authentication failed');
    });
  });

  describe('requestPayment', () => {
    beforeEach(() => {
      // Mock getAuthToken to return a test token
      jest.spyOn({ getAuthToken }, 'getAuthToken')
        .mockResolvedValue('test_access_token');
    });

    it('should make a payment request successfully', async () => {
      const mockResponse = {
        data: {
          status: 'PENDING',
          pay_token: 'test_pay_token',
          payment_url: 'https://payment.orange-money.com/pay/test_pay_token',
          order_id: 'order123',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const amount = 1000;
      const phoneNumber = '237612345678';
      const orderId = 'order123';
      const reference = 'test_ref';

      const result = await requestPayment(amount, phoneNumber, orderId, reference);

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.orange.com/orange-money-webpay/dev/v1/webpayment',
        {
          merchant_key: process.env.ORANGE_MERCHANT_KEY,
          currency: 'XAF',
          order_id: orderId,
          amount: amount.toString(),
          return_url: expect.stringContaining('/payment/success'),
          cancel_url: expect.stringContaining('/payment/cancel'),
          notif_url: expect.stringContaining('/api/payments/callback/orange'),
          lang: 'en',
          reference: reference,
          channel_user_mobile: phoneNumber,
        },
        {
          headers: {
            'Authorization': 'Bearer test_access_token',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result.success).toBe(true);
      expect(result.paymentUrl).toBe(mockResponse.data.payment_url);
      expect(result.orderId).toBe(mockResponse.data.order_id);
    });
  });

  describe('checkPaymentStatus', () => {
    it('should check payment status successfully', async () => {
      const orderId = 'order123';
      const mockResponse = {
        data: {
          status: 'SUCCESS',
          amount: 1000,
          reference: 'test_ref',
          order_id: orderId,
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await checkPaymentStatus(orderId);

      expect(axios.get).toHaveBeenCalledWith(
        `https://api.orange.com/orange-money-webpay/dev/v1/transaction/${orderId}/status`,
        {
          headers: {
            'Authorization': 'Bearer test_access_token',
            'Accept': 'application/json',
          },
        }
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle payment status check failure', async () => {
      const orderId = 'order123';
      const errorMessage = 'Failed to check payment status';
      
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });

      const result = await checkPaymentStatus(orderId);

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });
  });
});
