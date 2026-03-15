'use client';

import type { ReactNode } from 'react';
import { useToastContext } from '@/context/ToastContext';

export function useToast() {
  const { addToast } = useToastContext();

  return {
    showToast: (message: ReactNode, variant?: 'success' | 'info' | 'warning') =>
      addToast(message, variant),
  };
}
