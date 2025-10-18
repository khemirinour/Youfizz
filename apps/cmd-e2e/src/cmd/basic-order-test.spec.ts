import axios from 'axios';

describe('Basic Order Confirmation Test', () => {
  const authUrl = process.env.AUTH_URL || 'http://localhost:3001';
  const articleUrl = process.env.ARTICLE_URL || 'http://localhost:3002';
  const cmdUrl = process.env.CMD_URL || 'http://localhost:3003';

  let vendorToken: string;
  let vendorId: string;
  let articleId: string;
  let orderId: string;

  beforeAll(async () => {
    // Simple health check - don't fail if services aren't ready
    try {
      await Promise.all([
        axios.get(`${authUrl}/health`, { timeout: 2000 }),
        axios.get(`${articleUrl}/health`, { timeout: 2000 }),
        axios.get(`${cmdUrl}/health`, { timeout: 2000 })
      ]);
      console.log('✅ All services are ready');
    } catch (error) {
      console.log('⚠️ Some services may not be ready, continuing with tests...');
    }
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
      // Ignore cleanup errors
    }
  }

  describe('Order Confirmation Workflow', () => {
    it('should complete the order confirmation workflow', async () => {
      const timestamp = Date.now();
      
      try {
        // Step 1: Create vendor user
        console.log('🔧 Creating vendor user...');
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
        
        vendorToken = vendorResponse.data.accessToken;
        vendorId = vendorResponse.data.user.id;
        console.log(`✅ Vendor created: ${vendorId}`);

        // Step 2: Create article
        console.log('🔧 Creating article...');
        const articleData = {
          title: `Test Product ${timestamp}`,
          description: 'Test product for order workflow',
          price: '19.99',
          stock: 50,
          sku: `TEST-${timestamp}`,
          vendorId: vendorId,
          status: 'PUBLISHED'
        };

        const articleResponse = await axios.post(`${articleUrl}/articles`, articleData, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        });
        expect(articleResponse.status).toBe(201);
        expect(articleResponse.data.vendorId).toBe(vendorId);
        
        articleId = articleResponse.data.id;
        console.log(`✅ Article created: ${articleId}`);

        // Step 3: Create order
        console.log('🔧 Creating order...');
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
        console.log(`✅ Order created: ${orderId}`);

        // Step 4: Confirm order
        console.log('🔧 Confirming order...');
        const confirmResponse = await axios.patch(`${cmdUrl}/orders/${orderId}/confirm`, {}, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        });
        expect(confirmResponse.status).toBe(200);
        expect(confirmResponse.data.status).toBe('CONFIRMED');
        expect(confirmResponse.data.isActive).toBe(true);
        console.log(`✅ Order confirmed successfully`);

        // Step 5: Verify final state
        console.log('🔧 Verifying final state...');
        const getOrderResponse = await axios.get(`${cmdUrl}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        });
        expect(getOrderResponse.status).toBe(200);
        expect(getOrderResponse.data.status).toBe('CONFIRMED');
        console.log(`✅ Order verification completed`);

      } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
        }
        throw error;
      }
    });

    it('should handle authentication errors', async () => {
      const response = await axios.patch(`${cmdUrl}/orders/invalid-id/confirm`, {}).catch(error => error.response);
      expect(response.status).toBe(401);
    });

    it('should validate order data', async () => {
      if (!vendorToken) {
        console.log('⚠️ Skipping - no vendor token');
        return;
      }

      const invalidData = {
        items: [],
        total: '0.00',
        customerId: 'invalid'
      };

      const response = await axios.post(`${cmdUrl}/orders`, invalidData, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      }).catch(error => error.response);
      
      expect(response.status).toBe(400);
    });
  });
});
