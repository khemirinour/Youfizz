# You Fizz - Nx Monorepo with NestJS Microservices

A modern microservices architecture built with Nx monorepo and NestJS, featuring an API Gateway and multiple microservices.

## 🏗️ Architecture

This monorepo contains:

- **API Gateway** (Port 3000) - Main entry point with Swagger documentation
- **Auth Service** (Port 3001) - Authentication and user management
- **User Service** (Port 3002) - User profile management
- **Notification Service** (Port 3003) - Notification handling
- **Shared Libraries** - Common interfaces, DTOs, and utilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd you-fizz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

### Development

#### Run all services locally
```bash
# Start all microservices
npm run serve:all

# Or start individual services
npm run serve:api-gateway
npm run serve:auth
npm run serve:user
npm run serve:notification
```

#### Build all services
```bash
npm run build:all
```

#### Run tests
```bash
npm run test:all
```

#### Lint all services
```bash
npm run lint:all
```

### Docker Deployment

#### Using Docker Compose
```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📚 API Documentation

Once the API Gateway is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run serve` | Start the default service |
| `npm run serve:all` | Start all services in parallel |
| `npm run build` | Build the default service |
| `npm run build:all` | Build all services |
| `npm run test` | Test the default service |
| `npm run test:all` | Test all services |
| `npm run lint` | Lint the default service |
| `npm run lint:all` | Lint all services |

## 🏛️ Project Structure

```
you_fizz/
├── apps/
│   ├── api-gateway/          # Main API Gateway
│   ├── auth-service/         # Authentication service
│   ├── user-service/         # User management service
│   └── notification-service/ # Notification service
├── libs/
│   ├── shared/               # Shared interfaces and DTOs
│   └── common/               # Common utilities and guards
├── docker-compose.yml        # Docker orchestration
└── package.json             # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API Gateway port | 3000 |
| `AUTH_SERVICE_HOST` | Auth service host | localhost |
| `AUTH_SERVICE_PORT` | Auth service port | 3001 |
| `USER_SERVICE_HOST` | User service host | localhost |
| `USER_SERVICE_PORT` | User service port | 3002 |
| `NOTIFICATION_SERVICE_HOST` | Notification service host | localhost |
| `NOTIFICATION_SERVICE_PORT` | Notification service port | 3003 |

### Service Communication

Services communicate using TCP transport with message patterns:
- `auth.*` - Authentication operations
- `user.*` - User management operations
- `notification.*` - Notification operations

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Run tests for specific service
nx test api-gateway
nx test auth-service
nx test user-service
nx test notification-service
```

## 📦 Building for Production

```bash
# Build all services
npm run build:all

# Build specific service
nx build api-gateway
nx build auth-service
```

## 🚀 Deployment

### Docker
```bash
# Build and start all services
docker-compose up --build -d

# Scale specific service
docker-compose up --scale auth-service=3 -d
```

### Manual Deployment
1. Build all services: `npm run build:all`
2. Start each service: `node dist/apps/{service-name}/main.js`
3. Ensure all environment variables are set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@youfizz.com or create an issue in the repository.