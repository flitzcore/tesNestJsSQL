/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenPayload } from './auth.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = TokenPayload>(
    err: Error | null,
    user: TUser | false,
    info: any,
    context: ExecutionContext,
  ): TUser {
    console.log('JwtAuthGuard handleRequest() called');
    console.log('Error:', err);
    console.log('User:', user);
    console.log('Info:', info);

    if (err || !user) {
      console.log('Authentication failed:', err?.message || 'No user found');
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
