import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Account } from '../accounts/account.entity';
import { Category } from '../categories/category.entity';

export enum TransactionType {
  EXPENSE = 'expense',
  INCOME = 'income',
  TRANSFER = 'transfer',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: false })
  accountId: number;

  @Column({ nullable: true })
  categoryId: number;

  @Column({ nullable: true })
  accountToId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountToId' })
  accountTo: Account;
}
