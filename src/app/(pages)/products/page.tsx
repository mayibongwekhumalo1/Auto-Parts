'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  featured: boolean;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || '';
    setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedBrand, priceRange, stockFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      if (stockFilter) params.append('stock', stockFilter);
      if (sortBy) params.append('sort', sortBy);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setProducts(data.products || []);

      // Extract unique categories and brands
      const uniqueCategories = [...new Set(data.products?.map((p: Product) => p.category) || [])] as string[];
      const uniqueBrands = [...new Set(data.products?.map((p: Product) => p.brand) || [])] as string[];
      setCategories(uniqueCategories);
      setBrands(uniqueBrands);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        alert('Product added to cart!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white antialiased">
      {/* Header */}
      <div className="bg-zinc-900/95 backdrop-blur-sm shadow-lg border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-red-600">
              Auto Parts Catalog
            </h1>
            <div className="text-sm text-zinc-400">
              {products.length} products found
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Sort Bar */}
        <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="🔍 Search auto parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-zinc-400 text-lg"
              />
            </div>
            <div className="flex gap-4 items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
              >
                <option value="">Sort by...</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
                >
                  <option value="">All Categories</option>
                  <option value="Engine Parts">Engine Parts</option>
                  <option value="Brake Systems">Brake Systems</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Body Parts">Body Parts</option>
                  <option value="Interior">Interior</option>
                  <option value="Tires & Wheels">Tires & Wheels</option>
                  <option value="Tools & Equipment">Tools & Equipment</option>
                  {categories.filter(category => !['Engine Parts', 'Brake Systems', 'Suspension', 'Electrical', 'Body Parts', 'Interior', 'Tires & Wheels', 'Tools & Equipment'].includes(category)).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
                >
                  <option value="">All Brands</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="BMW">BMW</option>
                  <option value="Land Rover">Land Rover</option>
                  <option value="Toyota">Toyota</option>
                  {brands.filter(brand => !['Mercedes-Benz', 'BMW', 'Land Rover', 'Toyota'].includes(brand)).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-zinc-400"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-zinc-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
                >
                  <option value="">All Products</option>
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product._id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-red-600 transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="relative h-56 bg-zinc-800 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {product.featured && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    🔥 Featured
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-red-500 transition-colors">{product.name}</h3>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-red-600">${product.price}</span>
                    <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                    </span>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{product.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-full border border-zinc-700">
                    {product.category}
                  </span>
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-full border border-zinc-700">
                    {product.brand}
                  </span>
                </div>
                <button
                  onClick={() => addToCart(product._id)}
                  disabled={product.stock === 0}
                  className="w-full bg-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-800 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {product.stock === 0 ? '🚫 Out of Stock' : '🛒 Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <svg className="w-24 h-24 mx-auto text-zinc-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.203-2.47M12 7v14m0-14l-3 3m3-3l3 3" />
              </svg>
              <h3 className="text-2xl font-bold text-white mb-2">No Products Found</h3>
              <p className="text-zinc-400 mb-6">Try adjusting your filters or search terms to find what you're looking for.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedBrand('');
                  setPriceRange({ min: '', max: '' });
                  setStockFilter('');
                  setSortBy('');
                }}
                className="bg-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-all shadow-md hover:shadow-lg"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}