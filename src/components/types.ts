export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  featured: boolean;
  sale: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Testimonial = {
  id: number;
  text: string;
  name: string;
  initials: string;
  rating: number;
  location: string;
};

export type User = {
  _id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};