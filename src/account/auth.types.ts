import { Account } from './account.entity';

export interface AuthResponse {
  account: Omit<Account, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPayload {
  sub: number;
  email: string;
  type: 'access' | 'refresh';
}
