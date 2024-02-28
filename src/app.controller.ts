import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { JobsService } from './jobs/jobs.service';
import { LoggerService } from './logger/logger.service';
import { ProxyService } from './services/proxy/proxy.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly proxyService: ProxyService, private readonly logger: LoggerService, private readonly jobsServise: JobsService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/search')
  async searchContent(@Request() request, @Body() body) {
    this.logger.log('POST /search', JSON.stringify(body))
    let endPoint = 'search'
    console.log("search method calling...")
    return await this.proxyService.bapCLientApi2(endPoint, body)
  }

  @Post('/select')
  async selectContent(@Request() request, @Body() body) {
    let endPoint = 'select'
    console.log("select method calling...")
    //return await this.proxyService.bapCLientApi2(endPoint, body)
    let response = await this.jobsServise.select(body)
    console.log("body 30", body)
    console.log("response 31", response)
    if(response) {
      let selectResponse = {
        context: body.context,
        responses: [response.response]
      }
      return selectResponse
    } else {
      console.log("calling proxyservice")
      return await this.proxyService.bapCLientApi2(endPoint, body)
    }
  }

  @Post('/init')
  async initContent(@Request() request, @Body() body) {
    let endPoint = 'init'
    console.log("select method calling...")
    return await this.proxyService.bapCLientApi2(endPoint, body)
  }

  @Post('/confirm')
  async confirmContent(@Request() request, @Body() body) {
    let endPoint = 'confirm'
    console.log("confirm method calling...")
    return await this.proxyService.bapCLientApi2(endPoint, body)
  }

  @Post('/status')
  async statusContent(@Request() request, @Body() body) {
    let endPoint = 'status'
    console.log("status method calling...")
    return await this.proxyService.bapCLientApi2(endPoint, body)
  }

  @Post('/update')
  async updateContent(@Request() request, @Body() body) {
    let endPoint = 'update'
    console.log("update method calling...")
    return await this.proxyService.bapCLientApi2(endPoint, body)
  }



}
