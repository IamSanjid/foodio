import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '@/common/constants';
import { Order } from '@/entities/order.entity';

import { OrderItem } from '@/entities/order-item.entity';
import { MenuItem } from '@/entities/menu-item.entity';
import { User } from '@/entities/user.entity';
import { CreateOrderDto } from '@/modules/orders/dto/create-order.dto';
import { QueryOrdersDto } from '@/modules/orders/dto/query-orders.dto';

const MAX_ORDER_ITEM_QUANTITY = 50;

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PREPARING],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async create(user: User, orderData: CreateOrderDto) {
    if (!orderData.items.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of orderData.items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new BadRequestException(
          'Item quantity must be a positive integer',
        );
      }

      if (item.quantity > MAX_ORDER_ITEM_QUANTITY) {
        throw new BadRequestException(
          `Item quantity cannot exceed ${MAX_ORDER_ITEM_QUANTITY}`,
        );
      }

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

  async findAll(query?: QueryOrdersDto) {
    const { limit = 10, offset = 0 } = query || {};
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);

    const [orders, total] = await this.orderRepository.findAndCount({
      relations: ['user', 'items', 'items.menuItem'],
      order: { createdAt: 'DESC' },
      take: safeLimit,
      skip: safeOffset,
    });
    return { orders, total };
  }

  async findByUser(userId: number) {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.menuItem'],
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

    if (order.status === status) {
      return order;
    }

    const allowedStatuses = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${status}`,
      );
    }

    order.status = status;
    return this.orderRepository.save(order);
  }
}
