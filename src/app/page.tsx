"use client"

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Menu, ShoppingCart, Star, ChevronRight, Clock, ChevronLeft, ChevronsLeft, Truck, Wrench, Shield, Phone } from "lucide-react";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, targetDate.getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { diff, days, hours, minutes, seconds };
}

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [gridProducts, setGridProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=4&featured=true');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products?distinct=categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchGridProducts = async () => {
      try {
        const url = selectedCategory
          ? `/api/products?category=${encodeURIComponent(selectedCategory)}&limit=12`
          : '/api/products?limit=12';
        const response = await fetch(url);
        const data = await response.json();
        setGridProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching grid products:', error);
      }
    };

    fetchGridProducts();
  }, [selectedCategory]);

  // countdown to 5 days from now
  const target = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);
  const { days, hours, minutes, seconds } = useCountdown(target);

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white antialiased">
      {/* HERO */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 rounded-lg p-8 relative overflow-hidden">
          <div className="inline-flex items-center gap-3 text-sm bg-red-700 px-3 py-1 rounded-full w-max mb-6">15% OFF</div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Oil Change <span className="block">Packages</span>
          </h1>
          <p className="mt-4 text-zinc-300">See in shop for details.</p>

          <div className="mt-8 flex items-center gap-4">
            <button className="bg-red-700 px-5 py-3 rounded-md font-semibold">Shop Now</button>
            <button className="px-4 py-3 border border-zinc-700 rounded-md">Details</button>
          </div>

          {/* decorative chevrons */}
          <div className="absolute right-6 top-12 w-40 h-40 transform rotate-12 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M10 10 L60 50 L10 90" stroke="#ff2121" strokeWidth="10" fill="none" strokeLinecap="square" />
            </svg>
          </div>
        </div>

        <div className="md:col-span-5 relative h-64 md:h-72 rounded-lg overflow-hidden">
          {/* hero image — replace src with your asset */}
          <Image
            src="/images/hero-oil.jpg"
            alt="oil"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>
      {/* ABOUT US */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">About Auto Parts</h2>
          <p className="text-zinc-300 mb-8 text-lg">Trusted auto parts since 2000. We provide high-quality parts with expert advice and fast shipping.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 p-8 rounded-md">
              <div className="text-4xl font-bold text-red-600 mb-2">10,000+</div>
              <div className="text-lg text-zinc-400">Products</div>
            </div>
            <div className="bg-zinc-900 p-8 rounded-md">
              <div className="text-4xl font-bold text-red-600 mb-2">50,000+</div>
              <div className="text-lg text-zinc-400">Happy Customers</div>
            </div>
            <div className="bg-zinc-900 p-8 rounded-md">
              <div className="text-4xl font-bold text-red-600 mb-2">Fast Shipping</div>
              <div className="text-lg text-zinc-400">Nationwide</div>
            </div>
          </div>
        </div>
      </section>

      {/* DEAL OF THE DAY */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Deal Of The Day</h2>

          <div className="flex items-center gap-4">
            <div className="bg-red-700 px-4 py-2 rounded-md inline-flex items-center gap-2">
              <Clock size={16} />
              <span className="text-sm">
                END IN: {days}d:{hours}h:{minutes}m:{seconds}s
              </span>
            </div>
            <button className="px-4 py-2 border border-zinc-700 rounded-md">Show All</button>
          </div>
        </div>

        {/* carousel container */}
        <div className="relative">
          {/* scroll area */}
          <div
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ scrollBehavior: "smooth" }}
          >
            {products.map((p) => (
              <article
                key={p._id}
                className="snap-start shrink-0 w-[260px] bg-zinc-900 border border-zinc-800 rounded-md p-4"
              >
                <div className="relative h-36 rounded-md overflow-hidden border border-zinc-700">
                  <Image src={p.images[0] || "/images/placeholder.jpg"} alt={p.name} fill className="object-cover" />
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{p.name}</h3>
                    <div className="text-sm text-zinc-400">${p.price}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className="text-zinc-700" />
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-lg font-bold text-red-600">${p.price}</div>
                    <button className="mt-3 w-full bg-red-700 py-2 rounded-md text-sm font-medium">Add To Cart</button>
                  </div>

                  <div className="mt-3 text-xs text-zinc-400 flex justify-between">
                    <span>Available:{p.stock}</span>
                    <span>{p.category}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* optional left/right chevrons (visual) */}
          <div className="hidden md:flex absolute top-1/2 transform -translate-y-1/2 left-0 -translate-x-2">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-full">
              <ChevronLeft size={18} />
            </div>
          </div>
          <div className="hidden md:flex absolute top-1/2 transform -translate-y-1/2 right-0 translate-x-2">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-full">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* PROMO BANNERS */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative h-36 rounded-md overflow-hidden border border-zinc-800">
          <Image src="/images/promo1.jpg" alt="promo1" fill className="object-cover" />
          <div className="absolute left-4 bottom-4">
            <div className="bg-zinc-900/70 px-3 py-1 rounded-md text-xs">NEW ARRIVALS</div>
            <div className="text-white font-semibold mt-2">Wheels & Tires</div>
          </div>
        </div>

        <div className="relative h-36 rounded-md overflow-hidden border border-zinc-800">
          <Image src="/images/promo2.jpg" alt="promo2" fill className="object-cover" />
          <div className="absolute left-4 bottom-4">
            <div className="bg-zinc-900/70 px-3 py-1 rounded-md text-xs">WINTER SALE</div>
            <div className="text-white font-semibold mt-2">Interior 3-Silicon Touch</div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Why Choose Us?</h2>
          <p className="text-zinc-300 mt-2">Quality service and support you can trust</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-zinc-900 p-8 rounded-md text-center border border-zinc-800">
            <Truck size={48} className="text-red-600 mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-lg">Free Shipping</h3>
            <p className="text-sm text-zinc-400">On orders over $50</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-md text-center border border-zinc-800">
            <Wrench size={48} className="text-red-600 mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-lg">Expert Guides</h3>
            <p className="text-sm text-zinc-400">Installation tutorials</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-md text-center border border-zinc-800">
            <Shield size={48} className="text-red-600 mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-lg">Warranty</h3>
            <p className="text-sm text-zinc-400">On all parts</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-md text-center border border-zinc-800">
            <Phone size={48} className="text-red-600 mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-lg">24/7 Support</h3>
            <p className="text-sm text-zinc-400">Customer service</p>
          </div>
        </div>
      </section>

      {/* CATEGORIES + GRID */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12 grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-3 bg-zinc-900 border border-zinc-800 rounded-md p-4">
          <h4 className="font-semibold">Categories</h4>
          <ul className="mt-4 text-zinc-300 text-sm space-y-2">
            {categories.map((category) => (
              <li
                key={category}
                className={`flex justify-between items-center cursor-pointer hover:text-white transition-colors ${
                  selectedCategory === category ? 'text-red-600' : ''
                }`}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                <span>{category}</span>
                <span className="text-xs text-zinc-400">›</span>
              </li>
            ))}
          </ul>

          <button
            className="mt-6 w-full border border-zinc-700 py-2 rounded-md hover:bg-zinc-800 transition-colors"
            onClick={() => setSelectedCategory(null)}
          >
            Show All
          </button>
        </aside>

        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridProducts.length > 0 ? gridProducts.map((p) => (
            <div key={p._id} className="bg-zinc-900 border border-zinc-800 rounded-md p-4">
              <div className="relative h-44 rounded-md overflow-hidden border border-zinc-700">
                <Image src={(p.images && p.images.length > 0) ? p.images[0] : "/images/placeholder.jpg"} alt={p.name} fill className="object-cover" />
              </div>
              <div className="mt-3">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="mt-1 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-zinc-700" />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-red-600 font-bold">${p.price}</div>
                    <div className="text-xs text-zinc-500">{p.brand}</div>
                  </div>
                  <button className="bg-red-700 px-3 py-2 rounded-md text-sm">Add To Cart</button>

                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12 text-zinc-400">
              No products found in this category.
            </div>
          )}
        </div>
      </section>


        {/* TESTIMONIALS */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">What Our Customers Say</h2>
          <p className="text-zinc-300 mt-2">Real reviews from satisfied customers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900 p-8 rounded-md border border-zinc-800">
            <div className="flex items-center justify-center mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className="text-yellow-500" />
              ))}
            </div>
            <p className="text-zinc-300 mb-6 text-center">&ldquo;Great quality parts, arrived fast! Highly recommend.&rdquo;</p>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-700 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">JD</div>
              <div className="text-sm text-zinc-400 font-semibold">- John D.</div>
            </div>
          </div>
          <div className="bg-zinc-900 p-8 rounded-md border border-zinc-800">
            <div className="flex items-center justify-center mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className="text-yellow-500" />
              ))}
            </div>
            <p className="text-zinc-300 mb-6 text-center">&ldquo;Excellent customer service and warranty support.&rdquo;</p>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-700 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">SM</div>
              <div className="text-sm text-zinc-400 font-semibold">- Sarah M.</div>
            </div>
          </div>
          <div className="bg-zinc-900 p-8 rounded-md border border-zinc-800">
            <div className="flex items-center justify-center mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className="text-yellow-500" />
              ))}
            </div>
            <p className="text-zinc-300 mb-6 text-center">&ldquo;Best prices and fast shipping nationwide.&rdquo;</p>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-700 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">MR</div>
              <div className="text-sm text-zinc-400 font-semibold">- Mike R.</div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-12 rounded-md text-center border border-zinc-700">
          <h2 className="text-3xl font-bold mb-4">Subscribe for Exclusive Deals</h2>
          <p className="text-zinc-300 mb-8 text-lg">Get 10% off your first order and stay updated with the latest parts.</p>
          <div className="flex flex-col md:flex-row gap-6 justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-6 py-3 bg-zinc-800 border border-zinc-600 rounded-md text-white placeholder-zinc-400 flex-1 text-lg"
            />
            <button className="bg-red-700 hover:bg-red-600 px-8 py-3 rounded-md font-semibold text-lg transition-colors">Subscribe Now</button>
          </div>
          <p className="text-zinc-400 text-sm mt-4">No spam, unsubscribe anytime.</p>
        </div>
      </section>

      {/* FOOTER TABS */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-12 mb-20">
        <div className="border border-zinc-800 rounded-md overflow-hidden grid grid-cols-3 text-center">
          <div className="py-4">New Arrival</div>
          <div className="py-4">Featured Item</div>
          <div className="py-4">Sale Off</div>
        </div>
      </section>
    </main>
  );
}
