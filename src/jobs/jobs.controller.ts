import { Body, Controller, Post, Request } from '@nestjs/common';
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
        //return this.jobsServise.jobsApiCall()
        return this.jobsServise.testApiCall()
    }

}
