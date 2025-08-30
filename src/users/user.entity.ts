import * as bcrypt from 'bcrypt';

import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Account } from '../accounts/account.entity';
import { Transaction } from '../transactions/transaction.entity';

@Entity('users')
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ length: 20, unique: true, nullable: false })
  username: string;

  @Column({ unique: true, nullable: true }) // Temporarily nullable to fix existing data
  email: string;

  @Column({ nullable: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Account, account => account.user, { cascade: true })
  accounts: Account[];

  @OneToMany(() => Transaction, transaction => transaction.user, { cascade: true })
  transactions: Transaction[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
