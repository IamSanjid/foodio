'use client';

import Link from 'next/link';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['700'],
});

export default function Footer() {
  return (
    <footer className="border-t border-[#E6E2D8] bg-white px-6 py-8 md:h-[93px] md:px-[110px] md:py-0 md:pt-[33px]">
      <div className="mx-auto flex w-full max-w-[1220px] flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={`${cormorant.className} text-xl leading-7 font-bold text-[#1A3C34]`}
          >
            Foodio.
          </Link>
          <span className="text-sm leading-5 font-normal text-[#7A7A7A]">
            © 2026 Foodio Inc.
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm leading-5 font-normal tracking-[-0.150391px] text-[#7A7A7A]">
          <Link href="#">Privacy</Link>
          <Link href="#">Terms</Link>
          <Link href="#">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
