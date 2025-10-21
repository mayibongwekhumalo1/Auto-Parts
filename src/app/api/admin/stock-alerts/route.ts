import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/database';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get('threshold') || '10');
    const category = searchParams.get('category');

    const query: Record<string, unknown> = {
      stock: { $lte: threshold }
    };

    if (category) {
      query.category = category;
    }

    const lowStockProducts = await Product.find(query)
      .select('name category brand stock price supplier')
      .sort({ stock: 1 })
      .lean();

    const alerts = lowStockProducts.map(product => ({
      id: product._id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      currentStock: product.stock,
      price: product.price,
      supplier: product.supplier,
      alertLevel: product.stock === 0 ? 'out_of_stock' :
                 product.stock <= 2 ? 'critical' :
                 product.stock <= 5 ? 'warning' : 'low'
    }));

    // Summary statistics
    const summary = {
      totalAlerts: alerts.length,
      outOfStock: alerts.filter(a => a.alertLevel === 'out_of_stock').length,
      critical: alerts.filter(a => a.alertLevel === 'critical').length,
      warning: alerts.filter(a => a.alertLevel === 'warning').length,
      low: alerts.filter(a => a.alertLevel === 'low').length
    };

    return NextResponse.json({
      success: true,
      data: alerts,
      summary,
      threshold,
      category: category || 'all'
    });
  } catch (error) {
    console.error('Stock alerts error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stock alerts' },
      { status: 500 }
    );
  }
}