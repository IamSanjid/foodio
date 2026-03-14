import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User, UserRole } from '../../entities/user.entity';
import { OrderStatus } from '../../entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req: { user: User },
    @Body() orderData: { items: { menuItemId: number; quantity: number }[] },
  ) {
    return this.ordersService.create(req.user, orderData);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  findMyOrders(@Request() req: { user: { userId: number } }) {
    return this.ordersService.findByUser(req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.ordersService.findAll({
      limit: limit ? +limit : 10,
      offset: offset ? +offset : 0,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: number; role: UserRole } },
  ) {
    const order = await this.ordersService.findOne(+id);
    // Only admin or the order owner can see detail
    if (req.user.role !== UserRole.ADMIN && order.user.id !== req.user.userId) {
      throw new Error('Unauthorized access to order details');
      // Ideally use ForbiddenException
    }
    return order;
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(+id, status);
  }
}
