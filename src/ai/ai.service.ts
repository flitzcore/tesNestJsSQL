/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Connection } from 'typeorm';

@Injectable()
export class AiService {
  private readonly openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
  private openaiApiKey;

  constructor(private readonly connection: Connection) {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }
  async getUserSchema(): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      const result = await queryRunner.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'student';
      `);
      return result;
    } finally {
      await queryRunner.release();
    }
  }
  async createUser(name: string, email: string): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.query(`
        INSERT INTO user (name, email) VALUES (${name}, ${email});
      `);
    } finally {
      await queryRunner.release();
    }
  }

  async queryUser(sqlCommand: string): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      const result = await queryRunner.query(sqlCommand);
      return JSON.stringify(result);
    } finally {
      await queryRunner.release();
    }
  }

  async sendMessageToOpenAI(message: string): Promise<any> {
    const openAIListOfTools = [
      {
        type: 'function',
        function: {
          name: 'createUser',
          description: 'Create a new user',
          strict: true,
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['name', 'email'],
            additionalProperties: false,
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'queryUser',
          description: 'Query a user',
          strict: true,
          parameters: {
            type: 'object',
            properties: {
              sqlCommand: {
                type: 'string',
                description:
                  'The SQL command to execute. You should NOT change any data. You CAN only retrieve',
              },
            },
            required: ['sqlCommand'],
            additionalProperties: false,
          },
        },
      },
    ];
    try {
      // get the current user format
      const userSchema = await this.getUserSchema();
      const userSchemaString = JSON.stringify(userSchema);
      console.log(userSchemaString);
      const prompt = `
      ${message}

      to answer the question, you might need this information on table "student":
      ${userSchemaString}
      `;
      const response = await axios.post(
        this.openaiApiUrl,
        {
          model: 'gpt-4o-mini', // Specify the model you want to use
          messages: [{ role: 'user', content: prompt }],
          tools: openAIListOfTools,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
        },
      );

      const tool_call = response.data.choices[0].message.tool_calls[0];
      console.log(tool_call);
      const function_name = tool_call.function.name;
      let result;
      if (function_name === 'createUser') {
        const args = JSON.parse(tool_call.function.arguments);
        const name = args.name;
        const email = args.email;
        result = await this.createUser(name, email);
      } else if (function_name === 'queryUser') {
        const args = JSON.parse(tool_call.function.arguments);
        const sqlCommand = args.sqlCommand;
        result = await this.queryUser(sqlCommand);
      }
      console.log(result);
      const message2 = response.data.choices[0].message; // append model's function call message
      const messagesArray = Array.isArray(message2) ? message2 : [message2];

      console.log(messagesArray);
      // Append the result message
      messagesArray.push({
        role: 'tool',
        tool_call_id: tool_call.id,
        content: result,
      });
      console.log(message2);

      const response2 = await axios.post(
        this.openaiApiUrl,
        {
          model: 'gpt-4o-mini', // Specify the model you want to use
          messages: messagesArray,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
        },
      );
      return response2.data.choices[0].message.content;
    } catch (error) {
      console.log((error as Error).message);
    }
  }
}
