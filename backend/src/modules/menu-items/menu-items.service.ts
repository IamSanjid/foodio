import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { MenuItem } from '../../entities/menu-item.entity';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async findAll(query?: {
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

    const [items, total] = await this.menuItemRepository.findAndCount({
      where,
      relations: ['category'],
      take: limit,
      skip: offset,
    });

    return { items, total };
  }

  async findOne(id: number) {
    const item = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!item) {
      throw new NotFoundException(`Menu Item #${id} not found`);
    }
    return item;
  }

  create(itemData: Partial<MenuItem>) {
    const item = this.menuItemRepository.create(itemData);
    return this.menuItemRepository.save(item);
  }

  async update(id: number, itemData: Partial<MenuItem>) {
    const item = await this.findOne(id);
    Object.assign(item, itemData);
    return this.menuItemRepository.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    return this.menuItemRepository.remove(item);
  }
}
