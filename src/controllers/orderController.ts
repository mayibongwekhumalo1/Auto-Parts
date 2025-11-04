import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../utils/database';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import Stripe from 'stripe';
import { sendOrderConfirmationEmail } from '../utils/email';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(STRIPE_SECRET_KEY);

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

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);
    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);
    const { shippingAddress } = await request.json();

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Check stock availability
    for (const item of cart.items) {
      const product = item.product as { stock: number; name: string };
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(cart.totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        orderType: 'ecommerce'
      }
    });

    // Create order
    const orderItems = cart.items.map((item: { product: unknown; name: string; price: number; quantity: number }) => ({
      product: item.product,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingAddress,
      paymentIntentId: paymentIntent.id
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    await Cart.findOneAndDelete({ user: userId });

    await order.populate('items.product');

    // Send order confirmation email
    try {
      const user = await User.findById(userId);
      if (user) {
        await sendOrderConfirmationEmail({
          orderId: order._id.toString(),
          customerName: user.name,
          customerEmail: user.email,
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress,
          orderDate: order.createdAt
        });
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      order,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/:id - Update order status (Admin only)
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);
    const url = new URL(request.url);
    const orderId = url.pathname.split('/').pop();
    const { status } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Find user to check if admin
    const User = (await import('../models/User')).default;
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('items.product');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}