import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ description: 'Bucket name', example: 'youfizz-articles' })
  @IsString()
  @IsOptional()
  bucket?: string;

  @ApiProperty({ description: 'Folder path within bucket', example: 'articles/vendor123/article456', required: false })
  @IsString()
  @IsOptional()
  folder?: string;
}

export class UploadResponseDto {
  @ApiProperty({ description: 'File URL', example: 'http://localhost:9000/youfizz-articles/articles/vendor123/file.jpg' })
  url!: string;

  @ApiProperty({ description: 'File name', example: 'file.jpg' })
  filename!: string;

  @ApiProperty({ description: 'Full object path in bucket', example: 'articles/vendor123/article456/uuid.jpg' })
  objectName!: string;

  @ApiProperty({ description: 'File size in bytes', example: 102400 })
  size!: number;

  @ApiProperty({ description: 'MIME type', example: 'image/jpeg' })
  mimeType!: string;

  @ApiProperty({ description: 'Bucket name', example: 'youfizz-articles' })
  bucket!: string;
}

export class MultipleUploadResponseDto {
  @ApiProperty({ description: 'List of uploaded files', type: [UploadResponseDto] })
  files!: UploadResponseDto[];

  @ApiProperty({ description: 'Total number of files uploaded', example: 3 })
  total!: number;
}

export class FileUrlResponseDto {
  @ApiProperty({ description: 'Presigned URL for file access', example: 'http://localhost:9000/youfizz-articles/...?X-Amz-Algorithm=...' })
  url!: string;

  @ApiProperty({ description: 'URL expiration time in seconds', example: 3600 })
  expiresIn!: number;
}

