import { execSync } from 'child_process';

export default async function globalTeardown() {
  console.log('🧹 Starting CMD E2E tests global teardown...');
  
  try {
    // Stop all services
    console.log('🛑 Stopping services...');
    
    // Kill any running processes
    try {
      execSync('pkill -f "nx serve"', { stdio: 'ignore' });
    } catch (error) {
      // Ignore errors if no processes are running
    }
    
    console.log('✅ Global teardown completed');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid masking test failures
  }
}

