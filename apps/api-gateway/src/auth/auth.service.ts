import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginDto, RegisterDto } from '@you-fizz/shared';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async register(registerDto: RegisterDto) {
    return firstValueFrom(
      this.authClient.send('auth.register', registerDto),
    );
  }

  async login(loginDto: LoginDto) {
    return firstValueFrom(
      this.authClient.send('auth.login', loginDto),
    );
  }

  async getProfile(userId: string) {
    return firstValueFrom(
      this.authClient.send('auth.getProfile', userId),
    );
  }

  async refreshToken(refreshToken: string) {
    return firstValueFrom(
      this.authClient.send('auth.refresh', refreshToken),
    );
  }
}
