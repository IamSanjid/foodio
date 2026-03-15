import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { UserRole } from '@/common/constants';

import { Category } from '@/entities/category.entity';
import { MenuItem } from '@/entities/menu-item.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

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
    this.logger.log('Seeding data...');

    // Users
    const adminPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'admin123',
      10,
    );

    const admin = this.userRepository.create({
      email: process.env.ADMIN_EMAIL,
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    });

    const users = [admin];

    if (process.env.SEED_INITIAL_DATA === 'true') {
      const userPassword = await bcrypt.hash('user123', 10);

      const user = this.userRepository.create({
        email: 'user@foodio.com',
        password: userPassword,
        name: 'John Doe',
        role: UserRole.USER,
        address: 'House:23, Road:23, Jamaica, USA',
      });

      users.push(user);

      // Categories
      const categories = this.categoryRepository.create([
        { name: 'Starters', description: 'Starter apetiters' },
        { name: 'Main Courses', description: 'Main meal' },
        { name: 'Dessert', description: 'Sweet savoring flavourful' },
      ]);
      const savedCategories = await this.categoryRepository.save(categories);

      // Menu Items
      const menuItems = this.menuItemRepository.create([
        {
          name: 'French Fries',
          description:
            'Classic crispy french fries. Potato crackers one can enjoy any times.',
          price: 8.99,
          image:
            'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=700&q=80',
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
          name: 'Meat Balls',
          description: 'Simple and tasty meat balls, properly seasoned',
          price: 12.99,
          image:
            'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=700&q=80',
          isAvailable: true,
          category: savedCategories[1],
        },
        {
          name: 'Cheese Pasta',
          description:
            'Everything you can think of a cheese pasta, it has it. With special meat touch.',
          price: 14.99,
          image:
            'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=700&q=80',
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
    }

    await this.userRepository.save(users);

    this.logger.log('Seeding completed.');
  }
}
