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


  async createOrder(createOrderDto:CreateOrderDto) {
    let createUserDto = {name: createOrderDto.name, gender: createOrderDto.gender, phone: createOrderDto.phone, email: createOrderDto.email}
    let findUser = await this.hasuraService.findSeekerUser(createUserDto.email);
    if(findUser) {
      console.log("findUser", findUser)
      let createOrder = {seeker_id: findUser.id,  content_id: createOrderDto.content_id, order_id: createOrderDto.order_id}
      return this.hasuraService.createOrder(createOrder);
    }
    let user = await this.hasuraService.createSeekerUser(createUserDto);
    console.log("user", user.id)
    if (user) {
      let createOrder = {seeker_id: user.id,  content_id: createOrderDto.content_id, order_id: createOrderDto.order_id}
      return this.hasuraService.createOrder(createOrder);
    }
      
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
