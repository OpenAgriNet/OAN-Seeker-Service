import { Body, Controller, Get, Param, Post, Query, Request } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from 'src/logger/logger.service';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {

    constructor(private readonly jobsService: JobsService, private readonly logger: LoggerService) { }

    @Post('/search')
    async getContent(@Request() request, @Body() body) {
        this.logger.log('POST /search', JSON.stringify(body))
        return this.jobsService.getJobs(body)
    }

    @Post('/select')
    async selectContent(@Request() request, @Body() body) {
        console.log("request", request.headers)
        this.logger.log('POST /select', JSON.stringify(body))
        return this.jobsService.select(body)
    }

    @Post('/responseSearch')
    async searchResponse(@Request() request, @Body() body) {
        this.logger.log('POST /responseSearch')
        return this.jobsService.searchResponse(body)
        
    }

    @Get('/getState')
    async getState(){
        this.logger.log('GET /getState')
        return this.jobsService.getFilterData('state')
    }

    @Get('/getCity')
    async getCity(@Query('state') state: string){
        this.logger.log('GET /getCity')
        return this.jobsService.getCity(state)
    }

    @Get('/getTitle')
    async getTitle(){
        this.logger.log('GET /getTitle')
        return this.jobsService.getFilterData('title')
    }

    @Get('/getSkills')
    async getSkills(){
        this.logger.log('GET /getSkills')
        return this.jobsService.getFilterData('skills')
    }

    @Get('/getGender')
    async getGender(){
        this.logger.log('GET /getGender')
        return this.jobsService.getFilterData('gender')
    }

    @Get('/getfilter/:filter')
    async getfilter(@Param('filter') filter){
        this.logger.log('GET /getfilter')
        console.log(filter)
        return this.jobsService.getFilterData(filter)
    }

    // create jobs manually
    @Post('/create')
    async contentapi() {
        this.logger.log('POST /create')
        return this.jobsService.jobsApiCall()
        //return this.jobsService.testApiCall()
    }

    // create jobs by cronjob
    @Cron(CronExpression.EVERY_8_HOURS)
    async jobsApiCall() {
        this.logger.log('Cronjob create service executed at')
        return this.jobsService.jobsApiCall()
    }

    // delete jobs by cronjob
    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async deleteJobs() {
        this.logger.log('Cronjob delete service executed at')
        let deletedResponse = await this.jobsService.deleteJobs()
        if(deletedResponse) {
            console.log("response deleted successfully at " + Date.now())
            return this.jobsService.jobsApiCall()
        }
    }

    // delete response cache by cronjob
    // @Cron(CronExpression.EVERY_DAY_AT_1AM)
    // async deleteResponse() {
    //     this.logger.log('Cronjob delete Response executed at')
    //     return this.jobsService.deleteResponse()
    // }

    @Post('/telemetry')
    async telemetry(@Request() request, @Body() body) {
        this.logger.log('POST /telemetry', JSON.stringify(body))
        return this.jobsService.addTelemetry(body)
    }

    @Post('/analytics')
    async analytics(@Request() request, @Body() body) {
        this.logger.log('POST /analytics')
        return this.jobsService.analytics(body)
        
    }

    @Post('/telemetryAnalytics')
    async telemetryAnalytics(@Request() request, @Body() body) {
        this.logger.log('GET /telemetryAnalytics')
        return this.jobsService.telemetryAnalytics1(body)
        
    }

}
