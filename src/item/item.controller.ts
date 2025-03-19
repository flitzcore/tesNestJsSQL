import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  Body,
  UsePipes,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { Item } from './item.entity';
import { JoiValidationPipe } from 'src/utils/validation.utils';
import {
  createItemSchema,
  getItemSchema,
  getItemByIdSchema,
  updateItemSchema,
  deleteItemSchema,
} from './item.validator';
import { JwtAuthGuard } from '../account/jwt-auth.guard';
import { GetAccount } from '../account/get-account.decorator';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(createItemSchema))
  create(
    @Body() item: Item,
    @GetAccount('sub') accountId: number,
  ): Promise<Item> {
    console.log(accountId);
    return this.itemService.create(item, accountId);
  }

  @Get()
  @UsePipes(new JoiValidationPipe(getItemSchema))
  findAll(
    @Query() query: any,
    @GetAccount('sub') accountId: number,
  ): Promise<Item[]> {
    return this.itemService.findAll(query, accountId);
  }

  @Get(':id')
  @UsePipes(new JoiValidationPipe(getItemByIdSchema))
  findOne(
    @Param('id') id: string,
    @GetAccount('sub') accountId: number,
  ): Promise<Item | null> {
    return this.itemService.findOne(+id, accountId);
  }

  @Delete(':id')
  @UsePipes(new JoiValidationPipe(deleteItemSchema))
  remove(
    @Param('id') id: string,
    @GetAccount('sub') accountId: number,
  ): Promise<void> {
    return this.itemService.remove(+id, accountId);
  }
}
