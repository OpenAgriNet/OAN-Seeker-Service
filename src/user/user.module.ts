import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { HasuraService } from 'src/services/hasura/hasura.service';

@Module({
  controllers: [UserController],
  providers: [UserService,HasuraService]
})
export class UserModule {}
