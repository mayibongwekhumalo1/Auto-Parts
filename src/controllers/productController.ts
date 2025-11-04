import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../utils/database';
import Product from '../models/Product';
import { validateProductData, sanitizeString } from '../utils/validation';

// GET /api/products - Get all products with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const sale = searchParams.get('sale') === 'true';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build filter object
    interface ProductFilter {
      category?: string;
      brand?: string;
      featured?: boolean;
      sale?: boolean;
      $text?: { $search: string };
    }

    const filter: ProductFilter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (featured) filter.featured = true;
    if (sale) filter.sale = true;
    if (search) {
      filter.$text = { $search: search };
    }

    // Handle distinct categories request
    if (searchParams.get('distinct') === 'categories') {
      const categories = await Product.distinct('category');
      return NextResponse.json({ categories });
    }

    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('name description price images stock category brand featured sale') // Only select needed fields
      .lean();

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, description, price, category, brand, images, stock, featured, sale } = body;

    // Sanitize inputs
    const sanitizedData = {
      name: name ? sanitizeString(name) : '',
      description: description ? sanitizeString(description) : '',
      price,
      category: category ? sanitizeString(category) : '',
      brand: brand ? sanitizeString(brand) : '',
      images,
      stock,
      featured,
      sale
    };

    // Validate data
    const validation = validateProductData(sanitizedData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name: sanitizedData.name,
      description: sanitizedData.description,
      price: sanitizedData.price,
      category: sanitizedData.category,
      brand: sanitizedData.brand,
      images: sanitizedData.images || [],
      stock: sanitizedData.stock,
      featured: sanitizedData.featured || false,
      sale: sanitizedData.sale || false
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