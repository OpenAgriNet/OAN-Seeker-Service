import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { HasuraService } from './services/hasura/hasura.service';
import { ProxyService } from './services/proxy/proxy.service';
import { LoggerService } from './logger/logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    {
      ...HttpModule.register({}),
      global: true,
    },
    JobsModule
  ],
  controllers: [AppController],
  providers: [AppService, HasuraService, ProxyService, LoggerService],
})
export class AppModule {}
