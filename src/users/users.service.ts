import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DEFAULT_USER_SETTINGS,
  SETTING_OPTIONS,
} from '../config/default-settings.js';
import { User } from './user.entity';
import { Account } from '../accounts/account.entity';
import { Transaction } from '../transactions/transaction.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  UserSettingsDto,
  UserSettingsResponseDto,
} from './dto/user-settings.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
    await this.validateUniqueFields(
      createUserDto.username,
      createUserDto.email,
    );

    if (
      createUserDto.username !== createUserDto.email &&
      createUserDto.username.length > 20
    ) {
      throw new ConflictException('Username must be less than 20 characters');
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      settings: this.getDefaultSettings(),
    });
    const savedUser = await this.usersRepository.save(user);

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number, includeRefreshToken = false): Promise<User> {
    const selectFields: (keyof User)[] = [
      'id',
      'name',
      'username',
      'email',
      'role',
    ];
    if (includeRefreshToken) {
      selectFields.push('hashedRefreshToken');
    }

    const user = await this.usersRepository.findOne({
      where: { id },
      select: selectFields,
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

    // Only validate if the fields are being changed
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      await this.validateUniqueFields(updateUserDto.username, undefined);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.validateUniqueFields(undefined, updateUserDto.email);
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

  async updateSettings(
    userId: number,
    updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettingsResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'settings'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Merge with existing settings, only updating provided fields
    const currentSettings = user.settings || this.getDefaultSettings();
    const updatedSettings = {
      ...currentSettings,
      ...(updateUserSettingsDto.language !== undefined && {
        language: updateUserSettingsDto.language,
      }),
      ...(updateUserSettingsDto.currency !== undefined && {
        currency: updateUserSettingsDto.currency,
      }),
      ...(updateUserSettingsDto.isBiometricLocked !== undefined && {
        isBiometricLocked: updateUserSettingsDto.isBiometricLocked,
      }),
    };

    await this.usersRepository.update(userId, {
      settings: updatedSettings as Record<string, any>,
    });

    return this.normalizeSettings(updatedSettings);
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
      throw new BadRequestException(
        `Failed to delete user with ID ${id}: ${error.message}`,
      );
    }
  }

  // Settings methods
  async getSettings(userId: number): Promise<UserSettingsResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'settings'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.normalizeSettings(user.settings);
  }

  async resetSettings(userId: number): Promise<UserSettingsResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const defaultSettings = this.getDefaultSettings();
    await this.usersRepository.update(userId, {
      settings: defaultSettings as Record<string, any>,
    });

    return this.normalizeSettings(defaultSettings);
  }

  private getDefaultSettings(): UserSettingsDto {
    return {
      language: DEFAULT_USER_SETTINGS.language,
      currency: DEFAULT_USER_SETTINGS.currency,
      isBiometricLocked: DEFAULT_USER_SETTINGS.isBiometricLocked,
    };
  }

  private normalizeSettings(settings: any): UserSettingsResponseDto {
    const languageValue = String(
      settings?.language || DEFAULT_USER_SETTINGS.language,
    );
    const currencyValue = String(
      settings?.currency || DEFAULT_USER_SETTINGS.currency,
    );
    const isBiometricLocked = Boolean(
      settings?.isBiometricLocked || DEFAULT_USER_SETTINGS.isBiometricLocked,
    );

    // Find the full language option object
    const languageOption =
      SETTING_OPTIONS.language.find(
        (option) => option.value === languageValue,
      ) || SETTING_OPTIONS.language[0];

    // Find the full currency option object
    const currencyOption =
      SETTING_OPTIONS.currency.find(
        (option) => option.value === currencyValue,
      ) || SETTING_OPTIONS.currency[0];

    return {
      language: languageOption,
      currency: currencyOption,
      isBiometricLocked,
    };
  }

  private async validateUniqueFields(
    username?: string,
    email?: string,
  ): Promise<void> {
    const checks: Promise<User | null>[] = [];

    if (username) {
      checks.push(this.usersRepository.findOne({ where: { username } }));
    }

    if (email) {
      checks.push(this.usersRepository.findOne({ where: { email } }));
    }

    const results = await Promise.all(checks);
    const [existingUsername, existingEmail] = results;

    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }
  }
}
