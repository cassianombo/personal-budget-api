import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionType } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AccountsService } from '../accounts/accounts.service';
import { PaginationDto, PaginatedResult } from './dto/pagination.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { AccountBalanceService } from './account-balance.service';
import { CategoriesService } from '../categories/categories.service';
import { CategoryType } from '../categories/category.entity';
import {
  TRANSACTION_LIMITS,
  TRANSACTION_MESSAGES,
} from './constants/transaction.constants';

@Injectable()
export class TransactionsService {
  private readonly CRITICAL_FIELDS: (keyof Transaction)[] = [
    'amount',
    'type',
    'accountId',
    'accountToId',
  ];

  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private accountsService: AccountsService,
    private dataSource: DataSource,
    private accountBalanceService: AccountBalanceService,
    private categoriesService: CategoriesService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: number,
  ): Promise<Transaction> {
    await this.validateAccountOwnership(createTransactionDto.accountId, userId);

    if (createTransactionDto.type === TransactionType.TRANSFER) {
      await this.validateTransferTransaction(
        createTransactionDto.accountId,
        createTransactionDto.accountToId,
        userId,
      );
    }

    await this.validateCategoryType(
      createTransactionDto.type,
      createTransactionDto.categoryId,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = this.transactionsRepository.create({
        ...createTransactionDto,
        date: new Date(createTransactionDto.date),
        description: createTransactionDto.description || '',
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      await this.accountBalanceService.updateBalances(
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

  async findOne(id: number, userId: number): Promise<Transaction> {
    this.validateTransactionId(id);
    this.validateUserId(userId);

    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.category', 'category')
      .leftJoin('transaction.account', 'account')
      .addSelect(['category.id', 'category.type'])
      .where('transaction.id = :id', { id })
      .andWhere('account.userId = :userId', { userId });

    const transaction = await queryBuilder.getOne();
    this.validateTransactionExists(transaction, id);

    return transaction!;
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    userId: number,
  ): Promise<Transaction> {
    this.validateTransactionId(id);

    const oldTransaction = await this.findOne(id, userId);
    const normalizedUpdateDto = this.normalizeUpdateDto(
      updateTransactionDto,
      oldTransaction,
    );

    await this.validateUpdateFields(
      normalizedUpdateDto,
      oldTransaction,
      userId,
    );

    if (this.hasCriticalFieldsChanged(normalizedUpdateDto, oldTransaction)) {
      return await this.updateCriticalFields(
        normalizedUpdateDto,
        oldTransaction,
      );
    } else {
      return await this.updateNonCriticalFields(
        normalizedUpdateDto,
        oldTransaction,
      );
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    this.validateTransactionId(id);

    const transaction = await this.findOne(id, userId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.accountBalanceService.revertBalances(
        queryRunner,
        transaction.type,
        transaction.amount,
        transaction.accountId,
        transaction.accountToId,
      );

      await queryRunner.manager.remove(transaction);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllWithFilters(
    filters: TransactionFiltersDto,
    paginationDto?: PaginationDto,
    userId?: number,
  ): Promise<PaginatedResult<Transaction>> {
    if (!userId) {
      throw new BadRequestException(TRANSACTION_MESSAGES.USER_ID_REQUIRED);
    }
    this.validateUserId(userId);

    return await this.findTransactionsWithPagination(
      filters,
      paginationDto || {},
      userId,
    );
  }

  private async findTransactionsWithPagination(
    filters: TransactionFiltersDto,
    paginationDto: PaginationDto,
    userId: number,
  ): Promise<PaginatedResult<Transaction>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.buildTransactionQuery(filters, userId)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private buildTransactionQuery(
    filters: TransactionFiltersDto,
    userId: number,
  ) {
    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.category', 'category')
      .leftJoin('transaction.account', 'account')
      .addSelect(['category.id', 'category.type'])
      .where('account.userId = :userId', { userId })
      .orderBy('transaction.date', 'DESC');

    if (filters.accountId) {
      queryBuilder.andWhere('transaction.accountId = :accountId', {
        accountId: filters.accountId,
      });
    }

    if (filters.categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('transaction.type = :type', {
        type: filters.type,
      });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.minAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount >= :minAmount', {
        minAmount: filters.minAmount,
      });
    }

    if (filters.maxAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount <= :maxAmount', {
        maxAmount: filters.maxAmount,
      });
    }

    if (filters.amount !== undefined) {
      queryBuilder.andWhere('transaction.amount = :amount', {
        amount: filters.amount,
      });
    }

    return queryBuilder;
  }

  private validateTransactionId(id: number): void {
    if (!id || id <= 0) {
      throw new BadRequestException(TRANSACTION_MESSAGES.INVALID_ID);
    }
  }

  private hasCriticalFieldsChanged(
    updateDto: Partial<Transaction>,
    oldTransaction: Transaction,
  ): boolean {
    return this.CRITICAL_FIELDS.some(
      (field) =>
        updateDto[field] !== undefined &&
        updateDto[field] !== oldTransaction[field],
    );
  }

  private validateUserId(userId: number): void {
    if (!userId || userId <= 0) {
      throw new BadRequestException(TRANSACTION_MESSAGES.USER_ID_REQUIRED);
    }
  }

  private validateTargetAccountId(accountToId?: number): void {
    if (!accountToId) {
      throw new BadRequestException(
        TRANSACTION_MESSAGES.TRANSFER_TARGET_REQUIRED,
      );
    }
  }

  private validateDifferentAccounts(
    accountId: number,
    accountToId: number,
  ): void {
    if (accountId === accountToId) {
      throw new BadRequestException(
        TRANSACTION_MESSAGES.CANNOT_TRANSFER_SAME_ACCOUNT,
      );
    }
  }

  private validateTransactionExists(
    transaction: Transaction | null,
    id: number,
  ): void {
    if (!transaction) {
      throw new NotFoundException(
        TRANSACTION_MESSAGES.TRANSACTION_NOT_FOUND(id),
      );
    }
  }

  private async validateAccountOwnership(
    accountId: number,
    userId: number,
  ): Promise<void> {
    const account = await this.accountsService.findOneByUserId(
      accountId,
      userId,
    );
    if (!account) {
      throw new NotFoundException(
        TRANSACTION_MESSAGES.ACCOUNT_NOT_FOUND(accountId),
      );
    }
  }

  private async validateCategoryType(
    transactionType: TransactionType,
    categoryId?: number,
  ): Promise<void> {
    if (transactionType === TransactionType.TRANSFER || !categoryId) {
      return;
    }

    const category = await this.categoriesService.findOne(categoryId);

    if (!category) {
      throw new NotFoundException(
        TRANSACTION_MESSAGES.CATEGORY_NOT_FOUND(categoryId),
      );
    }

    const expectedCategoryType =
      transactionType === TransactionType.INCOME
        ? CategoryType.INCOME
        : CategoryType.EXPENSE;

    if (category.type !== expectedCategoryType) {
      throw new BadRequestException(
        TRANSACTION_MESSAGES.CATEGORY_TYPE_MISMATCH(
          expectedCategoryType,
          transactionType,
        ),
      );
    }
  }

  private async validateTransferTransaction(
    accountId: number,
    accountToId?: number,
    userId?: number,
  ): Promise<void> {
    this.validateTargetAccountId(accountToId);
    this.validateDifferentAccounts(accountId, accountToId!);

    if (userId) {
      await this.validateAccountOwnership(accountToId!, userId);
    }
  }

  private normalizeUpdateDto(
    updateDto: UpdateTransactionDto,
    oldTransaction: Transaction,
  ): Partial<Transaction> {
    return {
      amount: updateDto.amount ?? oldTransaction.amount,
      type: updateDto.type ?? oldTransaction.type,
      accountId: updateDto.accountId ?? oldTransaction.accountId,
      accountToId: updateDto.accountToId ?? oldTransaction.accountToId,
      categoryId: updateDto.categoryId ?? oldTransaction.categoryId,
      date: updateDto.date ? new Date(updateDto.date) : oldTransaction.date,
      title: updateDto.title ?? oldTransaction.title,
      description: updateDto.description ?? oldTransaction.description,
    };
  }

  private async validateUpdateFields(
    normalizedDto: Partial<Transaction>,
    oldTransaction: Transaction,
    userId: number,
  ): Promise<void> {
    if (normalizedDto.accountId !== oldTransaction.accountId) {
      await this.validateAccountOwnership(normalizedDto.accountId!, userId);
    }
    if (
      normalizedDto.accountToId &&
      normalizedDto.accountToId !== oldTransaction.accountToId
    ) {
      await this.validateAccountOwnership(normalizedDto.accountToId, userId);
    }

    if (normalizedDto.type === TransactionType.TRANSFER) {
      await this.validateTransferTransaction(
        normalizedDto.accountId!,
        normalizedDto.accountToId,
        userId,
      );
    } else if (normalizedDto.accountToId) {
      throw new BadRequestException(
        TRANSACTION_MESSAGES.TARGET_ACCOUNT_ONLY_FOR_TRANSFERS,
      );
    }
  }

  private async updateCriticalFields(
    normalizedDto: Partial<Transaction>,
    oldTransaction: Transaction,
  ): Promise<Transaction> {
    const newTransaction = {
      ...oldTransaction,
      ...normalizedDto,
    };

    await this.validateCategoryType(
      newTransaction.type,
      newTransaction.categoryId,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.accountBalanceService.revertBalances(
        queryRunner,
        oldTransaction.type,
        oldTransaction.amount,
        oldTransaction.accountId,
        oldTransaction.accountToId,
      );

      await this.accountBalanceService.updateBalances(
        queryRunner,
        newTransaction.type,
        newTransaction.amount,
        newTransaction.accountId,
        newTransaction.accountToId,
      );

      const updatedTransaction = await queryRunner.manager.save(newTransaction);
      await queryRunner.commitTransaction();
      return updatedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async updateNonCriticalFields(
    normalizedDto: Partial<Transaction>,
    oldTransaction: Transaction,
  ): Promise<Transaction> {
    if (normalizedDto.categoryId !== oldTransaction.categoryId) {
      await this.validateCategoryType(
        oldTransaction.type,
        normalizedDto.categoryId,
      );
    }

    Object.assign(oldTransaction, normalizedDto);
    return await this.transactionsRepository.save(oldTransaction);
  }
}
