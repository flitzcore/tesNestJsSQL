import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('send-message')
  sendMessage(@Body() body: { message: string }): Promise<any> {
    return this.aiService.sendMessageToOpenAI(body.message);
  }
}
