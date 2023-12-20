import { Module } from '@nestjs/common';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, HasuraService]
})
export class JobsModule {}
