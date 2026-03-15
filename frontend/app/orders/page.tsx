'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cormorant_Garamond } from 'next/font/google';
import { AlertCircle, Loader2, Package } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus } from '@/types';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600'],
});

const ORDER_STAGES = [
  OrderStatus.PENDING,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.COMPLETED,
] as const;

const STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:
    'border border-[rgba(240,177,0,0.2)] bg-[rgba(240,177,0,0.1)] text-[#D08700]',
  [OrderStatus.PREPARING]:
    'border border-[rgba(42,101,230,0.16)] bg-[rgba(42,101,230,0.08)] text-[#2A65E6]',
  [OrderStatus.READY]:
    'border border-[rgba(26,122,94,0.14)] bg-[rgba(26,122,94,0.08)] text-[#1A7A5E]',
  [OrderStatus.COMPLETED]:
    'border border-[rgba(0,130,54,0.1)] bg-[rgba(0,130,54,0.1)] text-[#008236]',
};

function formatPlacedOn(date: string) {
  const createdAt = new Date(date);

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(createdAt);

  const timeLabel = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(createdAt);

  return `Placed on ${dateLabel} at ${timeLabel}`;
}

function getStageIndex(status: OrderStatus) {
  return ORDER_STAGES.indexOf(status);
}

function formatMoney(value: number | string) {
  return `$${Number(value).toFixed(2)}`;
}

function OrderProgress({ status }: { status: OrderStatus }) {
  const activeStageIndex = getStageIndex(status);
  const activeWidth = `${(activeStageIndex / (ORDER_STAGES.length - 1)) * 100}%`;

  return (
    <div className="mx-auto mt-3 w-full max-w-[448px] px-2 md:px-0">
      <div className="relative h-[35px]">
        <div className="absolute left-0 right-0 top-[5px] h-[2px] rounded-[40px] bg-[rgba(122,122,122,0.2)]" />
        <div
          className="absolute left-0 top-[5px] h-[2px] rounded-[40px] bg-[#1A3C34] transition-all duration-300"
          style={{ width: activeWidth }}
        />

        <div className="absolute inset-0 flex justify-between">
          {ORDER_STAGES.map((stage, index) => {
            const active = index <= activeStageIndex;

            return (
              <div
                key={stage}
                className="flex w-[72px] -translate-x-1/2 flex-col items-center gap-2 first:translate-x-0 last:translate-x-0"
              >
                <div
                  className={`h-3 w-3 rounded-full ${active ? 'bg-[#1A3C34]' : 'bg-[#E4E4E4]'}`}
                />
                <span
                  className={`text-center text-[10px] leading-[15px] font-bold uppercase tracking-[0.117188px] ${active ? 'text-[#1A3C34]' : 'text-[#7A7A7A]'}`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <article className="rounded-[12px] border border-[#E6E2D8] bg-[#FBFAF8] px-4 py-5 md:px-6 md:py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-[18px] leading-7 font-bold text-[#1A3C34]">
            Order #{order.id}
          </h2>
          <p className="text-sm leading-6 font-medium tracking-[-0.15px] text-[#7A7A7A] md:text-base md:tracking-[-0.3125px]">
            {formatPlacedOn(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:gap-4">
          <p className="text-[18px] leading-7 font-bold tracking-[-0.439453px] text-[#1A1A1A]">
            {formatMoney(order.totalAmount)}
          </p>
          <span
            className={`inline-flex h-7 items-center justify-center rounded-[6px] px-2 text-[13px] leading-4 font-semibold ${STATUS_STYLES[order.status]}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div>
          <p className="text-[14px] leading-5 font-medium uppercase tracking-[0.35px] text-[#7A7A7A]">
            Items
          </p>
          <div className="mt-2 flex flex-col gap-1">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-6 text-[14px] leading-5 font-medium tracking-[-0.150391px]"
              >
                <p className="text-[#1A1A1A]">
                  {item.quantity}x {item.menuItem.name}
                </p>
                <p className="shrink-0 text-[#7A7A7A]">
                  {formatMoney(item.priceAtTime * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#E6E2D8] pt-[9px]">
          <p className="text-right text-[16px] leading-5 font-bold tracking-[-0.150391px] text-[#1A1A1A]">
            Total Amount : {formatMoney(order.totalAmount)}
          </p>
        </div>

        <div className="border-t border-[#E6E2D8] pt-[9px]">
          <p className="text-[14px] leading-5 font-medium tracking-[-0.150391px] text-[#7A7A7A]">
            <span className="text-[#1A1A1A]">Delivering to:</span>{' '}
            {order.user.address ?? 'Address unavailable'}
          </p>
        </div>

        <OrderProgress status={order.status} />
      </div>
    </article>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { orders, error, loading: ordersLoading, fetchMyOrders } = useOrders();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    fetchMyOrders();
  }, [authLoading, fetchMyOrders, router, user]);

  const loading = authLoading || ordersLoading || !user;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <Header />

      <main className="mx-auto flex w-full max-w-[1440px] min-h-0 flex-1 flex-col overflow-hidden px-6 pt-8 md:px-[72px] md:pt-[38px] xl:px-[104px]">
        <h1
          className={`${cormorant.className} shrink-0 text-[32px] leading-[100%] font-semibold tracking-[-0.05em] text-[#1A3C34]`}
        >
          My Orders
        </h1>

        <div className="mt-8 min-h-0 flex-1 mb-1 md:mb-4">
          {loading ? (
            <div className="flex h-full items-center justify-center rounded-[12px] border border-[#E6E2D8] bg-[#FBFAF8]">
              <Loader2 className="h-10 w-10 animate-spin text-[#1A3C34]" />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center rounded-[12px] border border-[#E6E2D8] bg-[#FBFAF8] px-6 py-10 text-center">
              <div>
                <AlertCircle className="mx-auto h-12 w-12 text-[#D64045]" />
                <h2 className="mt-4 text-[24px] leading-8 font-bold text-[#1A1A1A]">
                  Unable to load your orders
                </h2>
                <p className="mt-2 text-[16px] leading-6 font-medium text-[#7A7A7A]">
                  {error}
                </p>
                <button
                  onClick={() => fetchMyOrders()}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-[56px] bg-[#1A3C34] px-5 text-sm font-medium text-white"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-[12px] border border-[#E6E2D8] bg-[#FBFAF8] px-6 py-14 text-center">
              <div>
                <Package className="mx-auto h-14 w-14 text-[#7A7A7A]" />
                <h2 className="mt-4 text-[24px] leading-8 font-bold text-[#1A1A1A]">
                  No orders yet
                </h2>
                <p className="mt-2 text-[16px] leading-6 font-medium text-[#7A7A7A]">
                  Your placed orders will appear here once you check out.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto pb-6 md:pb-8">
              <div className="space-y-4 md:space-y-[20px] pr-1">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}
