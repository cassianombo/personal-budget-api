import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { Account } from "../accounts/account.entity";
import { Transaction } from "../transactions/transaction.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>
  ) {}

  async updateHashedRefreshToken(
    userId: number,
    hashedRefreshToken: string | null
  ) {
    await this.usersRepository.update(
      { id: userId },
      { hashedRefreshToken: hashedRefreshToken ?? undefined }
    );
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUsername = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUsername) {
      throw new ConflictException("Username already exists");
    }

    const existingEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException("Email already exists");
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
      select: ["id", "name", "username", "email", "hashedRefreshToken", "role"],
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

  async findByEmail(email: string): Promise<User> {
    if (!email) {
      throw new NotFoundException(`Email is required`);
    }

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException("Username already exists");
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException("Email already exists");
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
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
          await transactionalEntityManager.delete("transactions", {
            userId: id,
          });

          // Then, delete all accounts related to this user
          await transactionalEntityManager.delete("accounts", { userId: id });

          // Finally, delete the user
          await transactionalEntityManager.delete("users", { id });
        }
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error(`Failed to delete user with ID ${id}: ${error.message}`);
    }
  }
}
