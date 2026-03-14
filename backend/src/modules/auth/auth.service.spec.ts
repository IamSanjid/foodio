import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/modules/auth/auth.service';
import { UsersService } from '@/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/entities/user.entity';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    name: 'Test User',
    role: 'user',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('testtoken'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw conflict if user exists', async () => {
      usersService.findOneByEmail.mockResolvedValue(mockUser);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(service.register(mockUser as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create user if not exists', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      const result = await service.register({
        email: 'new@ex.com',
        password: 'pass',
        name: 'New',
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...expected } = mockUser;
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should throw unauthorized if user not found', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'no@ex.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token on success', async () => {
      usersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'pass',
      });
      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe(mockUser.email);
    });
  });
});
