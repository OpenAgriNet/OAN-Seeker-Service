import { Body, Controller, Get, Param, Post, Query, Request } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from 'src/logger/logger.service';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {

    constructor(private readonly jobsServise: JobsService, private readonly logger: LoggerService) { }

    @Post('/search')
    async getContent(@Request() request, @Body() body) {
        this.logger.log('POST /search')
        return this.jobsServise.getJobs(body)
    }

    @Post('/responseSearch')
    async searchResponse(@Request() request, @Body() body) {
        this.logger.log('POST /responseSearch')
        return this.jobsServise.searchResponse(body)
    }

    @Get('/getState')
    async getState(){
        this.logger.log('GET /getState')
        return this.jobsServise.getFilterData('state')
    }

    @Get('/getCity')
    async getCity(@Query('state') state: string){
        this.logger.log('GET /getCity')
        return this.jobsServise.getCity(state)
    }

    @Get('/getTitle')
    async getTitle(){
        this.logger.log('GET /getTitle')
        return this.jobsServise.getFilterData('title')
    }

    @Get('/getSkills')
    async getSkills(){
        this.logger.log('GET /getSkills')
        return this.jobsServise.getFilterData('skills')
    }

    @Get('/getGender')
    async getGender(){
        this.logger.log('GET /getGender')
        return this.jobsServise.getFilterData('gender')
    }

    @Get('/getfilter/:filter')
    async getfilter(@Param('filter') filter){
        this.logger.log('GET /getfilter')
        console.log(filter)
        return this.jobsServise.getFilterData(filter)
    }

    // create jobs manually
    @Post('/create')
    async contentapi() {
        this.logger.log('POST /create')
        return this.jobsServise.jobsApiCall()
        //return this.jobsServise.testApiCall()
    }

    // create jobs by cronjob
    @Cron(CronExpression.EVERY_8_HOURS)
    async jobsApiCall() {
        this.logger.log('Cronjob create service executed at')
        return this.jobsServise.jobsApiCall()
    }

    // delete jobs by cronjob
    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async deleteJobs() {
        this.logger.log('Cronjob delete service executed at')
        let deletedResponse = await this.jobsServise.deleteJobs()
        if(deletedResponse) {
            console.log("response deleted successfully at " + Date.now())
            return this.jobsServise.jobsApiCall()
        }
    }

    // delete response cache by cronjob
    // @Cron(CronExpression.EVERY_DAY_AT_1AM)
    // async deleteResponse() {
    //     this.logger.log('Cronjob delete Response executed at')
    //     return this.jobsServise.deleteResponse()
    // }

}
