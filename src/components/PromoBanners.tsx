import Image from "next/image";

export default function PromoBanners() {
  return (
    <section className="max-w-[] mx-auto px-2 sm:px-4 lg:px-6 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transform translate-y-10 transition-all duration-700">
      <div className="relative h-32 sm:h-36 rounded-md overflow-hidden border border-zinc-800 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 transform">
        <Image src="/images/promo1.jpg" alt="promo1" fill className="object-cover hover:scale-110 transition-transform duration-500" />
        <div className="absolute left-3 sm:left-4 bottom-3 sm:bottom-4">
          <div className="bg-zinc-900/70 px-2 sm:px-3 py-1 rounded-md text-xs animate-fade-in-up">NEW ARRIVALS</div>
          <div className="text-white font-semibold mt-1 sm:mt-2 text-sm sm:text-base animate-fade-in-up animation-delay-200">Wheels & Tires</div>
        </div>
      </div>

      <div className="relative h-32 sm:h-36 rounded-md overflow-hidden border border-zinc-800 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 transform">
        <Image src="/images/promo2.jpg" alt="promo2" fill className="object-cover hover:scale-110 transition-transform duration-500" />
        <div className="absolute left-3 sm:left-4 bottom-3 sm:bottom-4">
          <div className="bg-zinc-900/70 px-2 sm:px-3 py-1 rounded-md text-xs animate-fade-in-up">WINTER SALE</div>
          <div className="text-white font-semibold mt-1 sm:mt-2 text-sm sm:text-base animate-fade-in-up animation-delay-200">Interior 3-Silicon Touch</div>
        </div>
      </div>

      <div className="relative h-32 sm:h-36 rounded-md overflow-hidden border border-zinc-800 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 transform sm:col-span-2 lg:col-span-1">
        <Image src="/images/promo3.jpg" alt="promo3" fill className="object-cover hover:scale-110 transition-transform duration-500" />
        <div className="absolute left-3 sm:left-4 bottom-3 sm:bottom-4">
          <div className="bg-zinc-900/70 px-2 sm:px-3 py-1 rounded-md text-xs animate-fade-in-up">SPECIAL OFFER</div>
          <div className="text-white font-semibold mt-1 sm:mt-2 text-sm sm:text-base animate-fade-in-up animation-delay-200">Engine Parts</div>
        </div>
      </div>
    </section>
  );
}