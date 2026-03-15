'use client';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { ToastItem } from '@/context/ToastContext';

interface ToastStackProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

const iconByVariant = {
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
} as const;

const iconClassByVariant = {
  success: 'text-[#008236]',
  info: 'text-[#1A3C34]',
  warning: 'text-[#D08700]',
} as const;

export default function ToastStack({ toasts, onClose }: ToastStackProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[1200] flex max-w-[calc(100vw-32px)] items-end flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = iconByVariant[toast.variant];

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex h-[52px] w-fit min-w-[264px] max-w-[min(560px,calc(100vw-32px))] items-center rounded-[8px] border border-[#EAEAEA] bg-white pl-[14px] pr-3 shadow-[0px_21.7716px_54.4291px_rgba(26,60,52,0.1)]"
          >
            <Icon
              className={`h-6 w-6 shrink-0 ${iconClassByVariant[toast.variant]}`}
            />
            <p className="ml-[7px] flex-1 truncate whitespace-nowrap text-[14px] leading-5 font-medium tracking-[-0.150391px] text-[#1A3C34]">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => onClose(toast.id)}
              aria-label="Close notification"
              className="ml-2 h-6 w-6 shrink-0 text-[#7A7A7A]"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
