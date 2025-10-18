#!/bin/bash

# Order Confirmation Workflow Test Runner
# This script helps run the order confirmation workflow tests

echo "🚀 Starting Order Confirmation Workflow Tests"
echo "=============================================="

# Check if services are running
echo "🔍 Checking service health..."

services=(
  "http://localhost:3001/auth/health"
  "http://localhost:3002/articles/health" 
  "http://localhost:3003/orders/health"
)

for service in "${services[@]}"; do
  if curl -s "$service" > /dev/null; then
    echo "✅ Service at $service is running"
  else
    echo "❌ Service at $service is not responding"
    echo "Please start the required services first:"
    echo "  nx serve auth"
    echo "  nx serve article" 
    echo "  nx serve cmd"
    exit 1
  fi
done

echo ""
echo "🧪 Running order confirmation workflow tests..."
echo ""

# Run the tests
nx e2e cmd-e2e --testPathPattern=simple-order-workflow --verbose

echo ""
echo "✅ Test execution completed!"

