import { Product } from "./types";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { useState } from "react";
import ProductModal from "./ProductModal";

interface CategoriesGridProps {
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  gridProducts: Product[];
  observerRef: (index: number) => (el: HTMLDivElement | null) => void;
}

export default function CategoriesGrid({
  categories,
  selectedCategory,
  setSelectedCategory,
  gridProducts,
  observerRef
}: CategoriesGridProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const addToCart = async (productId: string) => {
    setLoading(productId);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        // Show success message or update cart count
        alert('Product added to cart!');
      } else {
        alert('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart');
    } finally {
      setLoading(null);
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <section
      ref={observerRef(6)}
      className="max-w-[] mx-auto px-2 sm:px-4 lg:px-6 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6 transform translate-y-10 transition-all duration-700"
    >
      <aside className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-md p-4 hover:bg-zinc-800 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
        <h4 className="font-semibold animate-fade-in-up text-sm sm:text-base">Categories</h4>
        <ul className="mt-4 text-zinc-300 text-xs sm:text-sm space-y-2">
          {categories.map((category) => (
            <li
              key={category}
              className={`flex justify-between items-center cursor-pointer hover:text-white hover:scale-105 transition-all duration-300 ${
                selectedCategory === category ? 'text-red-600 animate-neon-flicker' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              <span>{category}</span>
              <span className="text-xs text-zinc-400 hover:text-red-400 transition-colors duration-300">›</span>
            </li>
          ))}
        </ul>

        <button
          className="mt-6 w-full border border-zinc-700 py-2 rounded-md hover:bg-zinc-800 hover:border-red-500 hover:text-red-400 transition-all duration-300 hover:scale-105 text-sm"
          onClick={() => setSelectedCategory(null)}
        >
          Show All
        </button>
      </aside>

      <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {gridProducts.length > 0 ? gridProducts.map((p) => (
           <div key={p._id} className="bg-zinc-900 border border-zinc-800 rounded-md p-3 sm:p-4 hover:bg-zinc-800 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 transform cursor-pointer" onClick={() => openModal(p)}>
            <div className="relative h-36 sm:h-44 rounded-md overflow-hidden border border-zinc-700 hover:border-red-500 transition-colors duration-300">
              <Image
                src={(p.images && p.images.length > 0) ? p.images[0] : "/images/placeholder.jpg"}
                alt={p.name}
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="mt-3">
              <div className="text-xs sm:text-sm font-semibold hover:text-red-400 transition-colors duration-300">{p.name}</div>
              <div className="mt-1 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className="text-zinc-700 hover:text-yellow-500 transition-colors duration-300 sm:w-3.5 sm:h-3.5" />
                ))}
              </div>
              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="text-red-600 font-bold animate-neon-flicker text-sm sm:text-base">${p.price}</div>
                  <div className="text-xs text-zinc-500">{p.brand}</div>
                </div>
                <button
                  onClick={() => addToCart(p._id)}
                  disabled={loading === p._id}
                  className="bg-red-700 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/50 px-3 py-2 rounded-md text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <ShoppingCart size={14} />
                  {loading === p._id ? 'Adding...' : 'Add To Cart'}
                </button>

              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 text-zinc-400 animate-fade-in-up">
            No products found in this category.
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={closeModal}
        onAddToCart={addToCart}
        loading={loading}
      />
    </section>
  );
}