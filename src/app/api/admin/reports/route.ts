import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/database';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'profit-margins'; // 'profit-margins', 'monthly-summary', 'export-data'
    const period = searchParams.get('period') || 'month'; // for monthly summary
    const limit = parseInt(searchParams.get('limit') || '12');

    if (reportType === 'profit-margins') {
      // Get profit margins per product and category
      const products = await Product.find({}).select('name category price costPrice brand supplier');

      const productMargins = products.map(product => {
        const costPrice = product.costPrice || 0;
        const sellingPrice = product.price;
        const profit = sellingPrice - costPrice;
        const margin = costPrice > 0 ? (profit / sellingPrice) * 100 : 0;

        return {
          productId: product._id,
          name: product.name,
          category: product.category,
          brand: product.brand,
          supplier: product.supplier,
          costPrice,
          sellingPrice,
          profit,
          margin: parseFloat(margin.toFixed(2))
        };
      });

      // Group by category
      interface CategoryMargin {
        category: string;
        totalProducts: number;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
        averageMargin: number;
      }

      const categoryMargins = productMargins.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = {
            category: product.category,
            totalProducts: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            averageMargin: 0
          };
        }

        acc[product.category].totalProducts += 1;
        acc[product.category].totalRevenue += product.sellingPrice;
        acc[product.category].totalCost += product.costPrice;
        acc[product.category].totalProfit += product.profit;

        return acc;
      }, {} as Record<string, CategoryMargin>);

      // Calculate average margins for categories
      Object.values(categoryMargins).forEach((cat: CategoryMargin) => {
        cat.averageMargin = cat.totalRevenue > 0 ? parseFloat(((cat.totalProfit / cat.totalRevenue) * 100).toFixed(2)) : 0;
      });

      return NextResponse.json({
        success: true,
        data: {
          productMargins,
          categoryMargins: Object.values(categoryMargins)
        }
      });

    } else if (reportType === 'monthly-summary') {
      // Get monthly financial summaries
      let groupBy;
      switch (period) {
        case 'month':
          groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
          break;
        case 'quarter':
          groupBy = {
            $concat: [
              { $dateToString: { format: '%Y', date: '$createdAt' } },
              '-Q',
              { $toString: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } } }
            ]
          };
          break;
        case 'year':
          groupBy = { $dateToString: { format: '%Y', date: '$createdAt' } };
          break;
        default:
          groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      }

      const monthlyData = await Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $exists: true }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        {
          $unwind: '$items'
        },
        {
          $unwind: '$productDetails'
        },
        {
          $group: {
            _id: groupBy,
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            cost: { $sum: { $multiply: ['$productDetails.costPrice', '$items.quantity'] } },
            orders: { $addToSet: '$_id' }
          }
        },
        {
          $project: {
            period: '$_id',
            revenue: 1,
            cost: 1,
            orderCount: { $size: '$orders' },
            profit: { $subtract: ['$revenue', '$cost'] },
            margin: {
              $cond: {
                if: { $gt: ['$revenue', 0] },
                then: { $multiply: [{ $divide: [{ $subtract: ['$revenue', '$cost'] }, '$revenue'] }, 100] },
                else: 0
              }
            }
          }
        },
        {
          $sort: { period: 1 }
        },
        {
          $limit: limit
        }
      ]);

      return NextResponse.json({
        success: true,
        data: monthlyData,
        period
      });

    } else if (reportType === 'export-data') {
      // Get comprehensive data for export
      const products = await Product.find({}).select('name category price costPrice brand supplier stock');
      const orders = await Order.find({ paymentStatus: 'paid' })
        .populate('user', 'name email')
        .select('items totalAmount status createdAt')
        .sort({ createdAt: -1 })
        .limit(1000); // Limit for export

      const exportData = {
        products: products.map(p => ({
          name: p.name,
          category: p.category,
          brand: p.brand,
          supplier: p.supplier,
          costPrice: p.costPrice || 0,
          sellingPrice: p.price,
          profit: p.price - (p.costPrice || 0),
          margin: p.costPrice ? (((p.price - p.costPrice) / p.price) * 100).toFixed(2) : '0',
          stock: p.stock
        })),
        orders: orders.map(o => ({
          orderId: o._id,
          customerName: o.user.name,
          customerEmail: o.user.email,
          totalAmount: o.totalAmount,
          status: o.status,
          date: o.createdAt.toISOString().split('T')[0],
          items: o.items.length
        }))
      };

      return NextResponse.json({
        success: true,
        data: exportData
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid report type'
    }, { status: 400 });

  } catch (error) {
    console.error('Financial reports error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate financial reports' },
      { status: 500 }
    );
  }
}