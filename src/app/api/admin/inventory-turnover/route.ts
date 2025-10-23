import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/database';
import Product, { IProduct } from '@/models/Product';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // 'month', 'quarter', 'year'
    const limit = parseInt(searchParams.get('limit') || '20');

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    // Get sales data for the period
    const salesData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      }
    ]);

    // Get current inventory data
    const products = await Product.find({})
      .select('name category brand stock costPrice price createdAt')
      .lean();

    // Calculate turnover metrics
    const turnoverData = products.map((product: IProduct) => {
      const sales = salesData.find(s => s._id.toString() === product._id.toString());
      const unitsSold = sales?.totalSold || 0;
      const averageInventory = product.stock; // Simplified - could be more complex
      const costOfGoodsSold = unitsSold * (product.costPrice || product.price);

      const turnoverRatio = averageInventory > 0 ? unitsSold / averageInventory : 0;
      const daysInPeriod = period === 'month' ? 30 : period === 'quarter' ? 90 : 365;
      const turnoverDays = turnoverRatio > 0 ? daysInPeriod / turnoverRatio : Infinity;

      return {
        productId: product._id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        currentStock: product.stock,
        unitsSold,
        turnoverRatio: Math.round(turnoverRatio * 100) / 100,
        turnoverDays: turnoverDays === Infinity ? null : Math.round(turnoverDays),
        costOfGoodsSold,
        grossMargin: sales?.totalRevenue ? ((sales.totalRevenue - costOfGoodsSold) / sales.totalRevenue) * 100 : 0
      };
    });

    // Sort by turnover ratio (descending) and filter out products with no sales
    const filteredData = turnoverData
      .filter(item => item.unitsSold > 0)
      .sort((a, b) => b.turnoverRatio - a.turnoverRatio)
      .slice(0, limit);

    // Calculate summary metrics
    const summary = {
      totalProducts: products.length,
      productsWithSales: filteredData.length,
      averageTurnoverRatio: filteredData.length > 0 ?
        filteredData.reduce((sum, item) => sum + item.turnoverRatio, 0) / filteredData.length : 0,
      fastMovingProducts: filteredData.filter(item => item.turnoverRatio >= 4).length, // Turnover >= 4x per period
      slowMovingProducts: filteredData.filter(item => item.turnoverRatio < 1).length, // Turnover < 1x per period
      period
    };

    return NextResponse.json({
      success: true,
      data: filteredData,
      summary,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    });
  } catch (error) {
    console.error('Inventory turnover error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch inventory turnover metrics' },
      { status: 500 }
    );
  }
}