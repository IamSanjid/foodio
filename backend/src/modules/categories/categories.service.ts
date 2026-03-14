import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '@/entities/category.entity';
import { BaseService } from '@/common/base.service';

@Injectable()
export class CategoriesService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {
    super(categoryRepository);
  }

  override findAll() {
    return super.findAll({ relations: ['menuItems'] });
  }

  override findOne(id: number) {
    return super.findOne(id, ['menuItems']);
  }
}
