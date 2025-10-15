"use client"

import React from "react";
import { Star, ShoppingCart, Truck, Shield, RotateCcw, Phone } from "lucide-react";

export default function ShortcodePage() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white antialiased">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shortcodes</h1>
          <p className="text-zinc-400">Reusable components and elements for the website</p>
        </div>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6 text-center">
              <Truck className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Free Shipping</h3>
              <p className="text-zinc-400 text-sm">Free shipping on orders over $100</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6 text-center">
              <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-zinc-400 text-sm">1 year warranty on all products</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6 text-center">
              <RotateCcw className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
              <p className="text-zinc-400 text-sm">30-day return policy</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-zinc-300 mb-4">
                "Excellent quality parts and fast shipping. The website is easy to navigate and the customer service is outstanding."
              </p>
              <div className="text-sm text-zinc-400">- John D., Verified Customer</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-zinc-300 mb-4">
                "Found exactly what I needed for my car restoration project. Competitive prices and great selection."
              </p>
              <div className="text-sm text-zinc-400">- Sarah M., Verified Customer</div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Need Help Finding Parts?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Our expert team is here to help you find the right parts for your vehicle. Contact us today!
            </p>
            <button className="bg-white text-red-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto">
              <Phone size={18} />
              Call Now: (555) 123-4567
            </button>
          </div>
        </section>

        {/* Product Highlight */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Featured Product</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="bg-zinc-800 h-48 rounded-md flex items-center justify-center">
                  <span className="text-zinc-400">Product Image</span>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-semibold mb-2">Premium Brake Pads</h3>
                <p className="text-zinc-300 mb-4">
                  High-performance brake pads designed for superior stopping power and durability.
                  Ceramic formulation for reduced dust and noise.
                </p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-2xl font-bold text-red-600">$89.99</div>
                  <div className="text-sm text-zinc-500 line-through">$109.99</div>
                  <div className="bg-red-600 px-2 py-1 rounded text-sm">Save 18%</div>
                </div>
                <button className="bg-red-700 hover:bg-red-800 px-6 py-3 rounded-md font-semibold flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
              <h3 className="text-lg font-semibold mb-3">Store Hours</h3>
              <div className="space-y-2 text-zinc-300">
                <div>Monday - Friday: 8:00 AM - 6:00 PM</div>
                <div>Saturday: 9:00 AM - 4:00 PM</div>
                <div>Sunday: Closed</div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
              <h3 className="text-lg font-semibold mb-3">Location</h3>
              <div className="text-zinc-300">
                <div>123 Auto Parts Street</div>
                <div>Mechanic City, MC 12345</div>
                <div className="mt-2">Phone: (555) 123-4567</div>
                <div>Email: info@euromechanic.com</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}