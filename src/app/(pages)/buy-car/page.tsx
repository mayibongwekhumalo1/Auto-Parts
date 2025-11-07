"use client"

import React, { useState } from "react";
import { Car, Fuel, Settings, Users, Calendar, DollarSign, Search, Filter } from "lucide-react";

type CarListing = {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  seats: number;
  image: string;
  featured: boolean;
};

export default function BuyCarPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [selectedTransmission, setSelectedTransmission] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const carListings: CarListing[] = [
    {
      id: 1,
      make: "BMW",
      model: "3 Series",
      year: 2022,
      price: 45000,
      mileage: 15000,
      fuel: "Petrol",
      transmission: "Automatic",
      seats: 5,
      image: "/images/car1.jpg",
      featured: true
    },
    {
      id: 2,
      make: "Mercedes-Benz",
      model: "C-Class",
      year: 2021,
      price: 52000,
      mileage: 22000,
      fuel: "Diesel",
      transmission: "Automatic",
      seats: 5,
      image: "/images/car2.jpg",
      featured: false
    },
    {
      id: 3,
      make: "Audi",
      model: "A4",
      year: 2023,
      price: 48000,
      mileage: 8000,
      fuel: "Petrol",
      transmission: "Manual",
      seats: 5,
      image: "/images/car3.jpg",
      featured: true
    },
    {
      id: 4,
      make: "Volkswagen",
      model: "Golf",
      year: 2022,
      price: 28000,
      mileage: 18000,
      fuel: "Petrol",
      transmission: "Manual",
      seats: 5,
      image: "/images/car4.jpg",
      featured: false
    },
    {
      id: 5,
      make: "Toyota",
      model: "Camry",
      year: 2021,
      price: 32000,
      mileage: 25000,
      fuel: "Hybrid",
      transmission: "Automatic",
      seats: 5,
      image: "/images/car5.jpg",
      featured: false
    },
    {
      id: 6,
      make: "Honda",
      model: "Civic",
      year: 2023,
      price: 26000,
      mileage: 12000,
      fuel: "Petrol",
      transmission: "Manual",
      seats: 5,
      image: "/images/car6.jpg",
      featured: false
    }
  ];

  const filteredCars = carListings.filter(car => {
    const matchesSearch = car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuel = !selectedFuel || car.fuel === selectedFuel;
    const matchesTransmission = !selectedTransmission || car.transmission === selectedTransmission;

    let matchesPrice = true;
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => parseInt(p));
      matchesPrice = max ? (car.price >= min && car.price <= max) : car.price >= min;
    }

    return matchesSearch && matchesFuel && matchesTransmission && matchesPrice;
  });

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white antialiased">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Buy a Car</h1>
          <p className="text-zinc-400">Find your perfect vehicle from our curated selection</p>
        </div>

        {/* Search and Filters */}
        <section className="mb-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Search by make or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:border-red-600"
              />
            </div>

            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-red-600"
            >
              <option value="">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>

            <select
              value={selectedTransmission}
              onChange={(e) => setSelectedTransmission(e.target.value)}
              className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-red-600"
            >
              <option value="">All Transmissions</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>

            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-red-600"
            >
              <option value="">All Prices</option>
              <option value="0-25000">Under $25,000</option>
              <option value="25000-40000">$25,000 - $40,000</option>
              <option value="40000-60000">$40,000 - $60,000</option>
              <option value="60000">$60,000+</option>
            </select>
          </div>
        </section>

        {/* Results Count */}
        <section className="mb-6">
          <p className="text-zinc-400">
            Showing {filteredCars.length} of {carListings.length} vehicles
          </p>
        </section>

        {/* Car Listings */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div key={car.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-red-600 transition-colors">
              <div className="relative">
                <div className="h-48 bg-zinc-800 flex items-center justify-center">
                  <Car size={48} className="text-zinc-400" />
                </div>
                {car.featured && (
                  <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-xl font-semibold">{car.year} {car.make} {car.model}</h3>
                  <div className="text-2xl font-bold text-red-600 mt-1">${car.price.toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{car.mileage.toLocaleString()} miles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel size={14} />
                    <span>{car.fuel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings size={14} />
                    <span>{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{car.seats} seats</span>
                  </div>
                </div>

                <button className="w-full bg-red-700 hover:bg-red-800 py-3 rounded-md font-semibold flex items-center justify-center gap-2">
                  <DollarSign size={16} />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </section>

        {filteredCars.length === 0 && (
          <section className="text-center py-12">
            <Car size={48} className="text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
            <p className="text-zinc-400">Try adjusting your search criteria</p>
          </section>
        )}

        {/* Call to Action */}
        <section className="mt-12 bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Can&apos;t Find What You&apos;re Looking For?</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Contact our sales team for personalized assistance in finding your dream car.
          </p>
          <button className="bg-white text-red-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
            Contact Sales Team
          </button>
        </section>
      </div>
    </main>
  );
}