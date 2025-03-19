import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from './auth.types';

export const GetAccount = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
