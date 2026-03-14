import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { MenuItem } from '@/entities/menu-item.entity';
import { BaseService } from '@/common/base.service';

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

    const where: FindOptionsWhere<MenuItem> = {};
    if (name) where.name = Like(`%${name}%`);
    if (categoryId) where.category = { id: categoryId };
    if (isAvailable !== undefined) where.isAvailable = isAvailable === true;

    const [items, total] = await this.findAndCount({
      where,
      relations: ['category'],
      take: limit,
      skip: offset,
    });

    return { items, total };
  }

  override findOne(id: number) {
    return super.findOne(id, ['category']);
  }
}
