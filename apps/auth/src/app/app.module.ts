import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@you-fizz/shared';

@Module({
  imports: [SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
