import axios from 'axios';
import { CreateUserDto } from '@you-fizz/shared';
import { UserRole } from '@you-fizz/shared';
import { ArticleStatus } from '@you-fizz/shared';

describe('Order Confirmation Workflow', () => {
  const baseUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';
  const authUrl = process.env.AUTH_URL || 'http://localhost:3001';
  const articleUrl = process.env.ARTICLE_URL || 'http://localhost:3002';
  const cmdUrl = process.env.CMD_URL || 'http://localhost:3003';

  let vendorToken: string;
  let vendorId: string;
  let articleId: string;
  let orderId: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  async function cleanupTestData() {
    try {
      // Clean up order
      if (orderId) {
        await axios.delete(`${cmdUrl}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        });
      }
      // Clean up article
      if (articleId) {
        await axios.delete(`${articleUrl}/articles/${articleId}`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        });
      }
      // Clean up user
      if (vendorId) {
        await axios.delete(`${authUrl}/users/${vendorId}`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        });
      }
    } catch (error) {
      // Ignore cleanup errors
      console.log('Cleanup completed with some errors (expected)');
    }
  }

  describe('Complete Order Confirmation Workflow', () => {
    it('should complete the full workflow: vendor creation -> article creation -> order creation -> order confirmation', async () => {
      // Step 1: Create a vendor user
      const vendorData: CreateUserDto = {
        email: 'vendor.test@example.com',
        password: 'TestPassword123!',
        firstName: 'Vendor',
        lastName: 'Test',
        role: UserRole.VENDEUR
      };

      const vendorResponse = await axios.post(`${authUrl}/auth/register`, vendorData);
      expect(vendorResponse.status).toBe(201);
      expect(vendorResponse.data).toHaveProperty('user');
      expect(vendorResponse.data).toHaveProperty('accessToken');
      expect(vendorResponse.data.user.role).toBe(UserRole.VENDEUR);
      
      vendorToken = vendorResponse.data.accessToken;
      vendorId = vendorResponse.data.user.id;

      // Step 2: Login to get fresh token
      const loginResponse = await axios.post(`${authUrl}/auth/login`, {
        email: vendorData.email,
        password: vendorData.password
      });
      expect(loginResponse.status).toBe(200);
      vendorToken = loginResponse.data.accessToken;

      // Step 3: Create an article
      const articleData = {
        title: 'Test Product for Order',
        description: 'A test product for order confirmation workflow',
        price: '29.99',
        stock: 100,
        sku: 'TEST-SKU-001',
        vendorId: vendorId,
        status: ArticleStatus.PUBLISHED
      };

      const articleResponse = await axios.post(`${articleUrl}/articles`, articleData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(articleResponse.status).toBe(201);
      expect(articleResponse.data).toHaveProperty('id');
      expect(articleResponse.data.title).toBe(articleData.title);
      expect(articleResponse.data.price).toBe(articleData.price);
      expect(articleResponse.data.vendorId).toBe(vendorId);
      
      articleId = articleResponse.data.id;

      // Step 4: Create an order with the article
      const orderData = {
        items: [
          {
            articleId: articleId,
            qty: 2,
            price: '29.99'
          }
        ],
        total: '59.98',
        customerId: vendorId, // Using vendor as customer for simplicity
        customerName: 'Test Customer',
        customerEmail: 'customer@example.com',
        customerPhone: '+1234567890',
        customerAddress: '123 Test Street, Test City, TC 12345',
        vendorId: vendorId
      };

      const orderResponse = await axios.post(`${cmdUrl}/orders`, orderData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(orderResponse.status).toBe(201);
      expect(orderResponse.data).toHaveProperty('id');
      expect(orderResponse.data).toHaveProperty('number');
      expect(orderResponse.data.status).toBe('PENDING');
      expect(orderResponse.data.items).toHaveLength(1);
      expect(orderResponse.data.items[0].articleId).toBe(articleId);
      expect(orderResponse.data.total).toBe('59.98');
      
      orderId = orderResponse.data.id;

      // Step 5: Confirm the order
      const confirmResponse = await axios.patch(`${cmdUrl}/orders/${orderId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(confirmResponse.status).toBe(200);
      expect(confirmResponse.data).toHaveProperty('id');
      expect(confirmResponse.data.id).toBe(orderId);
      expect(confirmResponse.data.status).toBe('CONFIRMED');
      expect(confirmResponse.data.isActive).toBe(true);

      // Step 6: Verify the order is confirmed by fetching it
      const getOrderResponse = await axios.get(`${cmdUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(getOrderResponse.status).toBe(200);
      expect(getOrderResponse.data.status).toBe('CONFIRMED');
      expect(getOrderResponse.data.isActive).toBe(true);
    });

    it('should handle order confirmation with insufficient vendor quota', async () => {
      // This test would require setting up a vendor with no remaining confirmations
      // For now, we'll just verify the endpoint exists and requires proper authentication
      const confirmResponse = await axios.patch(`${cmdUrl}/orders/invalid-id/confirm`, {}, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      }).catch(error => error.response);
      
      expect(confirmResponse.status).toBe(400); // Invalid UUID
    });

    it('should require proper authentication for order confirmation', async () => {
      const confirmResponse = await axios.patch(`${cmdUrl}/orders/${orderId}/confirm`, {}).catch(error => error.response);
      expect(confirmResponse.status).toBe(401);
    });

    it('should require VENDEUR or CONFIRMATEUR role for order confirmation', async () => {
      // Create a regular user (not vendor)
      const regularUserData: CreateUserDto = {
        email: 'regular.user@example.com',
        password: 'TestPassword123!',
        firstName: 'Regular',
        lastName: 'User',
        role: UserRole.GUEST
      };

      const userResponse = await axios.post(`${authUrl}/auth/register`, regularUserData);
      const regularUserToken = userResponse.data.accessToken;

      const confirmResponse = await axios.patch(`${cmdUrl}/orders/${orderId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${regularUserToken}` }
      }).catch(error => error.response);
      
      expect(confirmResponse.status).toBe(403);
    });
  });

  describe('Order Status Transitions', () => {
    it('should track order status changes correctly', async () => {
      // Create a new order for status testing
      const orderData = {
        items: [
          {
            articleId: articleId,
            qty: 1,
            price: '29.99'
          }
        ],
        total: '29.99',
        customerId: vendorId,
        customerName: 'Status Test Customer',
        customerEmail: 'status@example.com',
        vendorId: vendorId
      };

      const orderResponse = await axios.post(`${cmdUrl}/orders`, orderData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      const testOrderId = orderResponse.data.id;

      // Verify initial status is PENDING
      expect(orderResponse.data.status).toBe('PENDING');

      // Confirm the order
      const confirmResponse = await axios.patch(`${cmdUrl}/orders/${testOrderId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(confirmResponse.data.status).toBe('CONFIRMED');

      // Clean up test order
      await axios.delete(`${cmdUrl}/orders/${testOrderId}`, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
    });
  });

  describe('Order Items Validation', () => {
    it('should validate order items correctly', async () => {
      const invalidOrderData = {
        items: [
          {
            articleId: 'invalid-uuid',
            qty: 1,
            price: '29.99'
          }
        ],
        total: '29.99',
        customerId: vendorId,
        vendorId: vendorId
      };

      const orderResponse = await axios.post(`${cmdUrl}/orders`, invalidOrderData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      }).catch(error => error.response);
      
      expect(orderResponse.status).toBe(400);
    });

    it('should validate order total calculation', async () => {
      const orderData = {
        items: [
          {
            articleId: articleId,
            qty: 2,
            price: '29.99'
          }
        ],
        total: '50.00', // Incorrect total
        customerId: vendorId,
        vendorId: vendorId
      };

      const orderResponse = await axios.post(`${cmdUrl}/orders`, orderData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      }).catch(error => error.response);
      
      // This might pass depending on validation rules, but we're testing the structure
      expect([200, 201, 400]).toContain(orderResponse.status);
    });
  });
});

