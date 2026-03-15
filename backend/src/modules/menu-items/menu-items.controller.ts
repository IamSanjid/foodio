import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuItemsService } from '@/modules/menu-items/menu-items.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { MAX_UPLOAD_FILE_SIZE, UserRole } from '@/common/constants';
import { CreateMenuItemDto } from '@/modules/menu-items/dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '@/modules/menu-items/dto/update-menu-item.dto';
import { QueryMenuItemsDto } from '@/modules/menu-items/dto/query-menu-items.dto';

@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_UPLOAD_FILE_SIZE,
      },
    }),
  )
  upload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: MAX_UPLOAD_FILE_SIZE,
        })
        .addFileTypeValidator({
          fileType: /^(image\/png|image\/jpeg)$/,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
          exceptionFactory: () =>
            new BadRequestException(
              `Only PNG/JPEG files up to ${MAX_UPLOAD_FILE_SIZE / (1024 * 1024)}MB are allowed`,
            ),
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.menuItemsService.uploadImage(file);
  }

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
