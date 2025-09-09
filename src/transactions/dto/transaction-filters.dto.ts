import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { TransactionType } from '../transaction.entity';

export class TransactionFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Account ID must be a valid number' })
  @IsPositive({ message: 'Account ID must be positive' })
  accountId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Category ID must be a valid number' })
  @IsPositive({ message: 'Category ID must be positive' })
  categoryId?: number;

  @IsOptional()
  @IsEnum(TransactionType, {
    message: 'Transaction type must be one of: expense, income, transfer',
  })
  type?: TransactionType;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date string' })
  @Transform(({ value }) =>
    value ? new Date(value).toISOString().split('T')[0] : value,
  )
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string' })
  @Transform(({ value }) =>
    value ? new Date(value).toISOString().split('T')[0] : value,
  )
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Min amount must be a valid number' })
  @Min(0, { message: 'Min amount cannot be negative' })
  minAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Max amount must be a valid number' })
  @Max(999999.99, { message: 'Max amount cannot exceed 999,999.99' })
  maxAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Min amount must be a valid number' })
  @Min(0, { message: 'Min amount cannot be negative' })
  @Max(999999.99, { message: 'Max amount cannot exceed 999,999.99' })
  amount?: number;
}
