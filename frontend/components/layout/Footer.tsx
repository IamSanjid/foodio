'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="text-3xl font-bold text-[#FF5C00]">
            Foodio<span className="text-[#FFB800]">.</span>
          </Link>
          <p className="mt-4 text-gray-600 max-w-sm">
            The quickest way to get your favorite meals delivered straight to
            your door. Fresh ingredients, professional chefs, and fast delivery.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-[#FF5C00]">
                Home
              </Link>
            </li>
            <li>
              <Link href="/menu" className="hover:text-[#FF5C00]">
                Menu
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-[#FF5C00]">
                Track Order
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-4">Support</h4>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link href="/help" className="hover:text-[#FF5C00]">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#FF5C00]">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-[#FF5C00]">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Foodio. All rights reserved.
      </div>
    </footer>
  );
}
