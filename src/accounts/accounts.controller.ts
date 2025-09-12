import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Req() req, @Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create({
      ...createAccountDto,
      userId: req.user.id,
    } as CreateAccountDto & { userId: number });
  }

  @Get()
  findAll(@Req() req) {
    console.log('Find all accounts request received for user:', req.user.id);
    return this.accountsService.findByUserId(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.accountsService.findOneByUserId(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
    @Req() req,
  ) {
    return this.accountsService.updateByUserId(
      id,
      updateAccountDto,
      req.user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.accountsService.removeByUserId(id, req.user.id);
  }
}
