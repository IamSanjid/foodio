import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { UserRole } from '@/common/constants';

import { Category } from '@/entities/category.entity';
import { MenuItem } from '@/entities/menu-item.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async onModuleInit() {
    // Check if data already exists
    const userCount = await this.userRepository.count();
    if (userCount > 0) return;

    await this.seed();
  }

  async seed() {
    console.log('Seeding data...');

    // Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = this.userRepository.create({
      email: 'admin@foodio.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    });

    const user = this.userRepository.create({
      email: 'user@foodio.com',
      password: userPassword,
      name: 'Sanjid Ahmed',
      role: UserRole.USER,
    });

    await this.userRepository.save([admin, user]);

    // Categories
    const categories = this.categoryRepository.create([
      { name: 'Burgers', description: 'Delicious juicy burgers' },
      { name: 'Pizza', description: 'Cheesy and crusty pizzas' },
      { name: 'Drinks', description: 'Refreshing beverages' },
    ]);
    const savedCategories = await this.categoryRepository.save(categories);

    // Menu Items
    const menuItems = this.menuItemRepository.create([
      {
        name: 'Cheese Burger',
        description: 'Classic cheese burger with beef patty',
        price: 8.99,
        image:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        isAvailable: true,
        category: savedCategories[0],
      },
      {
        name: 'Veggie Burger',
        description: 'Healthy burger with plant-based patty',
        price: 7.99,
        image:
          'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=500',
        isAvailable: true,
        category: savedCategories[0],
      },
      {
        name: 'Margherita Pizza',
        description: 'Simple and tasty with tomato and mozzarella',
        price: 12.99,
        image:
          'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=500',
        isAvailable: true,
        category: savedCategories[1],
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni with extra cheese',
        price: 14.99,
        image:
          'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
        isAvailable: true,
        category: savedCategories[1],
      },
      {
        name: 'Coca Cola',
        description: 'Cold and bubbly drink',
        price: 1.99,
        image:
          'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500',
        isAvailable: true,
        category: savedCategories[2],
      },
    ]);
    await this.menuItemRepository.save(menuItems);

    console.log('Seeding completed.');
  }
}
