import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { RegisterDto, LoginDto } from '@/modules/auth/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userData: RegisterDto) {
    return this.authService.register(userData);
  }

  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }
}
