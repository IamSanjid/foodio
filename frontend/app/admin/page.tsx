'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ShoppingBag, Users, DollarSign, Utensils } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    availableItems: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [orders, items] = await Promise.all([
          api.get('/orders'),
          api.get('/menu-items'),
        ]);

        const revenue = orders.data.reduce(
          (acc: number, o: { totalAmount: number }) =>
            acc + Number(o.totalAmount),
          0
        );

        setStats({
          totalOrders: orders.data.length,
          totalRevenue: revenue,
          totalCustomers: new Set(
            orders.data.map((o: { user: { id: number } }) => o.user.id)
          ).size,
          availableItems: items.data.items.length,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      name: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      name: 'Menu Items',
      value: stats.availableItems,
      icon: Utensils,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black mb-10">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {cards.map((card) => (
          <div
            key={card.name}
            className="bg-white p-8 rounded-[2.5rem] premium-shadow"
          >
            <div
              className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-6`}
            >
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium mb-1">{card.name}</p>
            <h3 className="text-3xl font-black">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[3rem] premium-shadow">
        <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
        <p className="text-gray-500">
          System is running smoothly. Check management tabs for details.
        </p>
      </div>
    </div>
  );
}
