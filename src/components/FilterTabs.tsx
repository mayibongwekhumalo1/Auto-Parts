interface FilterTabsProps {
  selectedFilter: string | null;
  setSelectedFilter: (filter: string | null) => void;
  observerRef: (index: number) => (el: HTMLDivElement | null) => void;
}

export default function FilterTabs({ selectedFilter, setSelectedFilter, observerRef }: FilterTabsProps) {
  return (
    <section
      ref={observerRef(9)}
      className="max-w-[1200px] mx-auto px-2 sm:px-4 lg:px-6 mt-16 mb-20 transform translate-y-10 transition-all duration-700"
    >
      <div className="border border-zinc-800 rounded-md overflow-hidden grid grid-cols-1 sm:grid-cols-3 text-center hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
        <div
          className={`py-3 sm:py-4 hover:bg-zinc-800 hover:text-red-400 transition-all duration-300 cursor-pointer text-sm sm:text-base ${
            selectedFilter === 'new' ? 'bg-red-700 text-white' : ''
          }`}
          onClick={() => setSelectedFilter(selectedFilter === 'new' ? null : 'new')}
        >
          New Arrival
        </div>
        <div
          className={`py-3 sm:py-4 hover:bg-zinc-800 hover:text-red-400 transition-all duration-300 cursor-pointer text-sm sm:text-base border-t sm:border-t-0 sm:border-l sm:border-r border-zinc-700 ${
            selectedFilter === 'featured' ? 'bg-red-700 text-white' : ''
          }`}
          onClick={() => setSelectedFilter(selectedFilter === 'featured' ? null : 'featured')}
        >
          Featured Item
        </div>
        <div
          className={`py-3 sm:py-4 hover:bg-zinc-800 hover:text-red-400 transition-all duration-300 cursor-pointer text-sm sm:text-base border-t sm:border-t-0 border-zinc-700 ${
            selectedFilter === 'sale' ? 'bg-red-700 text-white' : ''
          }`}
          onClick={() => setSelectedFilter(selectedFilter === 'sale' ? null : 'sale')}
        >
          Sale Off
        </div>
      </div>
    </section>
  );
}