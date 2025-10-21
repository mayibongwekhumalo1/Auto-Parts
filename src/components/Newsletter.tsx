export default function Newsletter() {
  return (
    <section className="max-w-[]  px-2 sm:px-4 lg:px-6 mt-20 transform translate-y-10 transition-all duration-700">
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-8 sm:p-12 rounded-md text-center border border-zinc-700 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-500">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 animate-fade-in-up">Subscribe for Exclusive Deals</h2>
        <p className="text-zinc-300 mb-6 sm:mb-8 text-base sm:text-lg animate-fade-in-up animation-delay-200">Get 10% off your first order and stay updated with the latest parts.</p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-lg mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="px-4 sm:px-6 py-3 bg-zinc-800 border border-zinc-600 rounded-md text-white placeholder-zinc-400 flex-1 text-base sm:text-lg hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button className="bg-red-700 hover:bg-red-600 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 px-6 sm:px-8 py-3 rounded-md font-semibold text-base sm:text-lg transition-all duration-300 transform">Subscribe Now</button>
        </div>
        <p className="text-zinc-400 text-xs sm:text-sm mt-4 animate-fade-in-up animation-delay-400">No spam, unsubscribe anytime.</p>
      </div>
    </section>
  );
}