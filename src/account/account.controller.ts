import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from './account.entity';
import { JoiValidationPipe } from '../utils/validation.utils';
import {
  createAccountSchema,
  getAccountSchema,
  getAccountByIdSchema,
  updateAccountSchema,
  deleteAccountSchema,
} from './account.validator';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(createAccountSchema))
  create(@Body() account: Account): Promise<Account> {
    return this.accountService.create(account);
  }

  @Get()
  @UsePipes(new JoiValidationPipe(getAccountSchema))
  findAll(@Query() query: any): Promise<Account[]> {
    return this.accountService.findAll(query);
  }

  @Get(':id')
  @UsePipes(new JoiValidationPipe(getAccountByIdSchema))
  findOne(@Param('id') id: string): Promise<Account | null> {
    return this.accountService.findOne(+id);
  }

  @Put(':id')
  @UsePipes(new JoiValidationPipe(updateAccountSchema))
  update(
    @Param('id') id: string,
    @Body() account: Partial<Account>,
  ): Promise<Account | null> {
    return this.accountService.update(+id, account);
  }

  @Delete(':id')
  @UsePipes(new JoiValidationPipe(deleteAccountSchema))
  remove(@Param('id') id: string): Promise<void> {
    return this.accountService.remove(+id);
  }
}
