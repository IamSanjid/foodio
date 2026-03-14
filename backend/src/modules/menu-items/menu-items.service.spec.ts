import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemsService } from '@/modules/menu-items/menu-items.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuItem } from '@/entities/menu-item.entity';

describe('MenuItemsService', () => {
  let service: MenuItemsService;

  const mockItem = {
    id: 1,
    name: 'Pizza',
    price: 15.99,
    isAvailable: true,
  } as MenuItem;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        {
          provide: getRepositoryToken(MenuItem),
          useValue: {
            findAndCount: jest.fn().mockResolvedValue([[mockItem], 1]),
            findOne: jest.fn().mockResolvedValue(mockItem),
            create: jest.fn().mockReturnValue(mockItem),
            save: jest.fn().mockResolvedValue(mockItem),
            remove: jest.fn().mockResolvedValue(mockItem),
          },
        },
      ],
    }).compile();

    service = module.get<MenuItemsService>(MenuItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllPaginated', () => {
    it('should return items and total', async () => {
      const result = await service.findAllPaginated();
      expect(result.items).toEqual([mockItem]);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return item if exists', async () => {
      expect(await service.findOne(1)).toEqual(mockItem);
    });
  });
});
