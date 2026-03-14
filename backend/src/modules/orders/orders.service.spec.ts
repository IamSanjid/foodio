import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '@/modules/orders/orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '@/entities/order.entity';
import { OrderStatus } from '@/common/constants';

import { MenuItem } from '@/entities/menu-item.entity';
import { User } from '@/entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepo: Repository<Order>;
  let menuItemRepo: Repository<MenuItem>;

  const mockUser = { id: 1, email: 'user@ex.com' } as User;
  const mockMenuItem = {
    id: 1,
    name: 'Burger',
    price: 10,
    isAvailable: true,
  } as MenuItem;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest
              .fn()
              .mockImplementation((order: Order) =>
                Promise.resolve({ ...order, id: 1 } as any),
              ),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MenuItem),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
    menuItemRepo = module.get<Repository<MenuItem>>(
      getRepositoryToken(MenuItem),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFound if item does not exist', async () => {
      (menuItemRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.create(mockUser, { items: [{ menuItemId: 99, quantity: 1 }] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequest if item is unavailable', async () => {
      (menuItemRepo.findOne as jest.Mock).mockResolvedValue({
        ...mockMenuItem,
        isAvailable: false,
      });
      await expect(
        service.create(mockUser, { items: [{ menuItemId: 1, quantity: 1 }] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully create an order', async () => {
      (menuItemRepo.findOne as jest.Mock).mockResolvedValue(mockMenuItem);
      const result = await service.create(mockUser, {
        items: [{ menuItemId: 1, quantity: 2 }],
      });

      expect(result.totalAmount).toBe(20);
      expect(result.status).toBe(OrderStatus.PENDING);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(orderRepo.save).toHaveBeenCalled();
    });
  });
});
