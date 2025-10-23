import { Product } from "./types";
import { Star, ShoppingCart } from "lucide-react";
import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import OptimizedImage from "./ImageOptimizer";

// Lazy load ProductModal for better performance
const ProductModal = dynamic(() => import("./ProductModal"), {
  loading: () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
});

interface FilteredProductsProps {
  filteredProducts: Product[];
  selectedFilter: string | null;
  observerRef: (index: number) => (el: HTMLDivElement | null) => void;
}

export default function FilteredProducts({ filteredProducts, selectedFilter, observerRef }: FilteredProductsProps) {
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
      ref={observerRef(10)}
      className="max-w-[full] mx-auto px-2 sm:px-4 lg:px-6 mt-8 mb-20 transform translate-y-10 transition-all duration-700"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredProducts.length > 0 ? filteredProducts.map((p) => (
           <div key={p._id} className="bg-zinc-900 border border-zinc-800 rounded-md p-3 sm:p-4 hover:bg-zinc-800 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 transform cursor-pointer" onClick={() => openModal(p)}>
            <div className="relative h-36 sm:h-44 rounded-md overflow-hidden border border-zinc-700 hover:border-red-500 transition-colors duration-300">
              <OptimizedImage
                src={(p.images && p.images.length > 0) ? p.images[0] : "/images/placeholder.jpg"}
                alt={p.name}
                width={400}
                height={300}
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
            {selectedFilter ? `No ${selectedFilter} products found.` : 'Select a filter to view products.'}
          </div>
        )}
      </div>

      <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>}>
        <ProductModal
          product={selectedProduct}
          isOpen={modalOpen}
          onClose={closeModal}
          onAddToCart={addToCart}
          loading={loading}
        />
      </Suspense>
    </section>
  );
}