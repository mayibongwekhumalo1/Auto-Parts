"use client"

import React from "react";
import Link from "next/link";
import { FileText, Users, Truck, Settings, HelpCircle, Phone, Mail, MapPin } from "lucide-react";

export default function PagesPage() {
  const pageLinks = [
    {
      title: "About Us",
      description: "Learn about our company history and mission",
      href: "/about",
      icon: Users,
      available: false
    },
    {
      title: "Services",
      description: "Explore our automotive services and expertise",
      href: "/services",
      icon: Settings,
      available: false
    },
    {
      title: "Contact",
      description: "Get in touch with our team",
      href: "/contact",
      icon: Phone,
      available: false
    },
    {
      title: "FAQ",
      description: "Find answers to common questions",
      href: "/faq",
      icon: HelpCircle,
      available: false
    },
    {
      title: "Shipping & Returns",
      description: "Learn about our shipping and return policies",
      href: "/shipping-returns",
      icon: Truck,
      available: false
    },
    {
      title: "Privacy Policy",
      description: "Read our privacy policy and terms of service",
      href: "/privacy",
      icon: FileText,
      available: false
    }
  ];

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white antialiased">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pages</h1>
          <p className="text-zinc-400">Explore all available pages and sections of our website</p>
        </div>

        {/* Available Pages Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Available Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Existing Pages */}
            <Link href="/" className="bg-zinc-900 border border-zinc-800 rounded-md p-6 hover:border-red-600 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-600 rounded-md">
                  <FileText size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold group-hover:text-red-500">Home</h3>
              </div>
              <p className="text-zinc-400 text-sm">Main landing page with featured products and deals</p>
            </Link>

            <Link href="/products" className="bg-zinc-900 border border-zinc-800 rounded-md p-6 hover:border-red-600 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-600 rounded-md">
                  <Settings size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold group-hover:text-red-500">Shop</h3>
              </div>
              <p className="text-zinc-400 text-sm">Browse and purchase auto parts</p>
            </Link>

            <Link href="/gallery" className="bg-zinc-900 border border-zinc-800 rounded-md p-6 hover:border-red-600 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-600 rounded-md">
                  <FileText size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold group-hover:text-red-500">Gallery</h3>
              </div>
              <p className="text-zinc-400 text-sm">Product gallery and showcase</p>
            </Link>

            <Link href="/shortcode" className="bg-zinc-900 border border-zinc-800 rounded-md p-6 hover:border-red-600 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-600 rounded-md">
                  <FileText size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold group-hover:text-red-500">Shortcode</h3>
              </div>
              <p className="text-zinc-400 text-sm">Reusable components and elements</p>
            </Link>

            <Link href="/news" className="bg-zinc-900 border border-zinc-800 rounded-md p-6 hover:border-red-600 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-600 rounded-md">
                  <FileText size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold group-hover:text-red-500">News</h3>
              </div>
              <p className="text-zinc-400 text-sm">Latest automotive news and updates</p>
            </Link>

            <Link href="/cart" className="bg-zinc-900 border border-zinc-800 rounded-md p-6 hover:border-red-600 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-600 rounded-md">
                  <Truck size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold group-hover:text-red-500">Cart</h3>
              </div>
              <p className="text-zinc-400 text-sm">Shopping cart and checkout</p>
            </Link>

            <Link href="/login" className="bg-zinc-900 border border-zinc-800 rounded-md p-6 hover:border-red-600 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-600 rounded-md">
                  <Users size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold group-hover:text-red-500">Login</h3>
              </div>
              <p className="text-zinc-400 text-sm">User authentication</p>
            </Link>
          </div>
        </section>

        {/* Coming Soon Pages */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageLinks.map((page, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-700 rounded-md p-6 opacity-75">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-zinc-700 rounded-md">
                    <page.icon size={20} className="text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-400">{page.title}</h3>
                </div>
                <p className="text-zinc-500 text-sm">{page.description}</p>
                <div className="mt-3">
                  <span className="bg-zinc-700 text-zinc-400 px-2 py-1 rounded text-xs">Coming Soon</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={20} className="text-white" />
              </div>
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-zinc-400 text-sm">(555) 123-4567</p>
            </div>

            <div className="text-center">
              <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={20} className="text-white" />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-zinc-400 text-sm">info@euromechanic.com</p>
            </div>

            <div className="text-center">
              <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={20} className="text-white" />
              </div>
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-zinc-400 text-sm">123 Auto Parts Street<br />Mechanic City, MC 12345</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}