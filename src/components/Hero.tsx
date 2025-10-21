import React from "react";
import Image from "next/image";

// Reusable ChevronDecoration component for better maintainability and performance
const ChevronDecoration = React.memo(function ChevronDecoration() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      <path d="M10 10 L60 50 L10 90" stroke="currentColor" strokeWidth="10" fill="none" strokeLinecap="square" />
    </svg>
  );
});

export default function Hero() {
  return (
    <section className="max-w-[100%] h-screen mx-10 px-2 sm:px-4 lg:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      <div className="lg:col-span-7 bg-zinc-900 h-[80%] rounded-lg p-6 sm:p-8 relative overflow-hidden transform translate-y-10 transition-all duration-700 hover:shadow-2xl hover:shadow-red-500/20">
        <div className="inline-flex items-center gap-3 text-xs sm:text-sm bg-red-700 px-3 py-1 rounded-full w-max mb-6 animate-neon-flicker">15% OFF</div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight animate-fade-in-up">
          Oil Change <span className="block animate-fade-in-up animation-delay-200">Packages</span>
        </h1>
        <p className="mt-4 text-zinc-300 text-sm sm:text-base animate-fade-in-up animation-delay-400">See in shop for details.</p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animation-delay-600">
          <button className="bg-red-700 hover:bg-red-600 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 px-5 py-3 rounded-md font-semibold transition-all duration-300 transform w-full sm:w-auto">Shop Now</button>
          <button className="px-4 py-3 border border-zinc-700 hover:border-red-500 hover:text-red-400 rounded-md transition-all duration-300 hover:scale-105 w-full sm:w-auto">Details</button>
        </div>

        {/* decorative chevrons */}
        <div className="absolute right-4 sm:right-6 top-12 w-32 h-32 sm:w-40 sm:h-40 transform rotate-12 opacity-20 animate-pulse-slow text-red-600" aria-hidden="true" role="presentation">
          <ChevronDecoration />
        </div>
      </div>

      <div className="lg:col-span-5 relative h-48 sm:h-64 lg:h-100 rounded-lg overflow-hidden transform translate-y-10 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30">
        {/* hero image — replace src with your asset */}
        <Image
          src="/images/hero-oil.jpg"
          alt="oil"
          fill
          className="object-cover transition-transform duration-500 hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
        />
      </div>
    </section>
  );
}