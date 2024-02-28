import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { HasuraService } from './services/hasura/hasura.service';
import { ProxyService } from './services/proxy/proxy.service';
import { LoggerService } from './logger/logger.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './jobs/jobs.service';
import { ResponseCache } from './entity/response.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '15.207.22.157',
      port: 15432,
      username: 'postgres',
      password: 'O1t1Ql!8yV#Z',
      database: 'vistaar_cache_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: true
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    {
      ...HttpModule.register({}),
      global: true,
    },
    JobsModule,
    UserModule,
    TypeOrmModule.forFeature([ResponseCache])
  ],
  controllers: [AppController],
  providers: [AppService, HasuraService, ProxyService, LoggerService, JobsService],
})
export class AppModule {}
