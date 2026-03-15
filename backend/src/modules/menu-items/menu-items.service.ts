import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, FindOptionsOrder } from 'typeorm';
import { MenuItem } from '@/entities/menu-item.entity';
import { BaseService } from '@/common/base.service';
import { CreateMenuItemDto } from '@/modules/menu-items/dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '@/modules/menu-items/dto/update-menu-item.dto';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_FILE_SIZE,
  MENU_ITEM_UPLOADS_SUBDIR,
  UPLOADS_DIR,
} from '@/common/constants';
import { randomUUID } from 'crypto';
import { join, normalize, resolve, sep } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';

const MIME_TYPE_EXTENSION_MAP: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
};

@Injectable()
export class MenuItemsService extends BaseService<MenuItem> {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {
    super(menuItemRepository);
  }

  async findAllPaginated(query?: {
    name?: string;
    categoryId?: number;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'price' | 'name' | 'createdAt';
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const {
      name,
      categoryId,
      isAvailable,
      limit = 10,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query || {};
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);

    const where: FindOptionsWhere<MenuItem> = {};
    if (name) where.name = Like(`%${name}%`);
    if (categoryId) where.category = { id: categoryId };
    if (isAvailable !== undefined) where.isAvailable = isAvailable === true;

    const order: FindOptionsOrder<MenuItem> =
      sortBy === 'price'
        ? { price: sortOrder }
        : sortBy === 'name'
          ? { name: sortOrder }
          : { createdAt: sortOrder };

    const [items, total] = await this.findAndCount({
      where,
      relations: ['category'],
      take: safeLimit,
      skip: safeOffset,
      order,
    });

    return { items, total };
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only PNG and JPEG files are allowed');
    }

    if (!file.buffer || file.size > MAX_UPLOAD_FILE_SIZE) {
      throw new BadRequestException(
        'Image size must be less than or equal to 2MB',
      );
    }

    this.assertSupportedImageSignature(file);

    const extension = MIME_TYPE_EXTENSION_MAP[file.mimetype];
    if (!extension) {
      throw new BadRequestException('Only PNG and JPEG files are allowed');
    }

    const uploadsPath = join(
      process.cwd(),
      UPLOADS_DIR,
      MENU_ITEM_UPLOADS_SUBDIR,
    );
    await mkdir(uploadsPath, { recursive: true });

    const filename = `${Date.now()}-${randomUUID()}${extension}`;
    const filePath = join(uploadsPath, filename);

    await writeFile(filePath, file.buffer, { flag: 'wx' });

    return { url: `/${UPLOADS_DIR}/${MENU_ITEM_UPLOADS_SUBDIR}/${filename}` };
  }

  private assertSupportedImageSignature(file: Express.Multer.File) {
    const { mimetype, buffer } = file;

    if (mimetype === 'image/png') {
      const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      const isValidPng = pngSignature.every(
        (byte, index) => buffer[index] === byte,
      );

      if (!isValidPng) {
        throw new BadRequestException('Invalid PNG file content');
      }

      return;
    }

    if (mimetype === 'image/jpeg') {
      const isValidJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;

      if (!isValidJpeg) {
        throw new BadRequestException('Invalid JPEG file content');
      }
    }
  }

  override findOne(id: number) {
    return super.findOne(id, ['category']);
  }

  override create(data: CreateMenuItemDto) {
    const { categoryId, ...rest } = data;
    return super.create({
      ...rest,
      ...(categoryId
        ? { category: { id: categoryId } as MenuItem['category'] }
        : {}),
    });
  }

  override update(id: number, data: UpdateMenuItemDto) {
    return this.updateWithImageCleanup(id, data);
  }

  override remove(id: number) {
    return this.removeWithImageCleanup(id);
  }

  private async updateWithImageCleanup(id: number, data: UpdateMenuItemDto) {
    const existingItem = await this.findOne(id);
    const previousImage = existingItem.image;

    const { categoryId, ...rest } = data;
    const updateData: Partial<MenuItem> = { ...rest };

    if (categoryId !== undefined) {
      updateData.category = { id: categoryId } as MenuItem['category'];
    }

    const updatedItem = await super.update(id, updateData);

    if (data.image !== undefined && data.image !== previousImage) {
      await this.removeLocalUploadedImage(previousImage);
    }

    return updatedItem;
  }

  private async removeWithImageCleanup(id: number) {
    const existingItem = await this.findOne(id);
    const previousImage = existingItem.image;

    const removedItem = await super.remove(id);
    await this.removeLocalUploadedImage(previousImage);

    return removedItem;
  }

  private async removeLocalUploadedImage(imageUrl?: string | null) {
    const localFilePath = this.resolveLocalUploadPath(imageUrl);

    if (!localFilePath) {
      return;
    }

    await rm(localFilePath, { force: true });
  }

  private resolveLocalUploadPath(imageUrl?: string | null) {
    if (!imageUrl) {
      return null;
    }

    if (/^https?:\/\//i.test(imageUrl)) {
      return null;
    }

    let uploadsRelativePath: string;

    if (imageUrl.startsWith(`/${UPLOADS_DIR}/`)) {
      uploadsRelativePath = imageUrl.slice(`/${UPLOADS_DIR}/`.length);
    } else if (imageUrl.startsWith(`${UPLOADS_DIR}/`)) {
      uploadsRelativePath = imageUrl.slice(`${UPLOADS_DIR}/`.length);
    } else {
      return null;
    }

    let decodedRelativePath: string;
    try {
      decodedRelativePath = decodeURIComponent(uploadsRelativePath);
    } catch {
      return null;
    }

    const safeRelativePath = normalize(decodedRelativePath);
    if (
      safeRelativePath.length === 0 ||
      safeRelativePath.startsWith('..') ||
      safeRelativePath.includes(`..${sep}`)
    ) {
      return null;
    }

    const uploadsRootPath = resolve(process.cwd(), UPLOADS_DIR);
    const resolvedFilePath = resolve(uploadsRootPath, safeRelativePath);

    if (
      resolvedFilePath !== uploadsRootPath &&
      !resolvedFilePath.startsWith(`${uploadsRootPath}${sep}`)
    ) {
      return null;
    }

    return resolvedFilePath;
  }
}
