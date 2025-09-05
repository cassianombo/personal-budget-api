import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Account } from '../accounts/account.entity';
import { Transaction } from '../transactions/transaction.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async updateHashedRefreshToken(
    userId: number,
    hashedRefreshToken: string | null,
  ) {
    await this.usersRepository.update(
      { id: userId },
      { hashedRefreshToken: hashedRefreshToken ?? undefined },
    );
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const [existingUsername, existingEmail] = await Promise.all([
      this.usersRepository.findOne({
        where: { username: createUserDto.username },
      }),
      this.usersRepository.findOne({ where: { email: createUserDto.email } }),
    ]);

    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    if (
      createUserDto.username !== createUserDto.email &&
      createUserDto.username.length > 20
    ) {
      throw new ConflictException('Username must be less than 20 characters');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'username', 'email', 'hashedRefreshToken', 'role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new NotFoundException(`Email is required`);
    }

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<User> {
    await this.usersRepository.update(id, {
      role: updateRoleDto.role,
    });
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      // Use a transaction to ensure atomicity
      await this.usersRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // First, delete all transactions related to this user
          await transactionalEntityManager.delete('transactions', {
            userId: id,
          });

          // Then, delete all accounts related to this user
          await transactionalEntityManager.delete('accounts', { userId: id });

          // Finally, delete the user
          await transactionalEntityManager.delete('users', { id });
        },
      );
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user with ID ${id}: ${error.message}`);
    }
  }
}
