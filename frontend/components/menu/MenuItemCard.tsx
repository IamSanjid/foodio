'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { MenuItem } from '@/types';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    addItem(item);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl overflow-hidden premium-shadow group cursor-pointer"
      onClick={() => router.push(`/item/${item.id}`)}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={
            item.image ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'
          }
          alt={item.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg leading-tight group-hover:text-[#FF5C00] transition-colors">
            {item.name}
          </h3>
          <span className="text-[#FF5C00] font-bold text-lg">
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
          {item.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {item.category?.name}
          </span>
          <button
            disabled={!item.isAvailable}
            onClick={handleAddToCart}
            className="bg-[#FF5C00] text-white p-2 rounded-xl hover:bg-[#E05200] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
