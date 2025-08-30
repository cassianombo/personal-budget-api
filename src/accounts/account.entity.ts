import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { User } from '../users/user.entity';

export enum AccountType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  SAVINGS = 'savings',
  INVESTMENT = 'investment'
}

@Entity('accounts')
export class Account {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ nullable: false })
  icon: string;

  @Column({ nullable: false })
  background: string;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.DEBIT })
  type: AccountType;

  @Column({ nullable: false })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
