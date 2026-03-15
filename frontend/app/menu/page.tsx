'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCategories } from '@/hooks/useCategories';
import { useMenuItems } from '@/hooks/useMenuItems';
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  Loader2,
  Check,
  Circle,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { Cormorant_Garamond } from 'next/font/google';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/useToast';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600'],
});

const menuFallbackImages = [
  'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=700&q=80',
  'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=700&q=80',
  'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=700&q=80',
  'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=700&q=80',
  'https://images.unsplash.com/photo-1529692236671-f1dc2213f1f4?w=700&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=700&q=80',
  'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=700&q=80',
  'https://images.unsplash.com/photo-1625943555419-56a2cb596640?w=700&q=80',
];

function normalizeImageUrl(url: string | null | undefined, index: number) {
  if (!url || !url.trim()) {
    return menuFallbackImages[index % menuFallbackImages.length];
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  return `${apiBase}${url.startsWith('/') ? url : `/${url}`}`;
}

function normalizePrice(price: unknown) {
  const parsed = Number(price);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MenuPage() {
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
  } = useCategories();
  const { items, loading: itemsLoading, fetchItems } = useMenuItems();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [sortByPrice, setSortByPrice] = useState(true);
  const [quantityPopover, setQuantityPopover] = useState<{
    itemId: number;
    itemName: string;
    itemPrice: number;
    itemImage: string;
    x: number;
    y: number;
  } | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const quantityPopoverRef = useRef<HTMLDivElement | null>(null);
  const visibleCategories = categories.slice(0, 3);
  const activeCategoryId = selectedCategory;

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItems({
        name: search.trim() || undefined,
        categoryId: activeCategoryId ?? undefined,
        isAvailable: availabilityOnly ? true : undefined,
        limit: 8,
        offset: 0,
        sortBy: sortByPrice ? 'price' : 'createdAt',
        sortOrder: sortByPrice ? 'ASC' : 'DESC',
      });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [availabilityOnly, activeCategoryId, fetchItems, search, sortByPrice]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node)
      ) {
        setSortOpen(false);
      }
    };

    if (sortOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [sortOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        quantityPopoverRef.current &&
        !quantityPopoverRef.current.contains(event.target as Node)
      ) {
        setQuantityPopover(null);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setQuantityPopover(null);
      }
    };

    if (quantityPopover) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [quantityPopover]);

  const openQuantityPopover = (
    event: React.MouseEvent<HTMLButtonElement>,
    itemId: number,
    itemName: string,
    itemPrice: number,
    itemImage: string
  ) => {
    const triggerRect = event.currentTarget.getBoundingClientRect();
    const popoverWidth = Math.min(512, window.innerWidth - 24);
    const popoverHeight = 240;
    const spacing = 10;

    let left = triggerRect.left + triggerRect.width / 2 - popoverWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - popoverWidth - 12));

    let top = triggerRect.bottom + spacing;
    if (top + popoverHeight > window.innerHeight - 12) {
      top = triggerRect.top - popoverHeight - spacing;
    }
    top = Math.max(12, top);

    setSelectedQuantity(1);
    setQuantityPopover({
      itemId,
      itemName,
      itemPrice,
      itemImage,
      x: left,
      y: top,
    });
  };

  const confirmAddToCart = () => {
    if (!quantityPopover) return;

    const itemName = quantityPopover.itemName;
    const quantity = selectedQuantity;

    for (let count = 0; count < selectedQuantity; count += 1) {
      addItem({
        id: quantityPopover.itemId,
        name: quantityPopover.itemName,
        price: quantityPopover.itemPrice,
        image: quantityPopover.itemImage,
      });
    }

    showToast(
      <>
        {quantity}{' '}
        <strong>
          {itemName}
          {quantity > 1 ? 's' : ''}
        </strong>{' '}
        added to cart
      </>,
      'success'
    );
    setQuantityPopover(null);
  };

  const loading = categoriesLoading || itemsLoading;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto w-full max-w-[1440px]">
        <section className="px-6 pb-[120px] pt-[42px] md:px-[100px] md:pt-[42px]">
          <h1
            className={`${cormorant.className} text-center text-[54px] leading-[100%] font-semibold tracking-[-0.05em] text-[#1A3C34]`}
          >
            Our Menu
          </h1>
          <p className="mx-auto mt-[18px] max-w-[509px] text-center text-[18px] leading-[25px] font-medium tracking-[-0.02em] text-[#2D2D2D]">
            Discover our selection of premium dishes, crafted with passion.
          </p>

          <div className="mt-[42px] flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`h-9 rounded-full px-4 text-sm leading-5 font-medium tracking-[-0.150391px] transition-all duration-200 ${activeCategoryId === null ? 'bg-[#1A3C34] text-white shadow-[0px_6px_14px_rgba(26,60,52,0.2)]' : 'border border-[#E6E2D8] bg-[#FBFAF8] text-[#1A1A1A] hover:border-[#d2ccc0] hover:bg-[#F7F5F0]'}`}
              >
                All
              </button>

              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`h-9 rounded-full px-4 text-sm leading-5 font-medium tracking-[-0.150391px] transition-all duration-200 ${activeCategoryId === category.id ? 'bg-[#1A3C34] text-white shadow-[0px_6px_14px_rgba(26,60,52,0.2)]' : 'border border-[#E6E2D8] bg-[#FBFAF8] text-[#1A1A1A] hover:border-[#d2ccc0] hover:bg-[#F7F5F0]'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-full min-w-[240px] max-w-[310px] items-center gap-2 rounded-full border border-[#E6E2D8] bg-[#FBFAF8] px-3 md:w-[310px]">
                <Search className="h-[18px] w-[18px] text-[#1A1A1A]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="w-full bg-transparent text-sm leading-5 font-medium tracking-[-0.150391px] text-[#1A1A1A] outline-none placeholder:text-[#7A7A7A]"
                />
              </div>

              <div className="relative" ref={sortMenuRef}>
                <button
                  onClick={() => setSortOpen((prev) => !prev)}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-[#1A3C34] px-3 text-sm leading-5 font-medium tracking-[-0.150391px] text-white"
                >
                  Sort
                  <SlidersHorizontal className="h-4 w-4" />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-11 z-20 h-[140px] w-[213px] rounded-md border border-[#E6E2D8] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between px-3 pt-3">
                      <p className="text-base leading-[25px] font-semibold text-[#1A3C34]">
                        Sort by
                      </p>
                      <button
                        onClick={() => {
                          setAvailabilityOnly(false);
                          setSortByPrice(false);
                        }}
                        className="text-sm leading-5 font-medium tracking-[-0.150391px] text-[#7A7A7A]"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="mx-[5px] mt-[12px] border-t border-[#E6E2D8]" />

                    <button
                      onClick={() => setAvailabilityOnly((prev) => !prev)}
                      className="mt-[6px] flex h-8 w-[203px] items-center justify-between px-2"
                    >
                      <span className="text-sm leading-5 font-medium tracking-[-0.150391px] text-[#7A7A7A]">
                        Availability
                      </span>
                      {availabilityOnly ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1A3C34]">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </span>
                      ) : (
                        <Circle className="h-5 w-5 text-[#7A7A7A]" />
                      )}
                    </button>

                    <button
                      onClick={() => setSortByPrice((prev) => !prev)}
                      className={`mt-2 flex h-8 w-[203px] items-center justify-between rounded px-2 ${sortByPrice ? 'bg-[#F7F7F7]' : 'bg-white'}`}
                    >
                      <span className="text-sm leading-5 font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                        Price
                      </span>
                      {sortByPrice ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1A3C34]">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </span>
                      ) : (
                        <Circle className="h-5 w-5 text-[#7A7A7A]" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex h-[600px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#1A3C34]" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-[600px] items-center justify-center text-center">
              <p className="text-base leading-6 font-medium text-[#7A7A7A]">
                No menu items found for your current filters.
              </p>
            </div>
          ) : (
            <div className="mt-[94px] grid grid-cols-1 justify-items-center gap-x-10 gap-y-[68px] md:grid-cols-2 xl:grid-cols-4">
              {items.map((item, index) => {
                const itemPrice = normalizePrice(item.price);

                return (
                  <article
                    key={item.id}
                    className="relative h-[336px] w-[280px]"
                  >
                    <div className="absolute left-0 top-[56px] h-[280px] w-[280px] rounded-tl-none rounded-tr-[34px] rounded-br-none rounded-bl-[34px] bg-[#FEF7EA] px-5 pt-[116px]">
                      <h3 className="w-[240px] text-[18px] leading-[22px] font-bold text-[#1A1A1A]">
                        {item.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 w-[240px] text-sm leading-[22px] font-medium text-[#7A7A7A]">
                        {item.description}
                      </p>
                      <p className="mt-[12px] text-[24px] leading-[22px] font-extrabold text-[#1A3C34]">
                        ${itemPrice.toFixed(2)}
                      </p>

                      <button
                        onClick={(event) =>
                          openQuantityPopover(
                            event,
                            item.id,
                            item.name,
                            itemPrice,
                            normalizeImageUrl(item.image, index)
                          )
                        }
                        className="absolute bottom-[-22px] left-[140px] inline-flex h-[45px] w-[140px] items-center justify-center gap-[6px] rounded-tl-[20px] rounded-tr-none rounded-br-[20px] rounded-bl-[20px] bg-[#1A3C34] text-base leading-[22px] font-semibold text-white transition-shadow duration-200 hover:shadow-[0px_10px_16px_rgba(26,60,52,0.35)]"
                      >
                        Add to Cart
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="absolute left-[-22px] top-[-34px] h-[206px] w-[209px] rounded-full bg-black/20 blur-[27px]" />

                    <div className="absolute left-[-35px] top-[-50px] h-[206px] w-[209px] overflow-hidden rounded-full shadow-[0px_18px_27px_rgba(0,0,0,0.18)]">
                      <Image
                        src={normalizeImageUrl(item.image, index)}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {quantityPopover && (
        <div
          ref={quantityPopoverRef}
          className="fixed z-40 h-[240px] w-[min(512px,calc(100vw-24px))] rounded-xl border border-[#E6E2D8] bg-[#FBFAF8] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
          style={{ left: quantityPopover.x, top: quantityPopover.y }}
        >
          <h3 className="absolute left-[25px] top-6 text-[18px] leading-[25px] font-bold text-[#1A3C34]">
            Select the quantity
          </h3>

          <button
            onClick={() => setQuantityPopover(null)}
            className="absolute right-[25px] top-[29px] opacity-70"
          >
            <X className="h-4 w-4 text-[#7A7A7A]" />
          </button>

          <p className="absolute left-[25px] top-20 text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#7A7A7A]">
            Items
          </p>

          <p className="absolute left-[25px] right-[190px] top-[109px] truncate text-base leading-5 font-semibold tracking-[-0.150391px] text-[#1A1A1A]">
            {quantityPopover.itemName}
          </p>

          <div className="absolute right-[22px] top-[98px] flex h-[44px] items-center gap-[7px]">
            <button
              onClick={() =>
                setSelectedQuantity((prev) => Math.max(1, prev - 1))
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1A3C34] text-[#1A3C34] opacity-60"
            >
              <Minus className="h-5 w-5" />
            </button>

            <div className="flex h-11 w-[67px] items-center justify-center rounded-xl border-[1.5px] border-[#E6E2D8] bg-[#FBFAF8]">
              <span className="text-[30px] leading-5 font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                {selectedQuantity}
              </span>
            </div>

            <button
              onClick={() => setSelectedQuantity((prev) => prev + 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1A3C34] text-[#1A3C34]"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() => setQuantityPopover(null)}
            className="absolute bottom-7 right-[172px] h-9 w-[139px] rounded-[56px] border border-[#1A3C34] text-sm leading-5 font-medium tracking-[-0.150391px] text-[#1A3C34]"
          >
            Cancel
          </button>

          <button
            onClick={confirmAddToCart}
            className="absolute bottom-7 right-[25px] h-9 w-[139px] rounded-[56px] bg-[#1A3C34] text-sm leading-5 font-medium tracking-[-0.150391px] text-white"
          >
            Add to cart
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
