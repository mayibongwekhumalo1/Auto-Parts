"use client"

import React, { useEffect, useState, useRef, Suspense } from "react";
import { Product } from "../components/types";
import { useCountdown } from "../components/hooks";
import { useApiCache } from "../hooks/useApiCache";
import dynamic from "next/dynamic";

// Lazy load components for better performance
const Hero = dynamic(() => import("../components/Hero"), {
  loading: () => <div className="h-screen bg-[#0b0b0b] animate-pulse"></div>
});
const WhyChooseUs = dynamic(() => import("../components/WhyChooseUs"));
const DealOfTheDay = dynamic(() => import("../components/DealOfTheDay"));
const PromoBanners = dynamic(() => import("../components/PromoBanners"));
const CategoriesGrid = dynamic(() => import("../components/CategoriesGrid"));
const FilterTabs = dynamic(() => import("../components/FilterTabs"));
const FilteredProducts = dynamic(() => import("../components/FilteredProducts"));
const Testimonials = dynamic(() => import("../components/Testimonials"));
const Newsletter = dynamic(() => import("../components/Newsletter"));

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [gridProducts, setGridProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setObserverRef = (index: number) => (el: HTMLDivElement | null) => {
    observerRefs.current[index] = el;
  };

  // Use cached API calls for better performance
  const { data: featuredProducts, loading: productsLoading } = useApiCache(
    'featured-products',
    async () => {
      const response = await fetch('/api/products?limit=4&featured=true');
      const data = await response.json();
      return data.products || [];
    },
    { ttl: 10 * 60 * 1000 } // 10 minutes cache
  );

  const { data: productCategories } = useApiCache(
    'product-categories',
    async () => {
      const response = await fetch('/api/products?distinct=categories');
      const data = await response.json();
      return data.categories || [];
    },
    { ttl: 30 * 60 * 1000 } // 30 minutes cache
  );

  useEffect(() => {
    if (featuredProducts) {
      setProducts(featuredProducts);
    }
    if (productCategories) {
      setCategories(productCategories);
    }
    setLoading(productsLoading);
  }, [featuredProducts, productCategories, productsLoading]);

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

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        let url = '/api/products?limit=12';
        if (selectedFilter === 'new') {
          url = '/api/products?sortBy=createdAt&sortOrder=desc&limit=12';
        } else if (selectedFilter === 'featured') {
          url = '/api/products?featured=true&limit=12';
        } else if (selectedFilter === 'sale') {
          url = '/api/products?sale=true&limit=12';
        }
        const response = await fetch(url);
        const data = await response.json();
        setFilteredProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching filtered products:', error);
      }
    };

    fetchFilteredProducts();
  }, [selectedFilter]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      observerRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);


  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white antialiased">
      <Suspense fallback={<div className="h-screen bg-[#0b0b0b] animate-pulse"></div>}>
        <Hero />
      </Suspense>

      <Suspense fallback={<div className="h-32 bg-[#0b0b0b] animate-pulse"></div>}>
        <WhyChooseUs />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-[#0b0b0b] animate-pulse"></div>}>
        <DealOfTheDay products={products} observerRef={setObserverRef} />
      </Suspense>

      <Suspense fallback={<div className="h-32 bg-[#0b0b0b] animate-pulse"></div>}>
        <PromoBanners />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-[#0b0b0b] animate-pulse"></div>}>
        <CategoriesGrid
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          gridProducts={gridProducts}
          observerRef={setObserverRef}
        />
      </Suspense>

      <Suspense fallback={<div className="h-16 bg-[#0b0b0b] animate-pulse"></div>}>
        <FilterTabs
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          observerRef={setObserverRef}
        />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-[#0b0b0b] animate-pulse"></div>}>
        <FilteredProducts
          filteredProducts={filteredProducts}
          selectedFilter={selectedFilter}
          observerRef={setObserverRef}
        />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-[#0b0b0b] animate-pulse"></div>}>
        <Testimonials observerRef={setObserverRef} />
      </Suspense>

      <Suspense fallback={<div className="h-48 bg-[#0b0b0b] animate-pulse"></div>}>
        <Newsletter />
      </Suspense>
    </main>
  );
}
