import { Truck, Wrench, Shield, Phone } from "lucide-react";

export default function WhyChooseUs() {
  return (
    <section className="max-w-[100%] mx-10 px-4 md:px-6 mt-16 transform translate-y-10 transition-all duration-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold animate-fade-in-up">Why Choose Us?</h2>
        <p className="text-zinc-300 mt-2 animate-fade-in-up animation-delay-200">Quality service and support you can trust</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="bg-zinc-900 p-6 sm:p-8 rounded-md text-center border border-zinc-800 hover:bg-zinc-800 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 transform">
          <Truck size={40} className="text-red-600 mb-4 mx-auto animate-pulse-slow sm:w-12 sm:h-12" />
          <h3 className="font-semibold mb-2 text-base sm:text-lg animate-fade-in-up animation-delay-400">Free Shipping</h3>
          <p className="text-xs sm:text-sm text-zinc-400 animate-fade-in-up animation-delay-600">On orders over $50</p>
        </div>
        <div className="bg-zinc-900 p-6 sm:p-8 rounded-md text-center border border-zinc-800 hover:bg-zinc-800 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 transform">
          <Wrench size={40} className="text-red-600 mb-4 mx-auto animate-pulse-slow sm:w-12 sm:h-12" />
          <h3 className="font-semibold mb-2 text-base sm:text-lg animate-fade-in-up animation-delay-400">Expert Guides</h3>
          <p className="text-xs sm:text-sm text-zinc-400 animate-fade-in-up animation-delay-600">Installation tutorials</p>
        </div>
        <div className="bg-zinc-900 p-6 sm:p-8 rounded-md text-center border border-zinc-800 hover:bg-zinc-800 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 transform">
          <Shield size={40} className="text-red-600 mb-4 mx-auto animate-pulse-slow sm:w-12 sm:h-12" />
          <h3 className="font-semibold mb-2 text-base sm:text-lg animate-fade-in-up animation-delay-400">Warranty</h3>
          <p className="text-xs sm:text-sm text-zinc-400 animate-fade-in-up animation-delay-600">On all parts</p>
        </div>
        <div className="bg-zinc-900 p-6 sm:p-8 rounded-md text-center border border-zinc-800 hover:bg-zinc-800 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 transform">
          <Phone size={40} className="text-red-600 mb-4 mx-auto animate-pulse-slow sm:w-12 sm:h-12" />
          <h3 className="font-semibold mb-2 text-base sm:text-lg animate-fade-in-up animation-delay-400">24/7 Support</h3>
          <p className="text-xs sm:text-sm text-zinc-400 animate-fade-in-up animation-delay-600">Customer service</p>
        </div>
      </div>
    </section>
  );
}