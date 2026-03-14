'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 glass premium-shadow px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold text-[#FF5C00]">
        Foodio<span className="text-[#FFB800]">.</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 font-medium">
        <Link href="/" className="hover:text-[#FF5C00] transition-colors">Home</Link>
        <Link href="/about" className="hover:text-[#FF5C00] transition-colors">About</Link>
        <Link href="/contact" className="hover:text-[#FF5C00] transition-colors">Contact</Link>
        {user?.role === 'admin' && (
          <Link href="/admin" className="text-[#FF5C00] font-bold">Admin Panel</Link>
        )}
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF5C00] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/orders" className="flex items-center gap-2 hover:text-[#FF5C00]">
              <User className="w-5 h-5" />
              <span className="hidden md:block font-medium">{user.name}</span>
            </Link>
            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn-primary">
            Login
          </Link>
        )}

        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
