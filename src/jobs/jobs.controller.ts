import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {

    constructor(private readonly jobsServise: JobsService) { }

    @Post('/search')
    async getContent(@Request() request, @Body() body) {
        return this.jobsServise.getJobs(body)
    }

    @Post('/create')
    async contentapi() {
        return this.jobsServise.jobsApiCall()
        //return this.jobsServise.testApiCall()
    }

    @Post('/responseSearch')
    async searchResponse(@Request() request, @Body() body) {
        return this.jobsServise.searchResponse(body)
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async jobsApiCall() {
        console.log('Cron job jobsApiCall executed!');
        return this.jobsServise.jobsApiCall()
    }

    @Get('/getState')
    async getState(){
        return this.jobsServise.getState()
    }

    @Get('/getCity')
    async getCity(@Query('state') state: string){
        return this.jobsServise.getCity(state)
    }

    @Get('/getTitle')
    async getTitle(){
        return this.jobsServise.getTitle()
    }

    @Cron(CronExpression.EVERY_HOUR)
    async deleteResponse() {
        console.log('Cron job deleteResponse executed!');
        return this.jobsServise.deleteResponse()
    }

    
}
