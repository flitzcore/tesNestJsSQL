/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { TokenPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
      ignoreExpiration: false,
    });
  }

  async validate(payload: TokenPayload): Promise<TokenPayload> {
    console.log('JWT Strategy validate() called with payload:', payload);

    if (payload.type !== 'access') {
      console.log('Invalid token type:', payload.type);
      throw new UnauthorizedException('Invalid token type');
    }

    const account = await this.accountsRepository.findOne({
      where: { id: payload.sub },
    });

    console.log('Found account:', account);

    if (!account) {
      console.log('No account found for sub:', payload.sub);
      throw new UnauthorizedException();
    }

    // Return the payload instead of the account
    return payload;
  }
}
