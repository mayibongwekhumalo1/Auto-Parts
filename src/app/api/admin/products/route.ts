import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/utils/database';
import Product from '@/models/Product';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  return decoded.userId;
}

// GET /api/admin/products - Get all products (Admin only)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);

    // Check if user is admin
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const products = await Product.find({})
      .sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);

    // Check if user is admin
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { name, description, price, stock, category, brand, featured, images } = await request.json();

    // Validate input
    if (!name || !description || !price || !stock || !category || !brand) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      brand,
      featured: featured || false,
      images: images || []
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/bulk-price-update - Bulk update product prices (Admin only)
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);

    // Check if user is admin
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { productIds, percentage, type } = await request.json();

    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Please provide productIds array' },
        { status: 400 }
      );
    }

    if (typeof percentage !== 'number' || percentage < -100 || percentage > 1000) {
      return NextResponse.json(
        { error: 'Please provide valid percentage (-100 to 1000)' },
        { status: 400 }
      );
    }

    if (!type || !['percentage', 'fixed'].includes(type)) {
      return NextResponse.json(
        { error: 'Please provide valid type (percentage or fixed)' },
        { status: 400 }
      );
    }

    // Get products to update
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products found' },
        { status: 404 }
      );
    }

    // Update prices
    const updatePromises = products.map(async (product) => {
      let newPrice: number;

      if (type === 'percentage') {
        newPrice = product.price * (1 + percentage / 100);
      } else {
        newPrice = product.price + percentage;
      }

      // Ensure price doesn't go below 0
      newPrice = Math.max(0, newPrice);

      return Product.findByIdAndUpdate(
        product._id,
        { price: newPrice, updatedAt: new Date() },
        { new: true }
      );
    });

    const updatedProducts = await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Updated prices for ${updatedProducts.length} products`,
      updatedProducts
    });
  } catch (error) {
    console.error('Error updating product prices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}