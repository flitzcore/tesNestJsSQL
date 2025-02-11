import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
  private openaiApiKey;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  async sendMessageToOpenAI(message: string): Promise<any> {
    try {
      const response = await axios.post(
        this.openaiApiUrl,
        {
          model: 'gpt-4o-mini', // Specify the model you want to use
          messages: [{ role: 'user', content: message }],
          response_format: {
            type: 'json_schema',
            json_schema: {
              strict: true,
              name: 'result',
              schema: {
                type: 'object',
                properties: {
                  result: {
                    type: 'string',
                    description: 'The result of the conversation',
                  },
                },
                additionalProperties: false,
                required: ['result'],
              },
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return response.data.choices[0].message.content;
    } catch (error) {
      console.log((error as Error).message);
    }
  }
}
