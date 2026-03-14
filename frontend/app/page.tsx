'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCategories } from '@/hooks/useCategories';
import { useMenuItems } from '@/hooks/useMenuItems';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { Search, Filter, Loader2 } from 'lucide-react';

export default function Home() {
  const { categories, loading: catLoading, fetchCategories } = useCategories();
  const { items: menuItems, loading: itemLoading, fetchItems } = useMenuItems();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [fetchCategories, fetchItems]);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = selectedCategory
      ? item.category?.id === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const loading = catLoading || itemLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="bg-[#FF5C00]/5 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
                Fastest Food <span className="text-[#FF5C00]">Delivery</span> in
                Your City
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Hungry? We’ve got you covered. Explore the best menu items from
                top categories and get them delivered in minutes.
              </p>
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for your favorite food..."
                  className="w-full bg-white pl-12 pr-6 py-4 rounded-full premium-shadow focus:outline-none focus:ring-2 focus:ring-[#FF5C00] transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="relative w-full max-w-sm md:max-w-md aspect-square bg-gradient-to-tr from-[#FF5C00] to-[#FFB800] rounded-full overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
                alt="Delicious Food"
                fill
                className="object-cover mix-blend-overlay opacity-80"
              />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Explore Categories</h2>
            <div className="flex items-center gap-2 text-[#FF5C00] font-semibold cursor-pointer">
              <span>View All</span>
              <Filter className="w-4 h-4" />
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-8 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${!selectedCategory ? 'bg-[#FF5C00] text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-8 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-[#FF5C00] text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Menu Items Grid */}
        <section>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 text-[#FF5C00] animate-spin mb-4" />
              <p className="text-gray-500">Loading delicious food...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            selectedCategory || search ? (
              <div>
                <h2 className="text-3xl font-bold mb-8">
                  {selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)?.name
                    : 'Search Results'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-16">
                {categories.map((category) => {
                  const categoryItems = menuItems.filter(
                    (item) => item.category?.id === category.id
                  );
                  if (categoryItems.length === 0) return null;
                  return (
                    <div key={category.id}>
                      <h2 className="text-3xl font-bold mb-8">
                        {category.name}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categoryItems.map((item) => (
                          <MenuItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-[3rem]">
              <p className="text-gray-500 text-lg">
                No menu items found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory(null);
                }}
                className="mt-4 text-[#FF5C00] font-bold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
