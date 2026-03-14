import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { UsersService } from '../modules/users/users.service';
import { CategoriesService } from '../modules/categories/categories.service';
import { MenuItemsService } from '../modules/menu-items/menu-items.service';

describe('SeederService', () => {
  let service: SeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        { provide: UsersService, useValue: {} },
        { provide: CategoriesService, useValue: {} },
        { provide: MenuItemsService, useValue: {} },
      ],
    }).compile();

    service = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
