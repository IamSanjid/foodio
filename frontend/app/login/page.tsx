'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
      router.push('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FF5C00]/5 p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-10 premium-shadow">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black text-[#FF5C00] mb-4 block">
            Foodio<span className="text-[#FFB800]">.</span>
          </Link>
          <h2 className="text-2xl font-bold">Welcome Back!</h2>
          <p className="text-gray-500">Login to your account to continue</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-700 ml-2 mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#FF5C00] transition-all"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 ml-2 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#FF5C00] transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF5C00] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#E05200] transition-all shadow-lg flex items-center justify-center gap-3 disabled:bg-gray-300"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Login'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500">
          Don&apos;t have an account? <Link href="/register" className="text-[#FF5C00] font-bold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
