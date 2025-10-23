"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from './types';
import OptimizedImage from './ImageOptimizer';

interface ProductRecommendationsProps {
  currentProductId?: string;
  userId?: string;
  category?: string;
  limit?: number;
  className?: string;
}

export default function ProductRecommendations({
  currentProductId,
  userId,
  category,
  limit = 4,
  className = ""
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);

        // Build query parameters for AI-powered recommendations
        const params = new URLSearchParams({
          limit: limit.toString(),
          type: 'ai_recommendations'
        });

        if (currentProductId) params.append('exclude', currentProductId);
        if (userId) params.append('userId', userId);
        if (category) params.append('category', category);

        const response = await fetch(`/api/products/recommendations?${params}`);
        const data = await response.json();

        if (data.success) {
          setRecommendations(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to category-based recommendations
        if (category) {
          try {
            const fallbackResponse = await fetch(
              `/api/products?category=${encodeURIComponent(category)}&limit=${limit}&exclude=${currentProductId || ''}`
            );
            const fallbackData = await fallbackResponse.json();
            setRecommendations(fallbackData.products || []);
          } catch (fallbackError) {
            console.error('Fallback recommendations failed:', fallbackError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId, userId, category, limit]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-white">Recommended for You</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg p-4 animate-pulse">
              <div className="w-full h-32 bg-zinc-800 rounded mb-2"></div>
              <div className="h-4 bg-zinc-800 rounded mb-1"></div>
              <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <span className="text-red-500">🤖</span>
        AI Recommended for You
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <Link
            key={product._id}
            href={`/products/${product._id}`}
            className="bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors group"
          >
            <div className="relative w-full h-32 mb-3 overflow-hidden rounded">
              <OptimizedImage
                src={product.images?.[0] || '/images/placeholder.jpg'}
                alt={product.name}
                width={200}
                height={128}
                className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {product.sale && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  SALE
                </div>
              )}
            </div>
            <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
              {product.name}
            </h4>
            <p className="text-zinc-400 text-xs mb-2">{product.brand}</p>
            <div className="flex items-center justify-between">
              <span className="text-red-500 font-semibold">
                ${product.price.toFixed(2)}
              </span>
              {product.stock < 10 && product.stock > 0 && (
                <span className="text-yellow-500 text-xs">
                  Only {product.stock} left
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Hook for getting recommendations based on user behavior
export function useProductRecommendations(userId?: string, category?: string) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async (options: {
    limit?: number;
    excludeIds?: string[];
    context?: 'cart' | 'viewed' | 'purchased';
  } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: (options.limit || 6).toString(),
        type: 'behavior_based'
      });

      if (userId) params.append('userId', userId);
      if (category) params.append('category', category);
      if (options.excludeIds?.length) {
        params.append('exclude', options.excludeIds.join(','));
      }
      if (options.context) params.append('context', options.context);

      const response = await fetch(`/api/products/recommendations?${params}`);
      const data = await response.json();

      if (data.success) {
        setRecommendations(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    recommendations,
    loading,
    fetchRecommendations
  };
}