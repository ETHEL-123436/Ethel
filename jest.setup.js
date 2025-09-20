// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

// Mock environment variables
process.env.ORANGE_MONEY_AUTH_TOKEN = 'test_auth_token';
process.env.ORANGE_MONEY_MERCHANT_KEY = 'test_merchant_key';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
