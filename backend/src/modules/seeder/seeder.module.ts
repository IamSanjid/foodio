import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { MenuItem } from '../../entities/menu-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, MenuItem])],
  providers: [SeederService],
})
export class SeederModule {}
