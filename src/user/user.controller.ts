import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateOrderDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private cache_db = process.env.CACHE_DB;
  private response_cache_db = process.env.RESPONSE_CACHE_DB;
  private jobs_seeker_dev = process.env.JOBS_SEEKER_DEV;
  private jobs_order_dev = process.env.JOBS_ORDER_DEV

  @Post("/create")
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post("/createOrder")
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.userService.createOrder(createOrderDto);
  }

  @Get("/searchOrder/:OredrId")
  searchOrderByOrderId(@Param('OredrId') OredrId) {
    return this.userService.searchOrderByOrderId(OredrId);
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
