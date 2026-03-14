import { IsEnum } from 'class-validator';
import { OrderStatus } from '@/common/constants';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
