import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountsRepository.create(createAccountDto);
    return this.accountsRepository.save(account);
  }

  async findAll(): Promise<Account[]> {
    return this.accountsRepository.find({
      relations: ['user'],
    });
  }

  async findByUserId(userId: number): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async update(id: number, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(id);
    Object.assign(account, updateAccountDto);
    return this.accountsRepository.save(account);
  }

  async remove(id: number): Promise<void> {
    const account = await this.findOne(id);
    await this.accountsRepository.remove(account);
  }

  async updateBalance(id: number, amount: number): Promise<Account> {
    const account = await this.findOne(id);
    account.balance += amount;
    return this.accountsRepository.save(account);
  }
}
