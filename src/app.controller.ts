import { Req, Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('generate-script')
  generateScript(@Body() body) {
    return this.appService.generateScript(
      body.type,
      body.tableName,
      body.object,
    );
  }
  @Post('generate-sql')
  generateSql(@Body() body) {
    return this.appService.generateSql(body.listTable, body.type);
  }
}
