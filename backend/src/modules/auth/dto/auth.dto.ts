import { UserRole } from '../../../common/constants';

export class RegisterDto {
  email!: string;
  password!: string;
  name!: string;
  role?: UserRole;
}

export class LoginDto {
  email!: string;
  password!: string;
}
