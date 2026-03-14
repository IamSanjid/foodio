import api from '@/lib/api';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/lib/schemas';
import { User } from '@/types';

export type LoginResponse = {
  access_token: string;
  user: User;
};

export async function login(payload: LoginInput) {
  const safePayload = loginSchema.parse(payload);
  const { data } = await api.post<LoginResponse>('/auth/login', safePayload);
  return data;
}

export async function register(payload: RegisterInput) {
  const safePayload = registerSchema.parse(payload);
  await api.post('/auth/register', safePayload);
}
