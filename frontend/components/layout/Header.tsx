'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Cormorant_Garamond } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/useToast';
import { useOrders } from '@/hooks/useOrders';
import {
  ArrowRight,
  Check,
  Loader2,
  LogOut,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600'],
});

export default function Header() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const { placeOrder, loading: orderLoading } = useOrders();
  const pathname = usePathname();
  const router = useRouter();

  const [cartOpenPath, setCartOpenPath] = useState<string | null>(null);
  const [profileOpenPath, setProfileOpenPath] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [ordersToggleEnabled, setOrdersToggleEnabled] = useState<boolean>(
    () => {
      if (typeof window === 'undefined') {
        return true;
      }

      const persistedValue = localStorage.getItem('ordersConfirmToggle');
      if (persistedValue === null) {
        return true;
      }

      return persistedValue === 'true';
    }
  );

  const desktopCartPopoverRef = useRef<HTMLDivElement | null>(null);
  const mobileCartPopoverRef = useRef<HTMLDivElement | null>(null);
  const desktopProfilePopoverRef = useRef<HTMLDivElement | null>(null);
  const mobileProfilePopoverRef = useRef<HTMLDivElement | null>(null);

  const cartOpen = cartOpenPath === pathname;
  const profileOpen = profileOpenPath === pathname;

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartItemsCount = items.length;

  const isHome = pathname === '/';
  const isMenu = pathname === '/menu';
  const isOrders = pathname === '/orders';

  useEffect(() => {
    localStorage.setItem(
      'ordersConfirmToggle',
      ordersToggleEnabled ? 'true' : 'false'
    );
  }, [ordersToggleEnabled]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsideCartDesktop =
        desktopCartPopoverRef.current?.contains(target) ?? false;
      const clickedInsideCartMobile =
        mobileCartPopoverRef.current?.contains(target) ?? false;
      const clickedInsideProfileDesktop =
        desktopProfilePopoverRef.current?.contains(target) ?? false;
      const clickedInsideProfileMobile =
        mobileProfilePopoverRef.current?.contains(target) ?? false;

      if (
        !clickedInsideCartDesktop &&
        !clickedInsideCartMobile &&
        !clickedInsideProfileDesktop &&
        !clickedInsideProfileMobile
      ) {
        setCartOpenPath(null);
        setProfileOpenPath(null);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCartOpenPath(null);
        setProfileOpenPath(null);
      }
    };

    if (cartOpen || profileOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [cartOpen, profileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setCartOpenPath(null);
      setProfileOpenPath(null);
    };

    if (cartOpen || profileOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [cartOpen, profileOpen]);

  const toggleCartPopover = () => {
    setProfileOpenPath(null);
    setCartOpenPath((prev) => (prev === pathname ? null : pathname));
  };

  const toggleProfilePopover = () => {
    setCartOpenPath(null);
    setProfileOpenPath((prev) => (prev === pathname ? null : pathname));
  };

  const handleRemoveItem = (id: number, itemName: string) => {
    removeItem(id);
    showToast(
      <>
        <strong>{itemName}</strong> removed from cart
      </>,
      'info'
    );
  };

  const confirmOrder = async () => {
    if (items.length === 0) {
      return;
    }

    if (!user) {
      setCartOpenPath(null);
      router.push('/login');
      return;
    }

    if (!ordersToggleEnabled) {
      showToast(
        'Order failed with reason: Orders toggle is off in profile menu.',
        'warning'
      );
      return;
    }

    setOrderError(null);

    try {
      await placeOrder(
        items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        }))
      );

      clearCart();
      setCartOpenPath(null);
      showToast('Your Order has been confirmed!', 'success');
      router.push('/orders');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to place order';
      setOrderError(message);
      showToast(message, 'warning');
    }
  };

  const handleLogout = () => {
    setProfileOpenPath(null);
    logout();
  };

  const renderCartPopover = (popoverClassName: string) => (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
      className={popoverClassName}
    >
      <div className="flex items-center justify-between px-5 pt-5">
        <h3 className="text-[36px] leading-[25px] font-bold text-[#1A3C34]">
          Cart
        </h3>
        <p className="text-base leading-[25px] font-medium text-[#7A7A7A]">
          {cartItemsCount} Items
        </p>
      </div>

      <div className="mt-4 h-[220px] overflow-y-auto px-5">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[#7A7A7A]">
            Cart is empty
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="relative h-[102px]">
              <div className="absolute left-0 top-0 h-11 w-[44.67px] overflow-hidden rounded-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <p className="absolute left-[54px] top-0 w-[185px] text-sm leading-6 font-semibold text-[#1A1A1A]">
                {item.name}
              </p>
              <p className="absolute left-[54px] top-6 text-sm leading-5 font-medium text-[#7A7A7A]">
                Quantity : {item.quantity}
              </p>

              <div className="absolute left-[54px] top-[54px] flex h-8 items-center gap-[7px]">
                <button
                  disabled={item.quantity === 1}
                  onClick={() => updateQuantity(item.id, -1)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#1A3C34] text-[#1A3C34] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="flex h-7 w-[45px] items-center justify-center rounded-md border-[1.5px] border-[#E6E2D8] bg-[#FBFAF8]">
                  <span className="text-sm leading-5 font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                    {item.quantity}
                  </span>
                </div>

                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#1A3C34] text-[#1A3C34]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => handleRemoveItem(item.id, item.name)}
                className="absolute right-0 top-[2px] text-[#D64045]"
              >
                <Trash2 className="h-5 w-5" />
              </button>

              <p className="absolute right-0 top-[61px] text-4 leading-5 font-bold text-[#1A1A1A]">
                ${item.price.toFixed(2)}
              </p>

              {index < items.length - 1 && (
                <div className="absolute bottom-0 left-0 h-px w-full bg-[#E6E2D8]" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="mx-5 mt-0 h-px bg-[#E6E2D8]" />

      <div className="mt-0.5 flex items-center justify-between px-5">
        <p className="text-[18px] leading-5 font-bold text-[#1A1A1A]">
          Total Amount :
        </p>
        <p className="text-[18px] leading-5 font-bold text-[#1A1A1A]">
          ${total.toFixed(2)}
        </p>
      </div>

      {orderError && (
        <p className="mt-2 px-5 text-sm leading-5 font-medium text-[#D64045]">
          {orderError}
        </p>
      )}

      <button
        onClick={() => {
          setOrderError(null);
          setCartOpenPath(null);
        }}
        className="absolute bottom-10 right-[167px] h-9 w-[92px] rounded-[56px] border border-[#1A3C34] text-sm leading-5 font-medium tracking-[-0.150391px] text-[#1A3C34]"
      >
        Cancel
      </button>

      <button
        disabled={items.length === 0 || orderLoading}
        onClick={confirmOrder}
        className="absolute bottom-10 right-5 h-9 w-[139px] rounded-[56px] bg-[#1A3C34] text-sm leading-5 font-medium tracking-[-0.150391px] text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {orderLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirming...
          </span>
        ) : (
          'Confirm Order'
        )}
      </button>
    </div>
  );

  const renderProfilePopover = (popoverClassName: string) => (
    <div className={popoverClassName} role="menu" aria-label="Account Menu">
      <div className="px-2 py-[5px]">
        <p className="pl-2 pt-[6px] text-sm leading-5 font-medium tracking-[-0.150391px] text-[#7A7A7A]">
          My Account
        </p>
      </div>

      <div className="mx-[1px] h-px bg-[#E6E2D8]" />

      <button
        type="button"
        onClick={() => setOrdersToggleEnabled((prev) => !prev)}
        className={`mx-[5px] mt-[4px] flex h-8 w-[calc(100%-10px)] items-center rounded-[4px] px-2 ${ordersToggleEnabled ? 'bg-[#F7F7F7]' : 'bg-transparent hover:bg-[#F7F7F7]'}`}
      >
        <span className="text-sm leading-5 font-medium tracking-[-0.150391px] text-[#1A1A1A]">
          Orders
        </span>
        <span className="ml-auto inline-flex h-4 w-4 items-center justify-center text-[#1A1A1A]">
          {ordersToggleEnabled ? <Check className="h-4 w-4" /> : null}
        </span>
      </button>

      <div className="mx-[1px] mt-[5px] h-px bg-[#E6E2D8]" />

      <button
        type="button"
        onClick={handleLogout}
        className="mx-[5px] mt-[4px] flex h-8 w-[calc(100%-10px)] items-center rounded-[4px] px-2 hover:bg-[#F7F7F7]"
      >
        <LogOut className="h-4 w-4 text-[#D64045]" />
        <span className="ml-2 text-sm leading-5 font-medium tracking-[-0.150391px] text-[#D64045]">
          Sign out
        </span>
      </button>
    </div>
  );

  return (
    <header className="relative z-[300] h-16">
      <div className="mx-auto hidden h-full w-full max-w-[1440px] items-center px-[52px] md:relative md:flex">
        <Link
          href="/"
          className="absolute left-[52px] top-1/2 flex -translate-y-1/2 items-center gap-[8.09px]"
        >
          <UtensilsCrossed className="h-[26px] w-[26px] text-[#1A3C34]" />
          <span
            className={`${cormorant.className} text-[26px] leading-[26px] font-semibold tracking-[-0.05em] text-[#1A3C34]`}
          >
            Foodio.
          </span>
        </Link>

        <nav className="absolute left-1/2 top-1/2 flex h-8 w-[276px] -translate-x-1/2 -translate-y-1/2 items-center gap-2">
          <Link
            href="/"
            className={`flex h-8 w-16 items-center justify-center rounded-[30px] text-sm leading-5 font-medium tracking-[-0.150391px] ${isHome ? 'border border-[#1A3C34] bg-[#FEF7EA] text-[#1A3C34]' : 'text-[#7A7A7A]'}`}
          >
            Home
          </Link>
          <Link
            href="/menu"
            className={`flex h-8 w-[97px] items-center justify-center rounded-[30px] text-sm leading-5 font-medium tracking-[-0.150391px] ${isMenu ? 'border border-[#1A3C34] bg-[#FEF7EA] text-[#1A3C34]' : 'text-[#7A7A7A]'}`}
          >
            Food Menu
          </Link>
          <Link
            href="/orders"
            className={`flex h-8 w-[99px] items-center justify-center rounded-[30px] text-sm leading-5 font-medium tracking-[-0.150391px] ${isOrders ? 'border border-[#1A3C34] bg-[#FEF7EA] text-[#1A3C34]' : 'text-[#7A7A7A]'}`}
          >
            My Orders
          </Link>
        </nav>

        <div className="absolute right-[52px] top-1/2 flex -translate-y-1/2 items-center gap-3">
          <div className="relative" ref={desktopCartPopoverRef}>
            <button
              onClick={toggleCartPopover}
              className="flex h-8 items-center gap-2 rounded-[230px] border border-[#1A3C34] px-3 text-sm leading-[19px] font-semibold text-[#1A3C34]"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{cartCount}</span>
            </button>

            {cartOpen &&
              renderCartPopover(
                'absolute right-0 top-11 z-[9999] h-[426px] w-[min(420px,calc(100vw-48px))] rounded-xl border border-[#E6E2D8] bg-[#FBFAF8] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]'
              )}
          </div>

          {user ? (
            <div className="relative" ref={desktopProfilePopoverRef}>
              <button
                type="button"
                onClick={toggleProfilePopover}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1A3C34] text-white"
                aria-label="Open profile menu"
              >
                <UserRound className="h-5 w-5" />
              </button>

              {profileOpen &&
                renderProfilePopover(
                  'absolute right-0 top-14 z-[9998] h-[126px] w-[141px] rounded-[6px] border border-[#E6E2D8] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]'
                )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-8 items-center gap-2 rounded-[230px] bg-[#1A3C34] px-3 text-sm leading-[19px] font-semibold text-white"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="flex h-full items-center justify-between px-6 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-[#1A3C34]" />
          <span
            className={`${cormorant.className} text-[26px] leading-[26px] font-semibold tracking-[-0.05em] text-[#1A3C34]`}
          >
            Foodio.
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative" ref={mobileCartPopoverRef}>
            <button
              onClick={toggleCartPopover}
              className="flex h-8 items-center gap-2 rounded-[230px] border border-[#1A3C34] px-3 text-sm leading-[19px] font-semibold text-[#1A3C34]"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{cartCount}</span>
            </button>

            {cartOpen &&
              renderCartPopover(
                'fixed right-3 top-20 z-[9999] h-[426px] w-[min(420px,calc(100vw-24px))] rounded-xl border border-[#E6E2D8] bg-[#FBFAF8] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]'
              )}
          </div>

          {user ? (
            <div className="relative" ref={mobileProfilePopoverRef}>
              <button
                type="button"
                onClick={toggleProfilePopover}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1A3C34] text-white"
                aria-label="Open profile menu"
              >
                <UserRound className="h-5 w-5" />
              </button>

              {profileOpen &&
                renderProfilePopover(
                  'fixed right-4 top-20 z-[9998] h-[126px] w-[141px] rounded-[6px] border border-[#E6E2D8] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]'
                )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-8 items-center gap-2 rounded-[230px] bg-[#1A3C34] px-3 text-sm leading-[19px] font-semibold text-white"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
