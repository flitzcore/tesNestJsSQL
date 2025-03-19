import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(
    private schema: {
      params?: ObjectSchema;
      body?: ObjectSchema;
      query?: ObjectSchema;
    },
  ) {}

  transform(value: any, metadata: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { params, body, query } = this.schema;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (params && metadata.type === 'param') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const { error } = params.validate({ [metadata.data]: value });
      if (error) {
        throw new BadRequestException(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Params validation failed: ${error.message}`,
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (body && metadata.type === 'body') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const { error } = body.validate(value);
      if (error) {
        throw new BadRequestException(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Body validation failed: ${error.message}`,
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (query && metadata.type === 'query') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const { error } = query.validate(value);
      if (error) {
        throw new BadRequestException(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Query validation failed: ${error.message}`,
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  }
}
