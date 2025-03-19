import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  async create(account: Account): Promise<Account> {
    return this.accountsRepository.save(account);
  }

  async findAll(query: any): Promise<Account[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { name, email, isActive } = query;
    const queryBuilder = this.accountsRepository.createQueryBuilder('account');

    if (name) {
      queryBuilder.andWhere('account.name ~* :pattern', {
        pattern: `.*${name}.*`,
      });
    }
    if (email) {
      queryBuilder.andWhere('account.email ~* :emailPattern', {
        emailPattern: `.*${email}.*`,
      });
    }
    if (isActive !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      queryBuilder.andWhere('account.isActive = :isActive', { isActive });
    }

    return queryBuilder.getMany();
  }

  findOne(id: number): Promise<Account | null> {
    return this.accountsRepository.findOneBy({ id });
  }

  async update(id: number, account: Partial<Account>): Promise<Account | null> {
    await this.accountsRepository.update(id, account);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.accountsRepository.delete(id);
  }
}
