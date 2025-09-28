import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '@you-fizz/shared';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @MessagePattern('auth.login')
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern('auth.getProfile')
  async getProfile(@Payload() userId: string) {
    return this.authService.getProfile(userId);
  }

  @MessagePattern('auth.refresh')
  async refreshToken(@Payload() refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
