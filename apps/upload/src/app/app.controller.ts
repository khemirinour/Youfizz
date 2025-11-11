import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { UploadFileDto, UploadResponseDto, MultipleUploadResponseDto, FileUrlResponseDto } from '../dto/upload-file.dto';
import { JwtAuthGuard } from '@you-fizz/shared';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('upload')
@Controller('upload')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check', description: 'Check upload service and MinIO connectivity' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  async healthCheck() {
    const health = await this.appService.healthCheck();
    return {
      ...health,
      timestamp: new Date().toISOString(),
      service: 'upload',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload single file', description: 'Upload a single file to MinIO storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        bucket: {
          type: 'string',
          example: 'youfizz-articles',
          required: false,
        },
        folder: {
          type: 'string',
          example: 'articles/vendor123/article456',
          required: false,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: UploadResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('bucket') bucket?: string,
    @Query('folder') folder?: string
  ): Promise<UploadResponseDto> {
    return this.appService.uploadFile(file, bucket, folder);
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload multiple files', description: 'Upload multiple files to MinIO storage (max 10 files)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        bucket: {
          type: 'string',
          example: 'youfizz-articles',
          required: false,
        },
        folder: {
          type: 'string',
          example: 'articles/vendor123/article456',
          required: false,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully', type: MultipleUploadResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid files or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('bucket') bucket?: string,
    @Query('folder') folder?: string
  ): Promise<MultipleUploadResponseDto> {
    const uploadedFiles = await this.appService.uploadMultipleFiles(files, bucket, folder);
    return {
      files: uploadedFiles,
      total: uploadedFiles.length,
    };
  }

  @Get('files/:bucket/:objectName(*)')
  @ApiOperation({ summary: 'Get file URL', description: 'Get presigned URL for file access' })
  @ApiParam({ name: 'bucket', description: 'Bucket name', example: 'youfizz-articles' })
  @ApiParam({ name: 'objectName', description: 'Object name (path) in bucket', example: 'articles/vendor123/file.jpg' })
  @ApiQuery({ name: 'expiresIn', required: false, description: 'URL expiration time in seconds (default: 7 days)', example: 3600 })
  @ApiResponse({ status: 200, description: 'File URL generated successfully', type: FileUrlResponseDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFileUrl(
    @Param('bucket') bucket: string,
    @Param('objectName') objectName: string,
    @Query('expiresIn') expiresIn?: number
  ): Promise<FileUrlResponseDto> {
    const url = await this.appService.getFileUrl(bucket, objectName, expiresIn);
    return {
      url,
      expiresIn: expiresIn || 7 * 24 * 60 * 60,
    };
  }

  @Delete('files/:bucket/:objectName(*)')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete file', description: 'Delete a file from MinIO storage' })
  @ApiParam({ name: 'bucket', description: 'Bucket name', example: 'youfizz-articles' })
  @ApiParam({ name: 'objectName', description: 'Object name (path) in bucket', example: 'articles/vendor123/file.jpg' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @HttpCode(HttpStatus.OK)
  async deleteFile(
    @Param('bucket') bucket: string,
    @Param('objectName') objectName: string
  ): Promise<{ message: string }> {
    await this.appService.deleteFile(bucket, objectName);
    return { message: 'File deleted successfully' };
  }

  @Get('files/:bucket')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List files in bucket', description: 'List all files in a bucket with optional prefix filter' })
  @ApiParam({ name: 'bucket', description: 'Bucket name', example: 'youfizz-articles' })
  @ApiQuery({ name: 'prefix', required: false, description: 'Prefix to filter files', example: 'articles/vendor123/' })
  @ApiResponse({ status: 200, description: 'Files listed successfully', type: [String] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async listFiles(
    @Param('bucket') bucket: string,
    @Query('prefix') prefix?: string
  ): Promise<string[]> {
    return this.appService.listFiles(bucket, prefix);
  }
}

