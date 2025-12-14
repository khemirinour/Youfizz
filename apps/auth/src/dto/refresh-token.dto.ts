import { IsString, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'your-refresh-token-here', required: false, description: 'Refresh token (optional if provided in cookie)' })
  @ValidateIf((o) => o.refreshToken !== undefined && o.refreshToken !== null && o.refreshToken !== '')
  @IsString()
  refreshToken?: string;
}
