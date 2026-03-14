import { NotFoundException } from '@nestjs/common';
import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  DeepPartial,
} from 'typeorm';

export interface BaseEntity {
  id: number;
}

export abstract class BaseService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(options?: FindManyOptions<T>) {
    return this.repository.find(options);
  }

  async findAndCount(options?: FindManyOptions<T>) {
    return this.repository.findAndCount(options);
  }

  async findOne(id: number, relations: string[] = []) {
    const item = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      relations,
    });
    if (!item) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return item;
  }

  async create(data: DeepPartial<T>) {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: DeepPartial<T>, relations: string[] = []) {
    const entity = await this.findOne(id, relations);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    return this.repository.remove(entity);
  }
}
