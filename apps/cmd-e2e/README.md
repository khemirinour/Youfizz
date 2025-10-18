# CMD E2E Tests

This directory contains end-to-end tests for the Command (CMD) service, specifically testing the order confirmation workflow.

## Test Files

### `order-confirmation-workflow.spec.ts`
Comprehensive test suite that covers the complete order confirmation workflow:
1. **Vendor User Creation** - Creates a user with VENDEUR role
2. **Article Creation** - Creates a product that can be ordered
3. **Order Creation** - Creates an order with the article
4. **Order Confirmation** - Confirms the order using vendor permissions

### `order-workflow-integration.spec.ts`
Simplified integration tests that focus on the core workflow without complex service orchestration.

## Test Scenarios

### Order Confirmation Workflow
- ✅ Complete workflow: vendor → article → order → confirmation
- ✅ Authentication requirements
- ✅ Role-based access control (VENDEUR/CONFIRMATEUR only)
- ✅ Order status transitions (PENDING → CONFIRMED)
- ✅ Data validation and error handling

### Security Tests
- ✅ Unauthorized access prevention
- ✅ Invalid token handling
- ✅ Role-based permission enforcement

### Data Validation
- ✅ Order item validation
- ✅ Article creation validation
- ✅ User registration validation
- ✅ Order total calculation

## Running the Tests

### Prerequisites
1. All services must be running:
   - Auth service (port 3001)
   - Article service (port 3002)
   - CMD service (port 3003)
   - API Gateway (port 3000)

2. Databases must be initialized and accessible

### Run All CMD E2E Tests
```bash
nx e2e cmd-e2e
```

### Run Specific Test File
```bash
nx e2e cmd-e2e --testPathPattern=order-confirmation-workflow
nx e2e cmd-e2e --testPathPattern=order-workflow-integration
```

### Run with Verbose Output
```bash
nx e2e cmd-e2e --verbose
```

## Environment Variables

The tests use the following environment variables (with defaults):
- `API_GATEWAY_URL` - API Gateway base URL (default: http://localhost:3000)
- `AUTH_URL` - Auth service URL (default: http://localhost:3001)
- `ARTICLE_URL` - Article service URL (default: http://localhost:3002)
- `CMD_URL` - CMD service URL (default: http://localhost:3003)

## Test Data Cleanup

All tests include automatic cleanup of test data:
- Test users are deleted after tests
- Test articles are removed
- Test orders are cleaned up

## Expected Test Flow

1. **Setup**: Services are started and health checks pass
2. **Vendor Creation**: A user with VENDEUR role is created and authenticated
3. **Article Creation**: A test product is created by the vendor
4. **Order Creation**: An order is created with the test article
5. **Order Confirmation**: The vendor confirms the order
6. **Verification**: Order status is verified as CONFIRMED
7. **Cleanup**: All test data is removed

## Troubleshooting

### Common Issues

1. **Service Not Ready**: Ensure all services are running and accessible
2. **Database Connection**: Check database connectivity and migrations
3. **Authentication**: Verify JWT token generation and validation
4. **Port Conflicts**: Ensure no other services are using the required ports

### Debug Mode

To run tests in debug mode with detailed logging:
```bash
DEBUG=* nx e2e cmd-e2e
```

### Test Timeout

If tests timeout, increase the timeout in `jest.config.ts`:
```typescript
testTimeout: 60000, // 60 seconds
```

