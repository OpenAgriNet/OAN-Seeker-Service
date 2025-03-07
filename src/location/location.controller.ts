import { Controller, Get, Param, Query } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('states')
  async getStates(@Query('lang') lang: string) {
    return { states: await this.locationService.getStates(lang) };
  }

  @Get('districts/:state_id')
  async getDistricts(@Param('state_id') state_id: number, @Query('lang') lang: string) {
    return { districts: await this.locationService.getDistricts(state_id, lang) };
  }
}
