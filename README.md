# You Fizz Monorepo

This is a microservices-based backend application built with [NestJS](https://nestjs.com/) in an [NX monorepo](https://nx.dev/) setup. It consists of four services: API Gateway, Auth, User, and Notification, with a shared library for common utilities.

## Overview

- **API Gateway** (port 3000): Entry point for HTTP requests, proxies to microservices via TCP.
- **Auth Service** (port 3001): Handles authentication (hybrid HTTP + microservice).
- **User Service** (port 3002): Manages user data (hybrid HTTP + microservice).
- **Notification Service** (port 3003): Sends notifications (hybrid HTTP + microservice).
- **Shared Library**: Common module for reusable code.

The services communicate via TCP microservices protocol. Swagger API documentation is enabled for each service.

## Prerequisites

- Node.js (v18+)
- NX CLI (included as dependency)

## Installation

1. Clone the repository:
   ```
   git clone https://gitlab.com/wassim.dallaliii-group/you_fizz.git
   cd you_fizz
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

Due to NX configuration, run services individually in separate terminals:

1. Start API Gateway:
   ```
   nx serve api-gateway
   ```
   - HTTP: http://localhost:3000/api
   - Swagger: http://localhost:3000/api-docs

2. Start Auth Service:
   ```
   nx serve auth
   ```
   - HTTP: http://localhost:3001/api
   - Microservice: TCP port 3001
   - Swagger: http://localhost:3001/api-docs

3. Start User Service:
   ```
   nx serve user
   ```
   - HTTP: http://localhost:3002/api
   - Microservice: TCP port 3002
   - Swagger: http://localhost:3002/api-docs

4. Start Notification Service:
   ```
   nx serve notification
   ```
   - HTTP: http://localhost:3003/api
   - Microservice: TCP port 3003
   - Swagger: http://localhost:3003/api-docs

All services should log "Application is running" and "Swagger docs available".

## API Endpoints

Currently, only a basic GET `/api` endpoint exists on each service (returns "Welcome to [Service]!"). Expand controllers with @nestjs/swagger decorators for detailed docs.

## Project Structure

- `apps/`: Application services and e2e tests
  - `api-gateway/`: Gateway app
  - `auth/`: Auth microservice/app
  - `user/`: User microservice/app
  - `notification/`: Notification microservice/app
- `libs/shared/`: Shared utilities and modules
- `nx.json`, `package.json`: Monorepo config

## Development

- Use `nx run <project>:<target>` for build, test, etc.
- Lint: `nx lint <project>`
- Test: `nx test <project>`
- E2E: `nx e2e <project>-e2e`

## Troubleshooting

- Build errors: Ensure webpack aliases and tsconfig paths are set (already configured for @you-fizz/shared).
- Port conflicts: Change ports in `main.ts` if needed.
- run-many command: If `nx run-many --target=serve --projects=api-gateway,auth,user,notification` works after updates, use it for parallel start.

For contributions, see GitLab repo guidelines.










for wassim
$env:DB_HOST="localhost"; $env:DB_PORT="5432"; $env:DB_USERNAME="postgres"; $env:DB_PASSWORD="password"; $env:DB_NAME="you_fizz"; $env:NODE_ENV="development"; npx nx run-many --target=serve --all --parallel
