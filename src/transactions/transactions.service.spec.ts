import { Test, TestingModule } from '@nestjs/testing';

import { AccountsService } from '../accounts/accounts.service';
import { DataSource } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { Transaction } from './transaction.entity';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let mockRepository: any;
  let mockDataSource: any;
  let mockAccountsService: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      remove: jest.fn(),
    };

    mockDataSource = {
      createQueryRunner: jest.fn(),
    };

    mockAccountsService = {
      // Add any methods that might be needed
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: AccountsService,
          useValue: mockAccountsService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll with pagination', () => {
    it('should return paginated results with default values', async () => {
      const mockTransactions = [
        { id: 1, amount: 100, date: new Date() },
        { id: 2, amount: 200, date: new Date() },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockTransactions, 2]);

      const result = await service.findAll();

      expect(result).toEqual({
        data: mockTransactions,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['category'],
        order: { date: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should return paginated results with custom page and limit', async () => {
      const paginationDto: PaginationDto = { page: 2, limit: 5 };
      const mockTransactions = [{ id: 6, amount: 300, date: new Date() }];

      mockRepository.findAndCount.mockResolvedValue([mockTransactions, 6]);

      const result = await service.findAll(paginationDto);

      expect(result).toEqual({
        data: mockTransactions,
        total: 6,
        page: 2,
        limit: 5,
        totalPages: 2,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['category'],
        order: { date: 'DESC' },
        skip: 5,
        take: 5,
      });
    });
  });
});
