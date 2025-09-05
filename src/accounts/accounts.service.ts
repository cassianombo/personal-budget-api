import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  private readonly ACCOUNT_SELECT_FIELDS = [
    'id',
    'name',
    'balance',
    'icon',
    'background',
    'type',
    'createdAt',
    'updatedAt',
  ] as (keyof Account)[];

  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountsRepository.create(createAccountDto);
    const savedAccount = await this.accountsRepository.save(account);
    return this.findOne(savedAccount.id);
  }

  async findAll(): Promise<Account[]> {
    return this.accountsRepository.find({
      select: this.ACCOUNT_SELECT_FIELDS,
    });
  }

  async findByUserId(userId: number): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { userId },
      select: this.ACCOUNT_SELECT_FIELDS,
    });
  }

  async findOne(id: number): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id },
      select: this.ACCOUNT_SELECT_FIELDS,
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async findOneByUserId(id: number, userId: number): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id, userId },
      select: this.ACCOUNT_SELECT_FIELDS,
    });

    if (!account) {
      throw new NotFoundException(
        `Account with ID ${id} not found or does not belong to user`,
      );
    }

    return account;
  }

  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id },
      select: this.ACCOUNT_SELECT_FIELDS,
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    Object.assign(account, updateAccountDto);
    await this.accountsRepository.save(account);

    const updatedAccount = await this.accountsRepository.findOne({
      where: { id },
      select: this.ACCOUNT_SELECT_FIELDS,
    });

    if (!updatedAccount) {
      throw new NotFoundException(
        `Account with ID ${id} not found after update`,
      );
    }

    return updatedAccount;
  }

  async updateByUserId(
    id: number,
    updateAccountDto: UpdateAccountDto,
    userId: number,
  ): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id, userId },
      select: this.ACCOUNT_SELECT_FIELDS,
    });

    if (!account) {
      throw new NotFoundException(
        `Account with ID ${id} not found or does not belong to user`,
      );
    }

    Object.assign(account, updateAccountDto);
    await this.accountsRepository.save(account);

    const updatedAccount = await this.accountsRepository.findOne({
      where: { id, userId },
      select: this.ACCOUNT_SELECT_FIELDS,
    });

    if (!updatedAccount) {
      throw new NotFoundException(
        `Account with ID ${id} not found after update or does not belong to user`,
      );
    }

    return updatedAccount;
  }

  async remove(id: number): Promise<void> {
    const account = await this.findOne(id);
    await this.accountsRepository.remove(account);
  }

  async removeByUserId(id: number, userId: number): Promise<void> {
    const account = await this.findOneByUserId(id, userId);
    await this.accountsRepository.remove(account);
  }

  async updateBalance(id: number, amount: number): Promise<Account> {
    const account = await this.findOne(id);
    account.balance += amount;
    await this.accountsRepository.save(account);
    return this.findOne(id);
  }
}
