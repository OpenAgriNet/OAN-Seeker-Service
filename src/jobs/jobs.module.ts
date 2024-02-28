import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseCache } from 'src/entity/response.entity';
import { LoggerService } from 'src/logger/logger.service';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { ProxyService } from 'src/services/proxy/proxy.service';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([ResponseCache])],
  controllers: [JobsController],
  providers: [JobsService, HasuraService, ProxyService, LoggerService]
})
export class JobsModule {}
