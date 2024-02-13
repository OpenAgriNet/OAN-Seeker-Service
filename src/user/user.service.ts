import { Injectable } from '@nestjs/common';
import { CreateOrderDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HasuraService } from 'src/services/hasura/hasura.service';

@Injectable()
export class UserService {


  constructor (private readonly hasuraService:HasuraService){}

  create(createUserDto: CreateUserDto) {
    return this.hasuraService.createSeekerUser(createUserDto);  
  }


  createOrder(createOrderDto:CreateOrderDto) {
    return this.hasuraService.createOrder(createOrderDto);  
  }

  searchOrderByOrderId(OredrId) {
    return this.hasuraService.searchOrderByOrderId(OredrId);  
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
