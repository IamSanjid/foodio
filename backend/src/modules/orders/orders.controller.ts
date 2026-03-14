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
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from '@/modules/orders/orders.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants';
import { User } from '@/entities/user.entity';
import { CreateOrderDto } from '@/modules/orders/dto/create-order.dto';
import { QueryOrdersDto } from '@/modules/orders/dto/query-orders.dto';
import { UpdateOrderStatusDto } from '@/modules/orders/dto/update-order-status.dto';

type AuthenticatedRequest = {
  user: { userId: number; email: string; role: UserRole };
};

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req: AuthenticatedRequest,
    @Body() orderData: CreateOrderDto,
  ) {
    return this.ordersService.create(
      { id: req.user.userId } as User,
      orderData,
    );
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  findMyOrders(@Request() req: AuthenticatedRequest) {
    return this.ordersService.findByUser(req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: QueryOrdersDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const order = await this.ordersService.findOne(+id);
    // Only admin or the order owner can see detail
    if (req.user.role !== UserRole.ADMIN && order.user.id !== req.user.userId) {
      throw new ForbiddenException('Unauthorized access to order details');
    }
    return order;
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(+id, body.status);
  }
}
