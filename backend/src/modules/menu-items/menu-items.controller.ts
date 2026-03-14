import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MenuItemsService } from '@/modules/menu-items/menu-items.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants';
import { CreateMenuItemDto } from '@/modules/menu-items/dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '@/modules/menu-items/dto/update-menu-item.dto';
import { QueryMenuItemsDto } from '@/modules/menu-items/dto/query-menu-items.dto';

@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  findAll(@Query() query: QueryMenuItemsDto) {
    return this.menuItemsService.findAllPaginated(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() itemData: CreateMenuItemDto) {
    return this.menuItemsService.create(itemData);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() itemData: UpdateMenuItemDto) {
    return this.menuItemsService.update(+id, itemData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.menuItemsService.remove(+id);
  }
}
