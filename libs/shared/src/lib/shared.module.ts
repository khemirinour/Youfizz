import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [DatabaseModule],
  providers: [DatabaseService],
  exports: [DatabaseModule, DatabaseService],
})
export class SharedModule {}