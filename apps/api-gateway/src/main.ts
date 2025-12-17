/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable trust proxy to get real client IP from X-Forwarded-For header
  // This is essential for rate limiting to work correctly behind load balancers/proxies
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  instance.set('trust proxy', true);
  
  // Enable cookie parser middleware to read cookies from requests
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());
  
  // Determine Next.js frontend URL
  // If FRONTEND_URL points to the same port as API Gateway, use port 4200 instead
  const gatewayPort = 3000;
  const frontendUrlEnv = process.env.FRONTEND_URL || 'http://localhost:4200';
  let frontendUrl = frontendUrlEnv;
  
  // Check if FRONTEND_URL points to the same port as the gateway (would cause redirect loop)
  if (frontendUrlEnv.includes(`:${gatewayPort}`) || frontendUrlEnv.includes(':3000')) {
    // Use default Next.js port instead
    frontendUrl = 'http://localhost:4200';
    Logger.warn(`FRONTEND_URL points to gateway port (${gatewayPort}), using port 4200 for Next.js proxy instead`);
  }
  
  Logger.log(`Frontend proxy target: ${frontendUrl}`);
  
  // Proxy non-API routes to Next.js frontend
  app.use(async (req: any, res: any, next: any) => {
    const path = req.path;
    // Only proxy if it's not an API route, health check, or Swagger docs
    if (!path.startsWith('/api') && path !== '/health' && !path.startsWith('/api-docs')) {
      try {
        const targetUrl = new URL(req.url, frontendUrl);
        const client = targetUrl.protocol === 'https:' ? https : http;
        
        const options = {
          hostname: targetUrl.hostname,
          port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
          path: targetUrl.pathname + targetUrl.search,
          method: req.method,
          headers: {
            ...req.headers,
            host: targetUrl.host,
            'x-forwarded-for': req.ip || req.connection.remoteAddress,
            'x-forwarded-proto': req.protocol || 'http',
            'x-forwarded-host': req.get('host'),
          },
        };
        
        const proxyReq = client.request(options, (proxyRes) => {
          // Copy status code
          res.statusCode = proxyRes.statusCode || 200;
          
          // Copy headers
          Object.keys(proxyRes.headers).forEach((key) => {
            const value = proxyRes.headers[key];
            if (value) {
              if (Array.isArray(value)) {
                res.setHeader(key, value);
              } else {
                res.setHeader(key, value);
              }
            }
          });
          
          // Pipe the response
          proxyRes.pipe(res);
        });
        
        proxyReq.on('error', (err) => {
          Logger.error(`Proxy error for ${req.url}: ${err.message}`);
          if (!res.headersSent) {
            res.status(502).json({
              message: 'Frontend service unavailable. Please ensure Next.js is running.',
              error: 'Bad Gateway',
              statusCode: 502,
            });
          }
        });
        
        // Pipe the request body (works for both GET and POST requests)
        req.pipe(proxyReq);
        
        // Handle request errors
        req.on('error', (err) => {
          Logger.error(`Request error: ${err.message}`);
          if (!res.headersSent) {
            proxyReq.destroy();
            res.status(500).json({
              message: 'Request error',
              error: 'Internal Server Error',
              statusCode: 500,
            });
          }
        });
        
        // Don't call next() - we're handling the request via proxy
        return;
      } catch (error: any) {
        Logger.error(`Proxy setup error: ${error.message}`);
        if (!res.headersSent) {
          res.status(502).json({
            message: 'Frontend service unavailable',
            error: 'Bad Gateway',
            statusCode: 502,
          });
        }
        return;
      }
    }
    next();
  });
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3006',
      'http://127.0.0.1:3000',
      'http://localhost:4200',
      'http://127.0.0.1:4200',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true, // Required for cookies
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = new DocumentBuilder()
    .setTitle('You Fizz API Gateway')
    .setDescription('Central API Gateway for You Fizz microservices architecture. Provides unified access to all backend services including authentication, articles, orders, users, notifications, and statistics.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('auth', 'Authentication and user management endpoints')
    .addTag('articles', 'Article management endpoints')
    .addTag('orders', 'Order/Command management endpoints')
    .addTag('profile', 'User profile endpoints')
    .addTag('notifications', 'Notification endpoints')
    .addTag('statistics', 'Statistics and analytics endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📖 Swagger docs available on: http://localhost:${port}/${globalPrefix}-docs`
  );
}

bootstrap();
