import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemsController } from '@/modules/menu-items/menu-items.controller';
import { MenuItemsService } from '@/modules/menu-items/menu-items.service';

describe('MenuItemsController', () => {
  let controller: MenuItemsController;
  let service: jest.Mocked<MenuItemsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuItemsController],
      providers: [
        {
          provide: MenuItemsService,
          useValue: {
            findAllPaginated: jest
              .fn()
              .mockResolvedValue({ items: [], total: 0 }),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MenuItemsController>(MenuItemsController);
    service = module.get(MenuItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAllPaginated', async () => {
      await controller.findAll();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findAllPaginated).toHaveBeenCalled();
    });
  });
});
