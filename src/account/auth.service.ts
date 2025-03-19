/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Account } from './account.entity';
import { Token, TokenType } from './token.entity';
import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  TokenPayload,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
    private jwtService: JwtService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const salt = await bcrypt.genSalt();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return bcrypt.hash(password, salt);
  }

  private async generateTokens(
    account: Account,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = {
      sub: account.id,
      email: account.email,
      type: 'access',
    };
    const refreshPayload: TokenPayload = { ...payload, type: 'refresh' };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(refreshPayload, { expiresIn: '7d' }),
    ]);

    // Calculate expiration dates
    const now = new Date();
    const accessExpires = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
    const refreshExpires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store tokens in database
    await Promise.all([
      this.tokensRepository.save({
        token: await this.hashPassword(accessToken),
        accountId: account.id,
        type: 'access' as TokenType,
        expiresAt: accessExpires,
      }),
      this.tokensRepository.save({
        token: await this.hashPassword(refreshToken),
        accountId: account.id,
        type: 'refresh' as TokenType,
        expiresAt: refreshExpires,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private formatResponse(
    account: Account,
    tokens: { accessToken: string; refreshToken: string },
  ): AuthResponse {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...accountWithoutPassword } = account;
    return {
      account: accountWithoutPassword,
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { password, ...rest } = registerDto;
    const hashedPassword = await this.hashPassword(password);

    const account = await this.accountsRepository.save({
      ...rest,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens(account);
    return this.formatResponse(account, tokens);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;
    const account = await this.accountsRepository.findOne({ where: { email } });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove existing tokens for this account
    await this.tokensRepository.delete({ accountId: account.id });

    const tokens = await this.generateTokens(account);
    return this.formatResponse(account, tokens);
  }

  async logout(accountId: number): Promise<void> {
    await this.tokensRepository.delete({ accountId });
  }
}
