'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, ShoppingCart, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  category: { id: number; name: string };
}

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`/menu-items/${id}`);
        setItem(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (item) {
      addItem(item);
    }
  };

  if (loading || !item) return null; // Or a loader

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#FF5C00] mb-8 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Menu
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[400px] md:h-[600px]"
          >
            <Image 
              src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'} 
              alt={item.name}
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-[#FF5C00] font-bold uppercase tracking-widest text-sm mb-4 block">
              {item.category?.name}
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6">{item.name}</h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {item.description}
            </p>

            <div className="flex items-center gap-8 mb-10">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm font-medium">Price</span>
                <span className="text-3xl font-black text-[#FF5C00]">${Number(item.price).toFixed(2)}</span>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm font-medium">Status</span>
                <div className="flex items-center gap-2 mt-1">
                  {item.isAvailable ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-bold text-green-500">Available</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="font-bold text-red-500">Sold Out</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button 
              disabled={!item.isAvailable}
              onClick={handleAddToCart}
              className="w-full md:w-auto flex items-center justify-center gap-4 bg-[#FF5C00] text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-[#E05200] disabled:bg-gray-300 shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-6 h-6" />
              Add to Cart
            </button>

            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="p-2 rounded-lg bg-gray-100"><Clock className="w-4 h-4" /></div>
                <span>Delivery: 15-30 min</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="p-2 rounded-lg bg-gray-100"><CheckCircle className="w-4 h-4" /></div>
                <span>Best Quality</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
