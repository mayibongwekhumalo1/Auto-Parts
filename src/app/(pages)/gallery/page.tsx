"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";

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

export default function GalleryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=20');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] text-white antialiased flex items-center justify-center">
        <div className="text-xl">Loading gallery...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white antialiased">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Product Gallery</h1>
          <p className="text-zinc-400">Explore our complete collection of auto parts</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden hover:border-red-600 transition-colors">
              <div className="relative h-48">
                <Image
                  src={product.images[0] || "/images/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.featured && (
                  <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                <p className="text-zinc-400 text-xs mb-2">{product.brand}</p>

                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="text-zinc-700" />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-red-600 font-bold">${product.price}</div>
                  <button className="bg-red-700 hover:bg-red-800 px-3 py-2 rounded text-sm font-medium flex items-center gap-1">
                    <ShoppingCart size={14} />
                    Add
                  </button>
                </div>

                <div className="mt-2 text-xs text-zinc-500">
                  Stock: {product.stock}
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400">No products available at the moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}