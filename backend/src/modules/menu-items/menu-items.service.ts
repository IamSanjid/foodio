import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { MenuItem } from '@/entities/menu-item.entity';
import { BaseService } from '@/common/base.service';
import { CreateMenuItemDto } from '@/modules/menu-items/dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '@/modules/menu-items/dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService extends BaseService<MenuItem> {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {
    super(menuItemRepository);
  }

  async findAllPaginated(query?: {
    name?: string;
    categoryId?: number;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const {
      name,
      categoryId,
      isAvailable,
      limit = 10,
      offset = 0,
    } = query || {};
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);

    const where: FindOptionsWhere<MenuItem> = {};
    if (name) where.name = Like(`%${name}%`);
    if (categoryId) where.category = { id: categoryId };
    if (isAvailable !== undefined) where.isAvailable = isAvailable === true;

    const [items, total] = await this.findAndCount({
      where,
      relations: ['category'],
      take: safeLimit,
      skip: safeOffset,
    });

    return { items, total };
  }

  override findOne(id: number) {
    return super.findOne(id, ['category']);
  }

  override create(data: CreateMenuItemDto) {
    const { categoryId, ...rest } = data;
    return super.create({
      ...rest,
      ...(categoryId
        ? { category: { id: categoryId } as MenuItem['category'] }
        : {}),
    });
  }

  override update(id: number, data: UpdateMenuItemDto) {
    const { categoryId, ...rest } = data;
    const updateData: Partial<MenuItem> = { ...rest };

    if (categoryId !== undefined) {
      updateData.category = { id: categoryId } as MenuItem['category'];
    }

    return super.update(id, updateData);
  }
}
