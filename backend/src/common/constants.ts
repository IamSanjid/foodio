export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDING = 'Pending',
  PREPARING = 'Preparing',
  READY = 'Ready',
  COMPLETED = 'Completed',
}

export const UPLOADS_DIR = 'uploads';
export const MENU_ITEM_UPLOADS_SUBDIR = 'menu-items';
export const MAX_UPLOAD_FILE_SIZE = 2 * 1024 * 1024;
export const ALLOWED_UPLOAD_MIME_TYPES = ['image/png', 'image/jpeg'];
