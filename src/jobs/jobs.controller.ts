import { Body, Controller, Post, Request } from '@nestjs/common';
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

}
