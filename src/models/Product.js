const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price must be positive']
  },
  supplier: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Please add a brand'],
    trim: true
  },
  images: [{
    type: String,
    default: []
  }],
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  sale: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search and performance
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ supplier: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ sale: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ category: 1, featured: 1, stock: 1 }); // Compound index for homepage queries
ProductSchema.index({ brand: 1, category: 1 }); // Compound index for filtering

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);