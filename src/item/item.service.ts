/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  async create(item: Item, accountId: number): Promise<Item> {
    return this.itemsRepository.save({ ...item, accountId });
  }
  async update(id: number, item: Partial<Item>, accountId: number) {
    const result = await this.itemsRepository.update({ id, accountId }, item);

    if (result.affected === 0) {
      throw new UnauthorizedException('Item not found or access denied');
    }

    // Fetch and return the updated entity
    return result;
  }

  async findAll(query: any, accountId: number): Promise<Item[]> {
    const { name, description, price } = query;
    const queryBuilder = this.itemsRepository.createQueryBuilder('item');

    // Always filter by accountId
    queryBuilder.where('item.accountId = :accountId', { accountId });

    if (name) {
      queryBuilder.andWhere('item.name ~* :pattern', {
        pattern: `.*${name}.*`,
      });
    }
    if (description) {
      queryBuilder.andWhere('item.description ~* :emailPattern', {
        emailPattern: `.*${description}.*`,
      });
    }
    if (price) {
      queryBuilder.andWhere('item.price = :price', { price });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, accountId: number): Promise<Item | null> {
    const item = await this.itemsRepository.findOne({
      where: { id, accountId },
    });

    if (!item) {
      throw new UnauthorizedException('Item not found or access denied');
    }

    return item;
  }

  async remove(id: number, accountId: number): Promise<void> {
    const result = await this.itemsRepository.delete({ id, accountId });

    if (result.affected === 0) {
      throw new UnauthorizedException('Item not found or access denied');
    }
  }
}
