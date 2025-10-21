"use client"

import React, { useEffect, useState, useRef } from "react";
import { Product } from "../components/types";
import { useCountdown } from "../components/hooks";
import Hero from "../components/Hero";
import WhyChooseUs from "../components/WhyChooseUs";
import DealOfTheDay from "../components/DealOfTheDay";
import PromoBanners from "../components/PromoBanners";
import CategoriesGrid from "../components/CategoriesGrid";
import FilterTabs from "../components/FilterTabs";
import FilteredProducts from "../components/FilteredProducts";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";

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
      <Hero />

      <WhyChooseUs />

      <DealOfTheDay products={products} observerRef={setObserverRef} />

      <PromoBanners />

      <CategoriesGrid
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        gridProducts={gridProducts}
        observerRef={setObserverRef}
      />

      <FilterTabs
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        observerRef={setObserverRef}
      />

      <FilteredProducts
        filteredProducts={filteredProducts}
        selectedFilter={selectedFilter}
        observerRef={setObserverRef}
      />

      <Testimonials observerRef={setObserverRef} />

      <Newsletter />
    </main>
  );
}
