'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UtensilsCrossed } from 'lucide-react';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
});

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      router.push('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-16 px-8 md:px-[84px]">
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center">
          <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-[#1A3C34]" />
            <span
              className={`${cormorant.className} text-[26px] leading-[26px] font-semibold tracking-[-0.05em] text-[#1A3C34]`}
            >
              Foodio.
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 md:py-12">
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-center">
          <div className="w-full max-w-[448px]">
            <div className="w-full rounded-xl border border-[#E6E2D8] bg-[#FBFAF8] px-[26px] pb-6 pt-6 shadow-[0px_21.7716px_54.4291px_rgba(26,60,52,0.1)]">
              <div className="mb-6 flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-6 w-6 text-[#1A3C34]" />
                  <span
                    className={`${cormorant.className} text-[26px] leading-[26px] font-semibold tracking-[-0.05em] text-[#1A3C34]`}
                  >
                    Foodio.
                  </span>
                </div>
                <p className="mt-3 text-center text-sm leading-6 font-medium tracking-[-0.3125px] text-[#7A7A7A]">
                  Premium flavors, delivered.
                </p>
              </div>

              <div className="mb-8 h-9 rounded-2xl bg-[#F2EFE9] p-[3px]">
                <div className="grid h-full grid-cols-2">
                  <Link
                    href="/login"
                    className="flex h-[29px] items-center justify-center rounded-xl text-sm leading-5 font-medium tracking-[-0.150391px] text-[#1A1A1A]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="flex h-[29px] items-center justify-center rounded-xl bg-white text-sm leading-5 font-medium tracking-[-0.150391px] text-[#1A1A1A]"
                  >
                    Register
                  </Link>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="h-9 w-full rounded-md border border-[#E6E2D8] bg-white px-3 text-sm leading-[19px] tracking-[-0.150391px] text-[#1A1A1A] outline-none"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="h-9 w-full rounded-md border border-[#E6E2D8] bg-white px-3 text-sm leading-[19px] tracking-[-0.150391px] text-[#1A1A1A] outline-none"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                    Address
                  </label>
                  <input
                    type="text"
                    className="h-9 w-full rounded-md border border-[#E6E2D8] bg-white px-3 text-sm leading-[19px] tracking-[-0.150391px] text-[#1A1A1A] outline-none"
                    placeholder="e.g. House:23, Road:23, Jamaica, USA"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="h-9 w-full rounded-md border border-[#E6E2D8] bg-white px-3 text-sm leading-[19px] tracking-[-0.150391px] text-[#1A1A1A] outline-none"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 h-9 w-full rounded-[56px] bg-[#1A3C34] text-sm leading-5 font-medium tracking-[-0.150391px] text-white transition-colors hover:bg-[#16332D] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E6E2D8] bg-white px-6 py-8 md:h-[93px] md:px-[110px] md:py-0 md:pt-[33px]">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="flex items-center gap-2">
            <span
              className={`${cormorant.className} text-[28px] leading-7 font-bold text-[#1A3C34]`}
            >
              Foodio.
            </span>
            <span className="text-sm leading-5 text-[#7A7A7A]">
              © 2026 Foodio Inc.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm leading-5 tracking-[-0.150391px] text-[#7A7A7A]">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
