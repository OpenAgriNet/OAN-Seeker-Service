import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { HasuraService } from './services/hasura/hasura.service';
import { ProxyService } from './services/proxy/proxy.service';
import { LoggerService } from './logger/logger.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { JobsService } from './jobs/jobs.service';
import { ResponseCache } from './entity/response.entity';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => ({
        type: configService.get<'postgres' | 'mysql' | 'sqlite' | 'mariadb'>(
          'DB_TYPE',
        ) as 'postgres' | 'mysql' | 'sqlite' | 'mariadb',
        host: configService.get<string>('DB_HOST') as string,
        port: parseInt(configService.get<string>('DB_PORT'), 10),
        username: configService.get<string>('DB_USERNAME') as string,
        password: configService.get<string>('DB_PASSWORD') as string,
        database: configService.get<string>('DB_NAME') as string,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: true,
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    {
      ...HttpModule.register({}),
      global: true,
    },
    JobsModule,
    UserModule,
    TypeOrmModule.forFeature([ResponseCache]),
    LocationModule
  ],
  controllers: [AppController],
  providers: [AppService, HasuraService, ProxyService, LoggerService, JobsService],
})
export class AppModule {}
