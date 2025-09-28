const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up You Fizz development environment...\n');

// Create .env file if it doesn't exist
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file...');
  const envContent = `# API Gateway
PORT=3000
AUTH_SERVICE_HOST=localhost
AUTH_SERVICE_PORT=3001
USER_SERVICE_HOST=localhost
USER_SERVICE_PORT=3002
NOTIFICATION_SERVICE_HOST=localhost
NOTIFICATION_SERVICE_PORT=3003

# Auth Service
AUTH_SERVICE_HOST=localhost
AUTH_SERVICE_PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=auth_db
JWT_SECRET=your-super-secret-jwt-key-here

# User Service
USER_SERVICE_HOST=localhost
USER_SERVICE_PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=user_db

# Notification Service
NOTIFICATION_SERVICE_HOST=localhost
NOTIFICATION_SERVICE_PORT=3003
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=notification_db

# Database
POSTGRES_PASSWORD=password
POSTGRES_DB=auth_db`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created successfully!\n');
} else {
  console.log('✅ .env file already exists\n');
}

console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

console.log('🏗️  Building all services...');
try {
  execSync('npm run build:all', { stdio: 'inherit' });
  console.log('✅ All services built successfully!\n');
} catch (error) {
  console.error('❌ Error building services:', error.message);
  process.exit(1);
}

console.log('🎉 Setup complete! You can now:');
console.log('   • Start all services: npm run serve:all');
console.log('   • Start with Docker: docker-compose up -d');
console.log('   • Access API Gateway: http://localhost:3000');
console.log('   • View Swagger docs: http://localhost:3000/api');
