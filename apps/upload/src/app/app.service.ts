import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as MinIO from 'minio';
import { FileValidator } from './file-validator';
import { UploadResponseDto } from '../dto/upload-file.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private minioClient: MinIO.Client;
  private readonly defaultBucket: string;

  constructor(private configService: ConfigService) {
    const minioConfig = this.configService.get('minio');
    this.defaultBucket = minioConfig.bucketName;

    this.minioClient = new MinIO.Client({
      endPoint: minioConfig.endpoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    });

    // Initialize buckets on startup
    this.initializeBuckets();
  }

  private async initializeBuckets() {
    const buckets = [
      'youfizz-articles',
      'youfizz-users',
      'youfizz-categories',
    ];

    for (const bucket of buckets) {
      try {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
          await this.minioClient.makeBucket(bucket);
          this.logger.log(`Created bucket: ${bucket}`);
        }
      } catch (error) {
        this.logger.error(`Error initializing bucket ${bucket}:`, error);
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: string = this.defaultBucket,
    folder?: string
  ): Promise<UploadResponseDto> {
    // Validate file
    const validation = FileValidator.validateFile(file);
    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    // Ensure bucket exists
    await this.ensureBucketExists(bucket);

    // Generate unique filename
    const uniqueFilename = FileValidator.generateUniqueFilename(file.originalname);
    const objectName = FileValidator.buildObjectPath(folder, uniqueFilename);

    try {
      // Upload to MinIO
      await this.minioClient.putObject(
        bucket,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        }
      );

      // Generate public URL (use presigned URL for now, can switch to public URL if bucket policy allows)
      const url = this.getPublicUrl(bucket, objectName);

      this.logger.log(`File uploaded successfully: ${bucket}/${objectName}`);

      return {
        url,
        filename: uniqueFilename,
        objectName,
        size: file.size,
        mimeType: file.mimetype,
        bucket,
      };
    } catch (error) {
      this.logger.error(`Error uploading file:`, error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    bucket: string = this.defaultBucket,
    folder?: string
  ): Promise<UploadResponseDto[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, bucket, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(bucket: string, objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucket, objectName);
      this.logger.log(`File deleted successfully: ${bucket}/${objectName}`);
    } catch (error) {
      this.logger.error(`Error deleting file:`, error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async getFileUrl(bucket: string, objectName: string, expiresIn: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      // Generate presigned URL (expires in 7 days by default)
      const url = await this.minioClient.presignedGetObject(bucket, objectName, expiresIn);
      return url;
    } catch (error) {
      this.logger.error(`Error generating file URL:`, error);
      throw new InternalServerErrorException('Failed to generate file URL');
    }
  }

  getPublicUrl(bucket: string, objectName: string): string {
    const minioConfig = this.configService.get('minio');
    const protocol = minioConfig.useSSL ? 'https' : 'http';
    return `${protocol}://${minioConfig.endpoint}:${minioConfig.port}/${bucket}/${objectName}`;
  }

  async listFiles(bucket: string, prefix?: string): Promise<string[]> {
    try {
      const objectsList: string[] = [];
      const stream = this.minioClient.listObjects(bucket, prefix, true);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          if (obj.name) {
            objectsList.push(obj.name);
          }
        });

        stream.on('end', () => {
          resolve(objectsList);
        });

        stream.on('error', (err) => {
          reject(err);
        });
      });
    } catch (error) {
      this.logger.error(`Error listing files:`, error);
      throw new InternalServerErrorException('Failed to list files');
    }
  }

  private async ensureBucketExists(bucket: string): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(bucket);
      if (!exists) {
        await this.minioClient.makeBucket(bucket);
        this.logger.log(`Created bucket: ${bucket}`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket exists:`, error);
      throw new InternalServerErrorException('Failed to ensure bucket exists');
    }
  }

  async healthCheck(): Promise<{ status: string; minio: string }> {
    try {
      // Try to list buckets to check connectivity
      await this.minioClient.listBuckets();
      return {
        status: 'ok',
        minio: 'connected',
      };
    } catch (error) {
      this.logger.error('MinIO health check failed:', error);
      return {
        status: 'error',
        minio: 'disconnected',
      };
    }
  }
}

