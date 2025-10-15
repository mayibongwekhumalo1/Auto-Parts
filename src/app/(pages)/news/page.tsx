"use client"

import React from "react";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function NewsPage() {
  const newsArticles = [
    {
      id: 1,
      title: "New Brake Pad Technology Improves Safety",
      excerpt: "Discover the latest advancements in brake pad technology that enhance vehicle safety and performance.",
      date: "2024-01-15",
      author: "Tech Team",
      image: "/images/news1.jpg",
      category: "Technology"
    },
    {
      id: 2,
      title: "Winter Tire Maintenance Guide",
      excerpt: "Essential tips for maintaining your winter tires to ensure optimal performance in cold weather.",
      date: "2024-01-10",
      author: "Maintenance Expert",
      image: "/images/news2.jpg",
      category: "Maintenance"
    },
    {
      id: 3,
      title: "Electric Vehicle Parts Now Available",
      excerpt: "We're excited to announce our new line of electric vehicle parts and accessories.",
      date: "2024-01-05",
      author: "Product Manager",
      image: "/images/news3.jpg",
      category: "Products"
    },
    {
      id: 4,
      title: "Customer Spotlight: Classic Car Restoration",
      excerpt: "Meet our customer who successfully restored a 1965 Mustang using our premium parts.",
      date: "2023-12-28",
      author: "Customer Success",
      image: "/images/news4.jpg",
      category: "Customer Stories"
    },
    {
      id: 5,
      title: "Oil Change Special: 15% Off This Month",
      excerpt: "Take advantage of our monthly oil change special and keep your vehicle running smoothly.",
      date: "2023-12-20",
      author: "Marketing Team",
      image: "/images/news5.jpg",
      category: "Promotions"
    },
    {
      id: 6,
      title: "Understanding Engine Diagnostics",
      excerpt: "Learn about modern engine diagnostic tools and how they help maintain vehicle health.",
      date: "2023-12-15",
      author: "Service Advisor",
      image: "/images/news6.jpg",
      category: "Education"
    }
  ];

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white antialiased">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Auto Parts News</h1>
          <p className="text-zinc-400">Stay updated with the latest automotive news, tips, and industry insights</p>
        </div>

        {/* Featured Article */}
        <section className="mb-12">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="h-64 md:h-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-zinc-400">Featured Article Image</span>
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    {newsArticles[0].category}
                  </span>
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Calendar size={14} />
                    {new Date(newsArticles[0].date).toLocaleDateString()}
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-4">{newsArticles[0].title}</h2>
                <p className="text-zinc-300 mb-6">{newsArticles[0].excerpt}</p>
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-6">
                  <User size={14} />
                  By {newsArticles[0].author}
                </div>
                <button className="bg-red-700 hover:bg-red-800 px-6 py-3 rounded-md font-semibold flex items-center gap-2">
                  Read More
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* News Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.slice(1).map((article) => (
              <article key={article.id} className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden hover:border-red-600 transition-colors">
                <div className="h-48 bg-zinc-800 flex items-center justify-center">
                  <span className="text-zinc-400 text-sm">Article Image</span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-zinc-700 px-2 py-1 rounded text-xs">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1 text-zinc-400 text-xs">
                      <Calendar size={12} />
                      {new Date(article.date).toLocaleDateString()}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-zinc-300 text-sm mb-4 line-clamp-3">{article.excerpt}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-zinc-400 text-xs">
                      <User size={12} />
                      {article.author}
                    </div>
                    <button className="text-red-600 hover:text-red-500 text-sm font-medium flex items-center gap-1">
                      Read More
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Informed</h2>
          <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive the latest automotive news, maintenance tips, and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:border-red-600"
            />
            <button className="bg-red-700 hover:bg-red-800 px-6 py-3 rounded-md font-semibold whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}