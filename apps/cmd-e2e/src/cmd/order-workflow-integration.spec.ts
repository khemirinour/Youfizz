import axios from 'axios';

describe('Order Workflow Integration Tests', () => {
  const baseUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';
  const authUrl = process.env.AUTH_URL || 'http://localhost:3001';
  const articleUrl = process.env.ARTICLE_URL || 'http://localhost:3002';
  const cmdUrl = process.env.CMD_URL || 'http://localhost:3003';

  let vendorToken: string;
  let vendorId: string;
  let articleId: string;
  let orderId: string;

  beforeAll(async () => {
    // Wait for services to be ready
    await testUtils.waitForService(`${authUrl}/health`);
    await testUtils.waitForService(`${articleUrl}/health`);
    await testUtils.waitForService(`${cmdUrl}/health`);
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  async function cleanupTestData() {
    try {
      if (orderId && vendorToken) {
        await axios.delete(`${cmdUrl}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        });
      }
      if (articleId && vendorToken) {
        await axios.delete(`${articleUrl}/articles/${articleId}`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        });
      }
      if (vendorId && vendorToken) {
        await axios.delete(`${authUrl}/users/${vendorId}`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        });
      }
    } catch (error) {
      console.log('Cleanup completed with some errors (expected)');
    }
  }

  describe('Order Confirmation Workflow', () => {
    it('should complete the full order workflow', async () => {
      // Step 1: Create vendor user
      const vendorData = {
        email: `vendor.${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Vendor',
        lastName: 'Test',
        role: 'vendeur'
      };

      const vendorResponse = await axios.post(`${authUrl}/auth/register`, vendorData);
      expect(vendorResponse.status).toBe(201);
      expect(vendorResponse.data.user.role).toBe('vendeur');
      
      vendorToken = vendorResponse.data.accessToken;
      vendorId = vendorResponse.data.user.id;

      // Step 2: Create article
      const articleData = {
        title: `Test Product ${Date.now()}`,
        description: 'A test product for order workflow',
        price: '19.99',
        stock: 50,
        sku: `TEST-${Date.now()}`,
        vendorId: vendorId,
        status: 'PUBLISHED'
      };

      const articleResponse = await axios.post(`${articleUrl}/articles`, articleData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(articleResponse.status).toBe(201);
      expect(articleResponse.data.vendorId).toBe(vendorId);
      
      articleId = articleResponse.data.id;

      // Step 3: Create order
      const orderData = {
        items: [
          {
            articleId: articleId,
            qty: 1,
            price: '19.99'
          }
        ],
        total: '19.99',
        customerId: vendorId,
        customerName: 'Test Customer',
        customerEmail: 'customer@example.com',
        vendorId: vendorId
      };

      const orderResponse = await axios.post(`${cmdUrl}/orders`, orderData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(orderResponse.status).toBe(201);
      expect(orderResponse.data.status).toBe('PENDING');
      
      orderId = orderResponse.data.id;

      // Step 4: Confirm order
      const confirmResponse = await axios.patch(`${cmdUrl}/orders/${orderId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(confirmResponse.status).toBe(200);
      expect(confirmResponse.data.status).toBe('CONFIRMED');
      expect(confirmResponse.data.isActive).toBe(true);

      // Step 5: Verify order status
      const getOrderResponse = await axios.get(`${cmdUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(getOrderResponse.status).toBe(200);
      expect(getOrderResponse.data.status).toBe('CONFIRMED');
    });

    it('should handle authentication errors', async () => {
      const confirmResponse = await axios.patch(`${cmdUrl}/orders/invalid-id/confirm`, {}).catch(error => error.response);
      expect(confirmResponse.status).toBe(401);
    });

    it('should handle invalid order ID', async () => {
      const confirmResponse = await axios.patch(`${cmdUrl}/orders/invalid-uuid/confirm`, {}, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      }).catch(error => error.response);
      expect(confirmResponse.status).toBe(400);
    });
  });

  describe('Order Validation', () => {
    it('should validate order creation data', async () => {
      const invalidOrderData = {
        items: [], // Empty items
        total: '0.00',
        customerId: 'invalid-uuid',
        vendorId: 'invalid-uuid'
      };

      const orderResponse = await axios.post(`${cmdUrl}/orders`, invalidOrderData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      }).catch(error => error.response);
      
      expect(orderResponse.status).toBe(400);
    });

    it('should validate article creation data', async () => {
      const invalidArticleData = {
        title: '', // Empty title
        price: 'invalid-price',
        vendorId: 'invalid-uuid'
      };

      const articleResponse = await axios.post(`${articleUrl}/articles`, invalidArticleData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      }).catch(error => error.response);
      
      expect(articleResponse.status).toBe(400);
    });
  });
});

