import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

@Entity('categories')
export class Category {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false, unique: true })
  name: string;

  @Column({ type: 'enum', enum: CategoryType, default: CategoryType.EXPENSE })
  type: CategoryType;

  @Column()
  icon: string;

  @Column()
  background: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}