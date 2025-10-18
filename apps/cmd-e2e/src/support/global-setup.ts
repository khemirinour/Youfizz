import { execSync } from 'child_process';

export default async function globalSetup() {
  console.log('🚀 Starting CMD E2E tests global setup...');
  
  try {
    // Start the required services
    console.log('📦 Starting services...');
    
    // Start auth service
    execSync('nx serve auth', { stdio: 'inherit' });
    
    // Start article service  
    execSync('nx serve article', { stdio: 'inherit' });
    
    // Start cmd service
    execSync('nx serve cmd', { stdio: 'inherit' });
    
    // Wait for services to be ready
    console.log('⏳ Waiting for services to be ready...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('✅ Global setup completed');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

