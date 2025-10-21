import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/database';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // 'day', 'week', 'month', 'year'
    const limit = parseInt(searchParams.get('limit') || '12');

    let groupBy;
    switch (period) {
      case 'day':
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        groupBy = { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
        break;
      case 'month':
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      case 'year':
        groupBy = { $dateToString: { format: '%Y', date: '$createdAt' } };
        break;
      default:
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      },
      {
        $limit: limit
      }
    ]);

    const formattedData = revenueData.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      period,
      limit
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}