import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../utils/database';
import Product from '../../../models/Product';

// Combined homepage data endpoint to reduce multiple API calls
export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Homepage API called');
    await connectToDatabase();
    console.log('[DEBUG] Database connected successfully');

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    console.log(`[DEBUG] Request params: limit=${limit}`);

    // Fetch all homepage data in parallel
    console.log('[DEBUG] Starting parallel data fetch');
    const [featuredProducts, categories, trendingProducts] = await Promise.all([
      // Featured products
      Product.find({ featured: true, stock: { $gt: 0 } })
        .select('name description price images stock category brand featured sale')
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),

      // Distinct categories
      Product.distinct('category'),

      // Trending/popular products (featured + sale + recent)
      Product.find({ stock: { $gt: 0 } })
        .select('name description price images stock category brand featured sale')
        .sort({ featured: -1, sale: -1, createdAt: -1 })
        .limit(limit)
        .lean()
    ]);

    console.log(`[DEBUG] Data fetched: featured=${featuredProducts.length}, categories=${categories.length}, trending=${trendingProducts.length}`);

    return NextResponse.json({
      featured: featuredProducts,
      categories,
      trending: trendingProducts
    });
  } catch (error) {
    console.error('[DEBUG] Homepage data error:', error);
    console.error('[DEBUG] Error stack:', error instanceof Error ? error.stack : 'Unknown error');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}