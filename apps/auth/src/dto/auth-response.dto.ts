import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  @ApiProperty()
  user: UserResponseDto;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenType: string = 'Bearer';

  @ApiProperty()
  expiresIn: number; // in seconds

  @ApiProperty({ required: false, description: 'Vendor ID if user is a vendor' })
  vendorId?: string;

  @ApiProperty({ required: false, description: 'Confirmateur ID if user is a confirmateur' })
  confirmateurId?: string;
}
