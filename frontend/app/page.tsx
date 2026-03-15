'use client';

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Clock3,
  Flame,
  UtensilsCrossed,
  ChefHat,
  IceCreamCone,
  ShoppingCart,
  Loader2,
  X,
  Minus,
  Plus,
} from 'lucide-react';
import { Cormorant_Garamond, Playfair_Display } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
});

const playefairDisplayItalic = Playfair_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: 'italic',
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

export default function Home() {
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
  } = useCategories();
  const { items, loading: itemsLoading, fetchItems } = useMenuItems();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [quantityPopover, setQuantityPopover] = useState<{
    itemId: number;
    itemName: string;
    itemPrice: number;
    itemImage: string;
    x: number;
    y: number;
  } | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const quantityPopoverRef = useRef<HTMLDivElement | null>(null);
  const categoryIcons = [UtensilsCrossed, ChefHat, IceCreamCone];
  const featuredCategories = categories.slice(0, 3);
  const defaultCategoryId = featuredCategories[0]?.id ?? null;
  const activeCategoryId = selectedCategory ?? defaultCategoryId;
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  useEffect(() => {
    fetchItems({
      categoryId: activeCategoryId ?? undefined,
      isAvailable: true,
      limit: 4,
      offset: 0,
      sortBy: 'price',
      sortOrder: 'ASC',
    });
  }, [activeCategoryId, fetchItems]);

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
    event: ReactMouseEvent<HTMLButtonElement>,
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
        <div className="hidden md:block">
          <section className="relative h-[1554px]">
            <div className="absolute left-0 top-0 h-[552px] w-full bg-white" />
            <div className="absolute right-0 top-0 h-[552px] w-[608px] rounded-bl-[210px] bg-[#FEF7EA]" />

            <div className="absolute left-[103px] top-[58px] inline-flex h-[29px] items-center gap-1 rounded-[70px] bg-[#FEF7EA] px-[10px]">
              <UtensilsCrossed className="h-4 w-4 text-[#1A3C34]" />
              <span className="text-sm leading-[19px] font-semibold tracking-[-0.02em] text-[#2D2D2D]">
                Food Ordering Service
              </span>
            </div>

            <h1 className="absolute left-[103px] top-[113px] w-[652px] text-[74px] leading-[100%] font-semibold tracking-[-0.05em] text-[#1A3C34]">
              Where Great Food
              <br />
              Meets
              <span className={`${playefairDisplayItalic.className} ml-2`}>
                Great Taste.
              </span>
            </h1>

            <p className="absolute left-[103px] top-[259px] w-[604px] text-[20px] leading-[27px] font-medium tracking-[-0.02em] text-[#2D2D2D]">
              Experience a symphony of flavors crafted with passion. Premium
              ingredients, exquisite recipes, delivered to your door.
            </p>

            <Link
              href="/menu"
              className="absolute left-[103px] top-[352px] inline-flex h-[45px] w-[154px] items-center justify-center gap-2 rounded-bl-[20px] rounded-br-[20px] rounded-tl-[20px] bg-[#1A3C34] px-4 text-base leading-[22px] font-semibold text-white shadow-[0px_20px_25px_rgba(26,60,52,0.3)]"
            >
              View Menu
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="absolute left-[832px] top-0 h-[552px] w-[608px] rounded-bl-[210px] bg-[#FEF7EA]" />

            <div className="absolute left-[955px] top-[87px] h-[474px] w-[474px] overflow-hidden rounded-full">
              <Image
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=80"
                alt="Featured dish"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="absolute left-[732px] top-[351px] flex h-[68px] w-[190px] items-center rounded-xl border border-[#E6E2D8] bg-white px-3 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[#E6E2D8] bg-[#FDF6EA]">
                <Clock3 className="h-6 w-6 text-[#1A3C34]" />
              </div>
              <div className="ml-3">
                <p className="text-base leading-6 font-semibold tracking-[-0.150391px] text-[#1A1A1A]">
                  Avg. Delivery
                </p>
                <p className="text-sm leading-5 font-medium tracking-[-0.150391px] text-[#7A7A7A]">
                  22 Minutes
                </p>
              </div>
            </div>

            <div className="absolute left-[1153px] top-[31px] flex h-[68px] w-[190px] items-center rounded-xl border border-[#E6E2D8] bg-white px-3 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[#E6E2D8] bg-[#FDF6EA]">
                <Flame className="h-6 w-6 text-[#F97316]" />
              </div>
              <div className="ml-3">
                <p className="text-sm leading-5 font-medium tracking-[-0.150391px] text-[#7A7A7A]">
                  Today’s Offer
                </p>
                <p className="text-base leading-6 font-semibold tracking-[-0.150391px] text-[#1A1A1A]">
                  Free Delivery
                </p>
              </div>
            </div>

            <section className="absolute left-0 top-[552px] h-[921px] w-full bg-white">
              <h2
                className={`${cormorant.className} absolute left-1/2 top-[78px] -translate-x-1/2 text-[54px] leading-[100%] font-semibold tracking-[-0.05em] text-[#1A3C34]`}
              >
                Curated Categories
              </h2>
              <p className="absolute left-1/2 top-[136px] w-[365px] -translate-x-1/2 text-center text-[18px] leading-[25px] font-medium tracking-[-0.02em] text-[#2D2D2D]">
                Explore our diverse menu of culinary delights.
              </p>

              <div className="absolute left-1/2 top-[197px] flex h-[129px] w-[679px] -translate-x-1/2 items-center gap-[17px]">
                {featuredCategories.map((category, index) => {
                  const CategoryIcon =
                    categoryIcons[index % categoryIcons.length];
                  const isActive = activeCategoryId === category.id;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`h-[129px] w-[215px] rounded-tl-[20px] rounded-br-none rounded-tr-none rounded-bl-none bg-[#FBFAF8] transition-all duration-200 ${isActive ? 'bg-[#FEF7EA] shadow-[0px_21.7716px_54.4291px_rgba(26,60,52,0.1)]' : 'hover:bg-[#F7F5F0] hover:shadow-[0px_12px_30px_rgba(26,60,52,0.08)]'}`}
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-[18px]">
                        <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#1A3C34]">
                          <CategoryIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-[18px] leading-[100%] font-semibold text-[#1A3C34]">
                          {category.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                id="featured"
                className="absolute left-[100px] top-[476px] flex items-start gap-10"
              >
                {loading ? (
                  <div className="flex h-[336px] w-[1240px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1A3C34]" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex h-[336px] w-[1240px] items-center justify-center text-[#7A7A7A]">
                    No items available for this category.
                  </div>
                ) : (
                  items.map((item, index) => {
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
                  })
                )}
              </div>
            </section>
          </section>
        </div>

        <div className="space-y-12 px-6 pb-16 pt-6 md:hidden">
          <section className="space-y-6">
            <div className="inline-flex h-[29px] items-center gap-1 rounded-[70px] bg-[#FEF7EA] px-[10px]">
              <UtensilsCrossed className="h-4 w-4 text-[#1A3C34]" />
              <span className="text-sm leading-[19px] font-semibold tracking-[-0.02em] text-[#2D2D2D]">
                Food Ordering Service
              </span>
            </div>

            <h1 className="text-5xl leading-[100%] font-semibold tracking-[-0.05em] text-[#1A3C34]">
              Where Great Food Meets
              <span
                className={`${cormorant.className} ml-2 inline-block italic`}
              >
                Great Taste.
              </span>
            </h1>

            <p className="text-base leading-[27px] font-medium tracking-[-0.02em] text-[#2D2D2D]">
              Experience a symphony of flavors crafted with passion. Premium
              ingredients, exquisite recipes, delivered to your door.
            </p>

            <div className="relative h-[280px] overflow-hidden rounded-[36px] bg-[#FEF7EA]">
              <Image
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=80"
                alt="Featured dish"
                fill
                className="object-cover"
              />
            </div>

            <Link
              href="/menu"
              className="inline-flex h-[45px] w-[154px] items-center justify-center gap-2 rounded-bl-[20px] rounded-br-[20px] rounded-tl-[20px] bg-[#1A3C34] text-base leading-[22px] font-semibold text-white"
            >
              View Menu
              <ArrowRight className="h-5 w-5" />
            </Link>
          </section>

          <section>
            <h2
              className={`${cormorant.className} text-center text-[46px] leading-[100%] font-semibold tracking-[-0.05em] text-[#1A3C34]`}
            >
              Curated Categories
            </h2>
            <p className="mt-4 text-center text-base leading-[25px] font-medium tracking-[-0.02em] text-[#2D2D2D]">
              Explore our diverse menu of culinary delights.
            </p>

            <div className="mt-6 space-y-4">
              {featuredCategories.map((category, index) => {
                const CategoryIcon =
                  categoryIcons[index % categoryIcons.length];
                const isActive = activeCategoryId === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`h-[96px] w-full rounded-tl-[20px] rounded-tr-none rounded-br-none rounded-bl-none bg-[#FBFAF8] transition-all duration-200 ${isActive ? 'bg-[#FEF7EA] shadow-[0px_21.7716px_54.4291px_rgba(26,60,52,0.1)]' : 'hover:bg-[#F7F5F0] hover:shadow-[0px_12px_30px_rgba(26,60,52,0.08)]'}`}
                  >
                    <div className="flex h-full items-center justify-center gap-4">
                      <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#1A3C34]">
                        <CategoryIcon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-[18px] leading-[100%] font-semibold text-[#1A3C34]">
                        {category.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div id="featured" className="mt-8 space-y-6">
              {loading ? (
                <div className="flex h-[336px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1A3C34]" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-[336px] items-center justify-center text-[#7A7A7A]">
                  No items available for this category.
                </div>
              ) : (
                items.map((item, index) => {
                  const itemPrice = normalizePrice(item.price);

                  return (
                    <article key={item.id} className="relative h-[336px]">
                      <div className="absolute left-0 top-[56px] h-[280px] w-full rounded-tl-none rounded-tr-[34px] rounded-br-none rounded-bl-[34px] bg-[#FEF7EA] px-5 pt-[116px]">
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
                })
              )}
            </div>
          </section>
        </div>
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

      <div className="mt-0">
        <Footer />
      </div>
    </div>
  );
}
