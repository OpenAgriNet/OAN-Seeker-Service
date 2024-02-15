import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateOrderDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private cache_db = process.env.CACHE_DB;
  private response_cache_db = process.env.RESPONSE_CACHE_DB;

  @Post("/create")
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post("/createOrder")
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.userService.createOrder(createOrderDto);
  }

  @Get("/searchOrder/:OredrId")
  async searchOrderByOrderId(@Param('OredrId') OredrId) {
    const Order = await this.userService.searchOrderByOrderId(OredrId);
    if(Order?.data?.jobs_order_dev[0]?.OrderContentRelationship[0]) {
      return Order.data.jobs_order_dev[0].OrderContentRelationship[0]
    } else {
      throw new HttpException('Invalid order id', HttpStatus.BAD_REQUEST);
    }
    
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
