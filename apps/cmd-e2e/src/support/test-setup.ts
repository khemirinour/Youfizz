// Test setup for CMD E2E tests
import axios from 'axios';

// Set default timeout for all tests
jest.setTimeout(30000);

// Configure axios defaults
axios.defaults.timeout = 10000;

// Add request/response interceptors for debugging
axios.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error.message);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.response?.status || 'Network Error'} ${error.config?.url}:`, error.message);
    return Promise.reject(error);
  }
);

// Global test utilities
global.testUtils = {
  async waitForService(url: string, maxRetries = 30, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await axios.get(url);
        console.log(`✅ Service at ${url} is ready`);
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw new Error(`Service at ${url} failed to start after ${maxRetries} attempts`);
        }
        console.log(`⏳ Waiting for service at ${url}... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
};

// Extend Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid UUID`,
      pass,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
    }
  }
  
  var testUtils: {
    waitForService(url: string, maxRetries?: number, delay?: number): Promise<void>;
  };
}

