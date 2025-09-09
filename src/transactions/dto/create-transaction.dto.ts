import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { TransactionType } from '../transaction.entity';

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @IsPositive({ message: 'Amount must be positive' })
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  @Max(999999.99, { message: 'Amount cannot exceed 999,999.99' })
  @Type(() => Number)
  amount: number;

  @IsNotEmpty({ message: 'Account ID is required' })
  @IsNumber({}, { message: 'Account ID must be a valid number' })
  @IsPositive({ message: 'Account ID must be positive' })
  @Type(() => Number)
  accountId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Category ID must be a valid number' })
  @IsPositive({ message: 'Category ID must be positive' })
  @Type(() => Number)
  categoryId?: number;

  @ValidateIf((o) => o.type === TransactionType.TRANSFER)
  @IsNotEmpty({
    message: 'Target account ID is required for transfer transactions',
  })
  @IsNumber({}, { message: 'Target account ID must be a valid number' })
  @IsPositive({ message: 'Target account ID must be positive' })
  @Type(() => Number)
  accountToId?: number;

  @IsNotEmpty({ message: 'Date is required' })
  @IsDateString({}, { message: 'Date must be a valid date string' })
  @Transform(({ value }) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return value;
  })
  date: string;

  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(0, 1000, { message: 'Description cannot exceed 1000 characters' })
  @Transform(({ value }) => value?.trim() || '')
  description?: string;

  @IsNotEmpty({ message: 'Transaction type is required' })
  @IsEnum(TransactionType, {
    message: 'Transaction type must be one of: expense, income, transfer',
  })
  type: TransactionType;
}
