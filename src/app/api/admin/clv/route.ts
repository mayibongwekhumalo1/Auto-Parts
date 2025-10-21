import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/database';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const minOrders = parseInt(searchParams.get('minOrders') || '1');

    // Calculate CLV for each user
    const clvData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          firstOrderDate: { $min: '$createdAt' },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      {
        $match: {
          orderCount: { $gte: minOrders }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          totalSpent: 1,
          orderCount: 1,
          firstOrderDate: 1,
          lastOrderDate: 1,
          averageOrderValue: { $divide: ['$totalSpent', '$orderCount'] },
          customerLifetime: {
            $divide: [
              { $subtract: ['$lastOrderDate', '$firstOrderDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: limit
      }
    ]);

    // Calculate overall CLV metrics
    const overallMetrics = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          uniqueCustomers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          _id: 0,
          averageCLV: { $divide: ['$totalRevenue', { $size: '$uniqueCustomers' }] },
          averageOrderValue: { $divide: ['$totalRevenue', '$totalOrders'] },
          totalCustomers: { $size: '$uniqueCustomers' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: clvData,
      overallMetrics: overallMetrics[0] || {},
      limit,
      minOrders
    });
  } catch (error) {
    console.error('CLV analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch CLV analytics' },
      { status: 500 }
    );
  }
}