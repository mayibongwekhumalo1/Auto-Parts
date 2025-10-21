import React, { useMemo } from "react";
import Image from "next/image";
import { Clock, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Product } from "./types";
import { useCountdown } from "./hooks";

interface DealOfTheDayProps {
  products: Product[];
  observerRef: (index: number) => (el: HTMLDivElement | null) => void;
}

export default function DealOfTheDay({ products, observerRef }: DealOfTheDayProps) {
  // countdown to 5 days from now
  const target = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);
  const { days, hours, minutes, seconds } = useCountdown(target);

  return (
    <section
      ref={observerRef(3)}
      className="max-w-[1200px] mx-auto px-4 md:px-6 mt-16 transform translate-y-10 transition-all duration-700"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-lg sm:text-xl font-semibold animate-fade-in-up">Deal Of The Day</h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in-up animation-delay-200 w-full sm:w-auto">
          <div className="bg-red-700 px-3 sm:px-4 py-2 rounded-md inline-flex items-center gap-2 animate-glow hover:scale-105 transition-transform duration-300 w-full sm:w-auto justify-center">
            <Clock size={14} className="sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">
              END IN: {days}d:{hours}h:{minutes}m:{seconds}s
            </span>
          </div>
          <button className="px-4 py-2 border border-zinc-700 hover:border-red-500 hover:text-red-400 rounded-md transition-all duration-300 hover:scale-105 w-full sm:w-auto">Show All</button>
        </div>
      </div>

      {/* carousel container */}
      <div className="relative">
        {/* scroll area */}
        <div
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {products.map((p) => (
            <article
              key={p._id}
              className="snap-start shrink-0 w-[240px] sm:w-[260px] bg-zinc-900 border border-zinc-800 rounded-md p-3 sm:p-4 hover:bg-zinc-800 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 transform"
            >
              <div className="relative h-32 sm:h-36 rounded-md overflow-hidden border border-zinc-700 hover:border-red-500 transition-colors duration-300">
                <Image src={p.images[0] || "/images/placeholder.jpg"} alt={p.name} fill className="object-cover hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-semibold hover:text-red-400 transition-colors duration-300">{p.name}</h3>
                  <div className="text-xs sm:text-sm text-zinc-400">${p.price}</div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className="text-zinc-700 hover:text-yellow-500 transition-colors duration-300 sm:w-3.5 sm:h-3.5" />
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-base sm:text-lg font-bold text-red-600 animate-neon-flicker">${p.price}</div>
                  <button className="mt-3 w-full bg-red-700 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/50 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105">Add To Cart</button>
                </div>

                <div className="mt-3 text-xs text-zinc-400 flex justify-between">
                  <span>Available:{p.stock}</span>
                  <span>{p.category}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* optional left/right chevrons (visual) */}
        <div className="hidden lg:flex absolute top-1/2 transform -translate-y-1/2 left-0 -translate-x-2">
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-full">
            <ChevronLeft size={18} />
          </div>
        </div>
        <div className="hidden lg:flex absolute top-1/2 transform -translate-y-1/2 right-0 translate-x-2">
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-full">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </section>
  );
}