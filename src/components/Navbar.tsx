
"use client";

import React from "react";
import Link from "next/link";
import { Menu, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "./hooks";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const user = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('authChange'));
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback to client-side logout
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('authChange'));
      router.push('/');
    }
  };
  return (
    <header className="border-b border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-zinc-900 rounded-md">
            <Menu size={20} />
          </div>
          <div className="text-2xl font-extrabold text-red-600 tracking-tight">EUROMECHANIC</div>
        </div>

        <nav className="hidden md:flex gap-8 items-center text-sm">
          <Link href="/" className="hover:text-red-500">Home</Link>
          <Link href="/products" className="hover:text-red-500">Shop</Link>
          <Link href="/gallery" className="hover:text-red-500">Gallery</Link>
          <Link href="/shortcode" className="hover:text-red-500">Shortcode</Link>
          <Link href="/news" className="hover:text-red-500">News</Link>
          {user && user.role === 'admin' ? (
            <Link href="/admin" className="hover:text-red-500">Dashboard</Link>
          ) : (
            <Link href="/pages" className="hover:text-red-500">Pages</Link>
          )}
          <Link href="/buy-car" className="hover:text-red-500">Buy Car</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="hidden md:flex items-center gap-2 bg-red-600 px-3 py-2 rounded-md text-sm font-medium">
            <ShoppingCart size={16} />
            Cart
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-sm px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-white">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-2 border border-zinc-700 rounded-md hover:bg-zinc-700 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm px-3 py-2 border border-zinc-700 rounded-md">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}