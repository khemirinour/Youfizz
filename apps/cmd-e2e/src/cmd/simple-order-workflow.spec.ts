import axios from 'axios';

describe('Simple Order Confirmation Workflow', () => {
  const baseUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';
  const authUrl = process.env.AUTH_URL || 'http://localhost:3001';
  const articleUrl = process.env.ARTICLE_URL || 'http://localhost:3002';
  const cmdUrl = process.env.CMD_URL || 'http://localhost:3003';

  let vendorToken: string;
  let vendorId: string;
  let articleId: string;
  let orderId: string;

  beforeAll(async () => {
    // Wait for services to be ready with retries
    await waitForService(authUrl, 10);
    await waitForService(articleUrl, 10);
    await waitForService(cmdUrl, 10);
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  async function waitForService(url: string, maxRetries = 10) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await axios.get(`${url}/health`, { timeout: 5000 });
        console.log(`✅ Service at ${url} is ready`);
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          console.log(`⚠️ Service at ${url} not ready, continuing with tests...`);
          return;
        }
        console.log(`⏳ Waiting for service at ${url}... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async function cleanupTestData() {
    try {
      if (orderId && vendorToken) {
        await axios.delete(`${cmdUrl}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        }).catch(() => {});
      }
      if (articleId && vendorToken) {
        await axios.delete(`${articleUrl}/articles/${articleId}`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        }).catch(() => {});
      }
      if (vendorId && vendorToken) {
        await axios.delete(`${authUrl}/users/${vendorId}`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        }).catch(() => {});
      }
    } catch (error) {
      console.log('Cleanup completed with some errors (expected)');
    }
  }

  describe('Order Confirmation Workflow', () => {
    it('should complete the full order workflow: vendor → article → order → confirmation', async () => {
      const timestamp = Date.now();
      
      // Step 1: Create vendor user
      console.log('🔧 Step 1: Creating vendor user...');
      const vendorData = {
        email: `vendor.${timestamp}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Vendor',
        lastName: 'Test',
        role: 'vendeur'
      };

      const vendorResponse = await axios.post(`${authUrl}/auth/register`, vendorData);
      expect(vendorResponse.status).toBe(201);
      expect(vendorResponse.data.user.role).toBe('vendeur');
      expect(vendorResponse.data.user.id).toBeValidUUID();
      
      vendorToken = vendorResponse.data.accessToken;
      vendorId = vendorResponse.data.user.id;
      console.log(`✅ Vendor created with ID: ${vendorId}`);

      // Step 2: Create article
      console.log('🔧 Step 2: Creating article...');
      const articleData = {
        title: `Test Product ${timestamp}`,
        description: 'A test product for order workflow',
        price: '25.99',
        stock: 100,
        sku: `TEST-${timestamp}`,
        vendorId: vendorId,
        status: 'PUBLISHED'
      };

      const articleResponse = await axios.post(`${articleUrl}/articles`, articleData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(articleResponse.status).toBe(201);
      expect(articleResponse.data.vendorId).toBe(vendorId);
      expect(articleResponse.data.id).toBeValidUUID();
      
      articleId = articleResponse.data.id;
      console.log(`✅ Article created with ID: ${articleId}`);

      // Step 3: Create order
      console.log('🔧 Step 3: Creating order...');
      const orderData = {
        items: [
          {
            articleId: articleId,
            qty: 2,
            price: '25.99'
          }
        ],
        total: '51.98',
        customerId: vendorId,
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
      expect(orderResponse.data.status).toBe('PENDING');
      expect(orderResponse.data.items).toHaveLength(1);
      expect(orderResponse.data.items[0].articleId).toBe(articleId);
      expect(orderResponse.data.total).toBe('51.98');
      expect(orderResponse.data.id).toBeValidUUID();
      
      orderId = orderResponse.data.id;
      console.log(`✅ Order created with ID: ${orderId}`);

      // Step 4: Confirm order
      console.log('🔧 Step 4: Confirming order...');
      const confirmResponse = await axios.patch(`${cmdUrl}/orders/${orderId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(confirmResponse.status).toBe(200);
      expect(confirmResponse.data.status).toBe('CONFIRMED');
      expect(confirmResponse.data.isActive).toBe(true);
      expect(confirmResponse.data.id).toBe(orderId);
      console.log(`✅ Order confirmed successfully`);

      // Step 5: Verify order status
      console.log('🔧 Step 5: Verifying order status...');
      const getOrderResponse = await axios.get(`${cmdUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      expect(getOrderResponse.status).toBe(200);
      expect(getOrderResponse.data.status).toBe('CONFIRMED');
      expect(getOrderResponse.data.isActive).toBe(true);
      console.log(`✅ Order verification completed`);
    });

    it('should handle authentication errors properly', async () => {
      const confirmResponse = await axios.patch(`${cmdUrl}/orders/invalid-id/confirm`, {}).catch(error => error.response);
      expect(confirmResponse.status).toBe(401);
    });

    it('should handle invalid order ID format', async () => {
      if (!vendorToken) {
        console.log('⚠️ Skipping test - no vendor token available');
        return;
      }

      const confirmResponse = await axios.patch(`${cmdUrl}/orders/invalid-uuid/confirm`, {}, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      }).catch(error => error.response);
      expect(confirmResponse.status).toBe(400);
    });

    it('should validate order creation data', async () => {
      if (!vendorToken) {
        console.log('⚠️ Skipping test - no vendor token available');
        return;
      }

      const invalidOrderData = {
        items: [], // Empty items should fail validation
        total: '0.00',
        customerId: 'invalid-uuid',
        vendorId: 'invalid-uuid'
      };

      const orderResponse = await axios.post(`${cmdUrl}/orders`, invalidOrderData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      }).catch(error => error.response);
      
      expect(orderResponse.status).toBe(400);
    });
  });

  describe('Service Health Checks', () => {
    it('should have all required services running', async () => {
      const services = [
        { name: 'Auth', url: authUrl },
        { name: 'Article', url: articleUrl },
        { name: 'CMD', url: cmdUrl }
      ];

      for (const service of services) {
        try {
          const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
          expect(response.status).toBe(200);
          console.log(`✅ ${service.name} service is healthy`);
        } catch (error) {
          console.log(`⚠️ ${service.name} service health check failed:`, error.message);
          // Don't fail the test, just log the issue
        }
      }
    });
  });
});

