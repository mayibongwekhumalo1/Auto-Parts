import { Star } from "lucide-react";
import { testimonials } from "./data";

interface TestimonialsProps {
  observerRef: (index: number) => (el: HTMLDivElement | null) => void;
}

export default function Testimonials({ observerRef }: TestimonialsProps) {
  return (
    <section
      ref={observerRef(7)}
      className="max-w-[] mx-auto px-4 md:px-6 mt-16 transform translate-y-10 transition-all duration-700"
    >
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold animate-fade-in-up">What Our Customers Say</h2>
        <p className="text-zinc-300 mt-2 text-sm sm:text-base animate-fade-in-up animation-delay-200">Real reviews from satisfied customers</p>
      </div>

      {/* Scrolling Testimonials Ticker */}
      <div className="relative  overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg p-4 sm:p-8 mb-6 sm:mb-8 border border-zinc-700">
        <div className="flex animate-scroll-left">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={`${testimonial.id}-${index}`}
              className="flex-shrink-0 w-72 sm:w-80 mx-4 sm:mx-6 bg-zinc-900/50 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-zinc-600 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-red-700 rounded-full mr-3 sm:mr-4 flex items-center justify-center text-white font-bold text-sm sm:text-base animate-glow">
                  {testimonial.initials}
                </div>
                <div>
                  <div className="font-semibold text-zinc-200 text-sm sm:text-base">{testimonial.name}</div>
                  <div className="text-xs text-zinc-400">{testimonial.location}</div>
                </div>
              </div>
              <div className="flex items-center mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={12} className="text-yellow-500 animate-pulse-slow sm:w-3.5 sm:h-3.5" />
                ))}
              </div>
              <p className="text-zinc-300 text-xs sm:text-sm italic">&ldquo;{testimonial.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}