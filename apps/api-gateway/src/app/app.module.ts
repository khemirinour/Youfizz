import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@you-fizz/shared';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [SharedModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'AUTH_CLIENT',
      useFactory: () => ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { port: 4001 }
      })
    },
    {
      provide: 'USER_CLIENT',
      useFactory: () => ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { port: 3002 }
      })
    },
    {
      provide: 'NOTIFICATION_CLIENT',
      useFactory: () => ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { port: 3003 }
      })
    }
  ],
})
export class AppModule {}
