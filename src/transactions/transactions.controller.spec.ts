import { Test, TestingModule } from '@nestjs/testing';

import { PaginationDto } from './dto/pagination.dto';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockTransactionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    findByAccountId: jest.fn(),
    findByCategoryId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated transactions when no filters are applied', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockTransactionsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(undefined, undefined, undefined, paginationDto);

      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated transactions filtered by userId', async () => {
      const paginationDto: PaginationDto = { page: 2, limit: 5 };
      const expectedResult = {
        data: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      };

      mockTransactionsService.findByUserId.mockResolvedValue(expectedResult);

      const result = await controller.findAll('123', undefined, undefined, paginationDto);

      expect(service.findByUserId).toHaveBeenCalledWith(123, paginationDto);
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated transactions filtered by accountId', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockTransactionsService.findByAccountId.mockResolvedValue(expectedResult);

      const result = await controller.findAll(undefined, '456', undefined, paginationDto);

      expect(service.findByAccountId).toHaveBeenCalledWith(456, paginationDto);
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated transactions filtered by categoryId', async () => {
      const paginationDto: PaginationDto = { page: 3, limit: 15 };
      const expectedResult = {
        data: [],
        total: 0,
        page: 3,
        limit: 15,
        totalPages: 0,
      };

      mockTransactionsService.findByCategoryId.mockResolvedValue(expectedResult);

      const result = await controller.findAll(undefined, undefined, '789', paginationDto);

      expect(service.findByCategoryId).toHaveBeenCalledWith(789, paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
