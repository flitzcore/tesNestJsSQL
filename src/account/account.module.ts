import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Account } from './account.entity';
import { Token } from './token.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule, // Import ConfigModule
    TypeOrmModule.forFeature([Account, Token]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Load from env
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_MINUTES'),
          algorithm: 'HS256',
        },
      }),
    }),
  ],
  providers: [AccountService, AuthService, JwtStrategy],
  controllers: [AccountController, AuthController],
  exports: [JwtStrategy, PassportModule],
})
export class AccountModule {}
