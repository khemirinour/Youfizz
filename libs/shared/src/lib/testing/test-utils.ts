import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module';

export class TestUtils {
  static async createTestingModule(moduleMetadata: any): Promise<TestingModule> {
    return Test.createTestingModule({
      ...moduleMetadata,
      imports: [
        ...(moduleMetadata.imports || []),
        AppConfigModule,
      ],
    }).compile();
  }

  static async createTestApp(module: TestingModule): Promise<INestApplication> {
    const app = module.createNestApplication();
    
    // Apply global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();
    return app;
  }

  static async closeTestApp(app: INestApplication): Promise<void> {
    await app.close();
  }

  // Mock data generators
  static generateMockUser(overrides: Partial<any> = {}) {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'guest',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static generateMockEmailData(overrides: Partial<any> = {}) {
    return {
      email: 'test@example.com',
      firstName: 'Test',
      ...overrides,
    };
  }

  static generateMockPasswordResetData(overrides: Partial<any> = {}) {
    return {
      email: 'test@example.com',
      resetToken: 'mock-reset-token-123',
      firstName: 'Test',
      ...overrides,
    };
  }

  // Database test utilities
  static async clearDatabase(app: INestApplication): Promise<void> {
    // This would be implemented based on your database setup
    // For now, it's a placeholder
  }

  static async seedTestData(app: INestApplication): Promise<void> {
    // This would be implemented based on your seeding needs
    // For now, it's a placeholder
  }
}

