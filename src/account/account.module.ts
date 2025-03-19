/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Account } from './account.entity';
import { Token } from './token.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

const jwtSecret = process.env.JWT_SECRET || 'your-secure-secret-key';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Token]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: {
        expiresIn: '15m',
        algorithm: 'HS256',
      },
    }),
  ],
  providers: [AccountService, AuthService, JwtStrategy],
  controllers: [AccountController, AuthController],
  exports: [JwtStrategy, PassportModule],
})
export class AccountModule {}
