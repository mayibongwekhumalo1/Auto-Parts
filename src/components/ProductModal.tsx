import React from "react";
import Image from "next/image";
import { X, Star, ShoppingCart } from "lucide-react";
import { Product } from "./types";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
  loading: string | null;
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart, loading }: ProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-white">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative h-64 rounded-lg overflow-hidden border border-zinc-700">
                <Image
                  src={product.images[0] || "/images/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative w-16 h-16 rounded border border-zinc-700 overflow-hidden flex-shrink-0">
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="text-zinc-700" />
                ))}
              </div>

              <div className="text-2xl font-bold text-red-600">${product.price}</div>

              <div className="space-y-2 text-sm">
                <p><span className="text-zinc-400">Category:</span> {product.category}</p>
                <p><span className="text-zinc-400">Brand:</span> {product.brand}</p>
                <p><span className="text-zinc-400">Stock:</span> {product.stock}</p>
                <p><span className="text-zinc-400">Featured:</span> {product.featured ? 'Yes' : 'No'}</p>
                <p><span className="text-zinc-400">On Sale:</span> {product.sale ? 'Yes' : 'No'}</p>
              </div>

              <p className="text-zinc-300">{product.description}</p>

              <button
                onClick={() => onAddToCart(product._id)}
                disabled={loading === product._id}
                className="w-full bg-red-700 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/50 py-3 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                {loading === product._id ? 'Adding...' : 'Add To Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}