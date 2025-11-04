import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/database';
import Product, { IProduct } from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';

// Simple AI-powered recommendations based on collaborative filtering and content-based filtering
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const exclude = searchParams.get('exclude');
    const limit = parseInt(searchParams.get('limit') || '6');
    const type = searchParams.get('type') || 'ai_recommendations';
    const context = searchParams.get('context'); // 'cart', 'viewed', 'purchased'

    let recommendations: (IProduct & { score?: number })[] = [];
    const excludeIds = exclude ? exclude.split(',').filter(id => id) : [];

    if (type === 'ai_recommendations' && userId) {
      // Advanced AI recommendations based on user behavior
      recommendations = await getPersonalizedRecommendations(userId, excludeIds, limit, context);
    } else if (category) {
      // Category-based recommendations
      recommendations = await getCategoryRecommendations(category, excludeIds, limit);
    } else {
      // Popular/trending products
      recommendations = await getTrendingRecommendations(excludeIds, limit);
    }

    return NextResponse.json({
      success: true,
      products: recommendations
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getPersonalizedRecommendations(
  userId: string,
  excludeIds: string[],
  limit: number,
  context?: string | null
): Promise<(IProduct & { score?: number })[]> {
  try {
    // Get user's order history and preferences
    const user = await User.findById(userId);
    if (!user) return [];

    const userOrders = await Order.find({ userId }).populate('items.productId');
    const purchasedCategories = new Set<string>();
    const purchasedBrands = new Set<string>();
    const purchasedProductIds = new Set<string>();

    userOrders.forEach((order: { items: { productId?: IProduct }[] }) => {
      order.items.forEach((item: { productId?: IProduct }) => {
        if (item.productId) {
          purchasedCategories.add(item.productId.category);
          purchasedBrands.add(item.productId.brand);
          purchasedProductIds.add((item.productId._id as string).toString());
        }
      });
    });

    // Add preferred categories from user profile
    if (user.preferredCategories) {
      user.preferredCategories.forEach((cat: string) => purchasedCategories.add(cat));
    }

    // Build recommendation query
    const query: Record<string, unknown> = {
      _id: { $nin: [...excludeIds, ...Array.from(purchasedProductIds)] },
      stock: { $gt: 0 }
    };

    // Boost score for preferred categories and brands
    const recommendations = await Product.find(query)
      .limit(limit * 3) // Get more for scoring
      .lean();

    // Simple scoring algorithm
    const scoredRecommendations = recommendations.map((product) => {
      let score = 0;

      // Category match (high weight)
      if (purchasedCategories.has(product.category)) {
        score += 30;
      }

      // Brand match (medium weight)
      if (purchasedBrands.has(product.brand)) {
        score += 20;
      }

      // Featured products (small boost)
      if (product.featured) {
        score += 10;
      }

      // Sale products (small boost)
      if (product.sale) {
        score += 5;
      }

      // Price similarity (small boost for similar price ranges)
      const avgOrderValue = user.totalSpent / Math.max(user.totalOrders, 1);
      if (Math.abs(product.price - avgOrderValue) / avgOrderValue < 0.5) {
        score += 5;
      }

      return { ...product, score };
    });

    // Sort by score and return top recommendations
    return scoredRecommendations
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, limit);

  } catch (error) {
    console.error('Personalized recommendations error:', error);
    return [];
  }
}

async function getCategoryRecommendations(category: string, excludeIds: string[], limit: number): Promise<IProduct[]> {
  try {
    const recommendations = await Product.find({
      category: { $regex: category, $options: 'i' },
      _id: { $nin: excludeIds },
      stock: { $gt: 0 }
    })
    .sort({ featured: -1, 'ratings.average': -1, createdAt: -1 })
    .limit(limit)
    .lean();

    return recommendations;
  } catch (error) {
    console.error('Category recommendations error:', error);
    return [];
  }
}

async function getTrendingRecommendations(excludeIds: string[], limit: number): Promise<IProduct[]> {
  try {
    // Get products with high ratings, featured status, or recent popularity
    const recommendations = await Product.find({
      _id: { $nin: excludeIds },
      stock: { $gt: 0 }
    })
    .sort({
      featured: -1,
      sale: -1,
      createdAt: -1,
      stock: -1 // Higher stock might indicate popularity
    })
    .limit(limit)
    .lean();

    return recommendations;
  } catch (error) {
    console.error('Trending recommendations error:', error);
    return [];
  }
}

// POST endpoint to track user interactions for better recommendations
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { userId, productId, action, context } = await request.json();

    if (!userId || !productId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Here you would typically store interaction data in a separate collection
    // For now, we'll update user preferences based on interactions
    if (action === 'view' || action === 'add_to_cart' || action === 'purchase') {
      const product = await Product.findById(productId);
      if (product) {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { preferredCategories: product.category },
          $inc: { totalOrders: action === 'purchase' ? 1 : 0 }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track interaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}