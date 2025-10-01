import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { SharedModule } from '@you-fizz/shared';

@Module({
  imports: [SharedModule],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
