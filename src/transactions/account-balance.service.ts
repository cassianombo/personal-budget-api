import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Account } from '../accounts/account.entity';
import { QueryRunner } from 'typeorm';
import { TransactionType } from './transaction.entity';

@Injectable()
export class AccountBalanceService {
  async updateBalances(
    queryRunner: QueryRunner,
    type: TransactionType,
    amount: number,
    accountId: number,
    accountToId?: number,
  ): Promise<void> {
    const account = await this.getAccount(queryRunner, accountId);

    switch (type) {
      case TransactionType.EXPENSE:
        this.validateSufficientBalance(account, amount);
        account.balance -= amount;
        break;
      case TransactionType.INCOME:
        account.balance += amount;
        break;
      case TransactionType.TRANSFER:
        await this.handleTransfer(queryRunner, account, amount, accountToId);
        return;
    }

    await queryRunner.manager.save(account);
  }

  async revertBalances(
    queryRunner: QueryRunner,
    type: TransactionType,
    amount: number,
    accountId: number,
    accountToId?: number,
  ): Promise<void> {
    const account = await this.getAccount(queryRunner, accountId);

    switch (type) {
      case TransactionType.EXPENSE:
        account.balance += amount;
        break;
      case TransactionType.INCOME:
        account.balance -= amount;
        break;
      case TransactionType.TRANSFER:
        await this.handleTransferRevert(
          queryRunner,
          account,
          amount,
          accountToId,
        );
        return;
    }

    await queryRunner.manager.save(account);
  }

  private async getAccount(
    queryRunner: QueryRunner,
    accountId: number,
  ): Promise<Account> {
    const account = await queryRunner.manager.findOne(Account, {
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    return account;
  }

  private validateSufficientBalance(account: Account, amount: number): void {
    if (account.balance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Account has ${account.balance} but needs ${amount}`,
      );
    }
  }

  private async handleTransfer(
    queryRunner: QueryRunner,
    sourceAccount: Account,
    amount: number,
    targetAccountId?: number,
  ): Promise<void> {
    if (!targetAccountId) {
      throw new BadRequestException(
        'Target account ID is required for transfers',
      );
    }

    this.validateSufficientBalance(sourceAccount, amount);

    const targetAccount = await this.getAccount(queryRunner, targetAccountId);

    if (sourceAccount.id === targetAccount.id) {
      throw new BadRequestException('Cannot transfer to the same account');
    }

    sourceAccount.balance -= amount;
    targetAccount.balance += amount;

    await queryRunner.manager.save([sourceAccount, targetAccount]);
  }

  private async handleTransferRevert(
    queryRunner: QueryRunner,
    sourceAccount: Account,
    amount: number,
    targetAccountId?: number,
  ): Promise<void> {
    if (!targetAccountId) {
      throw new BadRequestException(
        'Target account ID is required for transfers',
      );
    }

    const targetAccount = await this.getAccount(queryRunner, targetAccountId);

    sourceAccount.balance += amount;
    targetAccount.balance -= amount;

    await queryRunner.manager.save([sourceAccount, targetAccount]);
  }
}
