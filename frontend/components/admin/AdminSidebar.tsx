'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  LogOut,
  Home,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Menu Management', href: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Orders Queue', href: '/admin/orders', icon: ClipboardList },
  ];

  return (
    <aside className="w-64 bg-white h-screen sticky top-0 border-r flex flex-col p-6">
      <Link href="/" className="text-2xl font-black text-[#FF5C00] mb-12 px-2">
        Foodio<span className="text-[#FFB800]">.</span>
      </Link>

      <nav className="grow space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
              pathname === item.href
                ? 'bg-[#FF5C00] text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="pt-6 border-t space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
        >
          <Home className="w-5 h-5" />
          Public Site
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
