"use client";

import Image from "next/image";
import { Star, ChevronRight } from "lucide-react";
import React from "react";

type Product = {
  id: number;
  title: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  img: string;
};

const products: Product[] = [
  { id: 1, title: "Wheel Hub Bearing", price: 450, oldPrice: 650, rating: 5, img: "/images/wheel1.jpg" },
  { id: 2, title: "Car Wheel", price: 450, oldPrice: 650, rating: 4, img: "/images/wheel2.jpg" },
  { id: 3, title: "Car Air Filter", price: 450, oldPrice: 650, rating: 4, img: "/images/airfilter.jpg" },
  { id: 4, title: "Car Disk Brake", price: 450, oldPrice: 650, rating: 5, img: "/images/brake.jpg" },
  { id: 5, title: "Brake Caliper", price: 450, oldPrice: 650, rating: 4, img: "/images/caliper.jpg" },
];

export default function AutoPartsSection() {
  return (
    <section className="bg-black text-white py-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 space-y-12">

        {/* PROMO BANNERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative h-44 rounded-md overflow-hidden group">
            <Image src="/images/promo1.jpg" alt="Wheels & Tires" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-sm font-semibold">NEW ARRIVALS</span>
              <h3 className="mt-2 text-lg font-semibold">Wheels & Tires</h3>
              <button className="text-sm mt-1 underline">SHOP NOW</button>
            </div>
          </div>

          <div className="relative h-44 rounded-md overflow-hidden group">
            <Image src="/images/promo2.jpg" alt="Interior Silicon Touch" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-sm font-semibold">WINTER SALE</span>
              <h3 className="mt-2 text-lg font-semibold">Interior 3-Silicon Touch</h3>
              <button className="text-sm mt-1 underline">SHOP NOW</button>
            </div>
          </div>

          <div className="relative h-44 rounded-md overflow-hidden group">
            <Image src="/images/promo3.jpg" alt="3D Headlight" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-sm font-semibold">30% Discount</span>
              <h3 className="mt-2 text-lg font-semibold">3D Headlight</h3>
              <button className="text-sm mt-1 underline">SHOP NOW</button>
            </div>
          </div>
        </div>

        {/* CATEGORY + PRODUCTS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-3 bg-[#0e0e0e] border border-gray-800 rounded-md p-5">
            <h4 className="font-semibold flex items-center gap-2 mb-4 text-lg">
              <span className="text-red-500">Tires & Wheels</span>
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center justify-between hover:text-red-500 cursor-pointer">
                Tires & Wheels <ChevronRight size={14} />
              </li>
              <li className="hover:text-red-500 cursor-pointer">Bumpers</li>
              <li className="hover:text-red-500 cursor-pointer">Brake Calipers</li>
              <li className="hover:text-red-500 cursor-pointer">Cylinder Heads</li>
              <li className="hover:text-red-500 cursor-pointer">Door Handles</li>
            </ul>
            <button className="mt-6 w-full border border-gray-700 py-2 rounded-md flex items-center justify-center gap-2 text-sm hover:bg-red-600 hover:border-red-600 transition">
              Show All <ChevronRight size={14} />
            </button>
          </aside>

          {/* Product grid */}
          <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p.id} className="border border-red-800 hover:border-red-600 bg-[#0e0e0e] rounded-md p-4 transition">
                <div className="relative h-40 rounded-md overflow-hidden">
                  <Image src={p.img} alt={p.title} fill className="object-contain bg-black" />
                </div>
                <div className="mt-3">
                  <h5 className="text-sm font-semibold">{p.title}</h5>
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < (p.rating ?? 0) ? "text-yellow-400" : "text-gray-700"} />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-red-500 font-bold">${p.price}</div>
                      <div className="text-xs line-through text-gray-500">${p.oldPrice}</div>
                    </div>
                    <button className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-700">
                      Add To Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER TABS */}
        <div className="grid grid-cols-3 text-center border border-gray-800 rounded-md overflow-hidden">
          <div className="py-3 hover:bg-red-600 transition cursor-pointer">New Arrival</div>
          <div className="py-3 hover:bg-red-600 transition cursor-pointer">Featured Item</div>
          <div className="py-3 hover:bg-red-600 transition cursor-pointer">Sale Off</div>
        </div>
      </div>
    </section>
  );
}
