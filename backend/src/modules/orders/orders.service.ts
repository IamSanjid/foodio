import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async create(
    user: User,
    orderData: { items: { menuItemId: number; quantity: number }[] },
  ) {
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of orderData.items) {
      const menuItem = await this.menuItemRepository.findOne({
        where: { id: item.menuItemId },
      });

      if (!menuItem) {
        throw new NotFoundException(`Menu Item #${item.menuItemId} not found`);
      }

      if (!menuItem.isAvailable) {
        throw new BadRequestException(
          `Menu Item ${menuItem.name} is currently unavailable`,
        );
      }

      const orderItem = new OrderItem();
      orderItem.menuItem = menuItem;
      orderItem.quantity = item.quantity;
      orderItem.priceAtTime = menuItem.price;

      totalAmount += menuItem.price * item.quantity;
      orderItems.push(orderItem);
    }

    const order = this.orderRepository.create({
      user,
      totalAmount,
      items: orderItems,
      status: OrderStatus.PENDING,
    });

    return this.orderRepository.save(order);
  }

  async findAll(query?: { limit?: number; offset?: number }) {
    const { limit = 10, offset = 0 } = query || {};
    const [orders, total] = await this.orderRepository.findAndCount({
      relations: ['user', 'items', 'items.menuItem'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { orders, total };
  }

  async findByUser(userId: number) {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.menuItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.menuItem'],
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepository.save(order);
  }
}
