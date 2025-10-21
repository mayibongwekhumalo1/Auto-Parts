'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CldUploadWidget } from 'next-cloudinary';
import { ArrowLeft, Edit, Camera, Save, X } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  featured: boolean;
  images: string[];
}

export default function EditProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    featured: false,
    images: [] as string[]
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const product: Product = await response.json();
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          category: product.category,
          brand: product.brand || '',
          stock: product.stock.toString(),
          featured: product.featured,
          images: product.images || []
        });
        setUploadedImages(product.images || []);
      } else {
        setError('Failed to fetch product');
      }
    } catch (error) {
      setError('Failed to fetch product');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          images: uploadedImages
        })
      });

      if (response.ok) {
        setSuccess('Product updated successfully!');
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update product');
      }
    } catch (error) {
      setError('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-orange-500 to-red-500">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Edit className="mr-3 w-6 h-6" />
              Edit Product
            </h1>
            <p className="text-orange-100 mt-1">Update product information</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-[#2a2a2a] text-white"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-bold text-gray-300 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    required
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-[#2a2a2a] text-white"
                    placeholder="Enter brand name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-[#2a2a2a] text-white"
                  placeholder="Enter detailed product description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-bold text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-[#2a2a2a] text-white"
                  >
                    <option value="">Select Category</option>
                    <option value="Engine Parts">Engine Parts</option>
                    <option value="Brake System">Brake System</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Body Parts">Body Parts</option>
                    <option value="Interior">Interior</option>
                    <option value="Tires & Wheels">Tires & Wheels</option>
                    <option value="Tools">Tools</option>
                    <option value="Filters">Filters</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-bold text-gray-300 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-[#2a2a2a] text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-bold text-gray-300 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-[#2a2a2a] text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded bg-[#2a2a2a]"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm font-medium text-gray-300">
                    Mark as featured product
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Product Images
                  </label>
                  <div className="space-y-4">
                    {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
                      <CldUploadWidget
                        uploadPreset="auto_parts_images"
                        onSuccess={(result: any) => {
                          if (result?.info?.secure_url) {
                            setUploadedImages(prev => [...prev, result.info.secure_url]);
                          }
                        }}
                      >
                        {({ open }) => (
                          <button
                            type="button"
                            onClick={() => open()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex items-center"
                          >
                            <Camera className="mr-2 w-4 h-4" />
                            Upload Images
                          </button>
                        )}
                      </CldUploadWidget>
                    ) : (
                      <div className="bg-yellow-900 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg">
                        <p className="text-sm">
                          <strong>Cloudinary not configured:</strong> Image upload is disabled. Please set up your Cloudinary credentials in the environment variables.
                        </p>
                        <p className="text-xs mt-1">
                          Required: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
                        </p>
                      </div>
                    )}

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uploadedImages.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-600"
                            />
                            <button
                              type="button"
                              onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                <Link
                  href="/admin"
                  className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-all duration-200 font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Updating Product...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}