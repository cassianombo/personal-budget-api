import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionType } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private accountsService: AccountsService,
    private dataSource: DataSource,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the transaction
      const transaction = this.transactionsRepository.create({
        ...createTransactionDto,
        date: new Date(createTransactionDto.date),
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      // Update account balances based on transaction type
      await this.updateAccountBalances(
        queryRunner,
        createTransactionDto.type,
        createTransactionDto.amount,
        createTransactionDto.accountId,
        createTransactionDto.accountToId,
      );

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async updateAccountBalances(
    queryRunner: any,
    type: TransactionType,
    amount: number,
    accountId: number,
    accountToId?: number,
  ): Promise<void> {
    const account = await queryRunner.manager.findOne('Account', { where: { id: accountId } });
    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    switch (type) {
      case TransactionType.EXPENSE:
        account.balance -= amount;
        break;
      case TransactionType.INCOME:
        account.balance += amount;
        break;
      case TransactionType.TRANSFER:
        if (!accountToId) {
          throw new BadRequestException('AccountToId is required for transfer transactions');
        }
        const accountTo = await queryRunner.manager.findOne('Account', { where: { id: accountToId } });
        if (!accountTo) {
          throw new NotFoundException(`Account with ID ${accountToId} not found`);
        }
        account.balance -= amount;
        accountTo.balance += amount;
        await queryRunner.manager.save(accountTo);
        break;
    }

    await queryRunner.manager.save(account);
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      relations: ['user', 'category'],
      order: { date: 'DESC' },
    });
  }

  async findByUserId(userId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { userId },
      relations: ['user', 'category'],
      order: { date: 'DESC' },
    });
  }

  async findByAccountId(accountId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { accountId },
      relations: ['user', 'category'],
      order: { date: 'DESC' },
    });
  }

  async findByCategoryId(categoryId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { categoryId },
      relations: ['user', 'category'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['user', 'category'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id);
    
    // If amount or type changed, we need to revert the old balance changes and apply new ones
    if (updateTransactionDto.amount !== undefined || updateTransactionDto.type !== undefined) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Revert old balance changes
        await this.revertAccountBalances(
          queryRunner,
          transaction.type,
          transaction.amount,
          transaction.accountId,
          transaction.accountToId,
        );

        // Apply new balance changes
        await this.updateAccountBalances(
          queryRunner,
          updateTransactionDto.type || transaction.type,
          updateTransactionDto.amount || transaction.amount,
          updateTransactionDto.accountId || transaction.accountId,
          updateTransactionDto.accountToId || transaction.accountToId,
        );

        // Update transaction
        Object.assign(transaction, updateTransactionDto);
        if (updateTransactionDto.date) {
          transaction.date = new Date(updateTransactionDto.date);
        }
        const updatedTransaction = await queryRunner.manager.save(transaction);

        await queryRunner.commitTransaction();
        return updatedTransaction;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } else {
      // No balance changes needed, just update the transaction
      Object.assign(transaction, updateTransactionDto);
      if (updateTransactionDto.date) {
        transaction.date = new Date(updateTransactionDto.date);
      }
      return this.transactionsRepository.save(transaction);
    }
  }

  private async revertAccountBalances(
    queryRunner: any,
    type: TransactionType,
    amount: number,
    accountId: number,
    accountToId?: number,
  ): Promise<void> {
    const account = await queryRunner.manager.findOne('Account', { where: { id: accountId } });
    if (!account) return;

    switch (type) {
      case TransactionType.EXPENSE:
        account.balance += amount;
        break;
      case TransactionType.INCOME:
        account.balance -= amount;
        break;
      case TransactionType.TRANSFER:
        if (accountToId) {
          const accountTo = await queryRunner.manager.findOne('Account', { where: { id: accountToId } });
          if (accountTo) {
            account.balance += amount;
            accountTo.balance -= amount;
            await queryRunner.manager.save(accountTo);
          }
        }
        break;
    }

    await queryRunner.manager.save(account);
  }

  async remove(id: number): Promise<void> {
    const transaction = await this.findOne(id);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Revert balance changes
      await this.revertAccountBalances(
        queryRunner,
        transaction.type,
        transaction.amount,
        transaction.accountId,
        transaction.accountToId,
      );

      // Remove transaction
      await queryRunner.manager.remove(transaction);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
