import { NextRequest } from 'next/server';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import connectToDatabase from '../../../utils/database';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import User from '../../../models/User';

export async function GET(request: NextRequest) {
  // Socket.IO is disabled for Vercel deployment
  // Vercel doesn't support WebSocket connections in serverless functions
  return new Response('Socket.IO disabled for Vercel deployment', { status: 200 });
}

// Socket.IO server setup (this would typically be in server.js or custom server)
// @ts-expect-error - This function is not used in Next.js API routes but kept for reference
export const initSocketServer = (server: NetServer) => {
  const io = new ServerIO(server, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join dashboard room for real-time updates
    socket.on('join-dashboard', async () => {
      socket.join('dashboard');

      // Send initial dashboard data
      const dashboardData = await getDashboardData();
      socket.emit('dashboard-update', dashboardData);

      // Set up periodic updates
      const updateInterval = setInterval(async () => {
        const updatedData = await getDashboardData();
        socket.emit('dashboard-update', updatedData);
      }, 30000); // Update every 30 seconds

      socket.on('disconnect', () => {
        clearInterval(updateInterval);
        console.log('Client disconnected:', socket.id);
      });
    });

    // Handle real-time inventory updates
    socket.on('inventory-update', async (data) => {
      try {
        await connectToDatabase();

        if (data.productId && data.stock !== undefined) {
          await Product.findByIdAndUpdate(data.productId, { stock: data.stock });

          // Broadcast inventory update to all dashboard clients
          const updatedData = await getDashboardData();
          io.to('dashboard').emit('dashboard-update', updatedData);

          // Notify about low stock alerts
          if (data.stock <= 5) {
            io.to('dashboard').emit('alert', {
              type: 'warning',
              message: `Low stock alert: Product ${data.productId} has only ${data.stock} items remaining`,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Inventory update error:', error);
      }
    });

    // Handle order status updates
    socket.on('order-update', async (data) => {
      try {
        await connectToDatabase();

        if (data.orderId && data.status) {
          await Order.findByIdAndUpdate(data.orderId, {
            status: data.status,
            updatedAt: new Date()
          });

          // Broadcast order update
          const updatedData = await getDashboardData();
          io.to('dashboard').emit('dashboard-update', updatedData);

          // Notify relevant clients
          socket.emit('order-status-changed', {
            orderId: data.orderId,
            status: data.status,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Order update error:', error);
      }
    });

    // Handle user activity tracking
    socket.on('user-activity', (data) => {
      // Track user activity for analytics
      socket.broadcast.emit('user-activity-update', {
        userId: data.userId,
        action: data.action,
        timestamp: new Date().toISOString()
      });
    });
  });

  return io;
};

async function getDashboardData() {
  try {
    await connectToDatabase();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Revenue calculations
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Weekly revenue
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekOrders = await Order.find({
      createdAt: { $gte: weekStart },
      status: 'completed'
    });
    const weekRevenue = weekOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Monthly revenue
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthOrders = await Order.find({
      createdAt: { $gte: monthStart },
      status: 'completed'
    });
    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate growth (comparing to yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

    const yesterdayOrders = await Order.find({
      createdAt: { $gte: yesterday, $lt: yesterdayEnd },
      status: 'completed'
    });
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const revenueGrowth = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    // Orders data
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({
      status: 'completed',
      createdAt: { $gte: today, $lt: tomorrow }
    });
    const totalOrders = await Order.countDocuments();

    // Users data
    const onlineUsers = 0; // This would need a separate tracking system
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Inventory data
    const lowStockProducts = await Product.countDocuments({
      stock: { $gt: 0, $lte: 10 }
    });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    const totalProducts = await Product.countDocuments();

    // Recent alerts (mock data - in real app, this would be stored)
    const alerts = [];

    if (lowStockProducts > 0) {
      alerts.push({
        id: 'low-stock-alert',
        type: 'warning',
        message: `${lowStockProducts} products are running low on stock`,
        timestamp: new Date().toISOString()
      });
    }

    if (outOfStockProducts > 0) {
      alerts.push({
        id: 'out-of-stock-alert',
        type: 'error',
        message: `${outOfStockProducts} products are out of stock`,
        timestamp: new Date().toISOString()
      });
    }

    return {
      revenue: {
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
        growth: revenueGrowth
      },
      orders: {
        pending: pendingOrders,
        completed: completedOrders,
        total: totalOrders
      },
      users: {
        online: onlineUsers,
        total: totalUsers,
        newToday: newUsersToday
      },
      inventory: {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        totalProducts: totalProducts
      },
      alerts
    };
  } catch (error) {
    console.error('Dashboard data error:', error);
    return {
      revenue: { today: 0, week: 0, month: 0, growth: 0 },
      orders: { pending: 0, completed: 0, total: 0 },
      users: { online: 0, total: 0, newToday: 0 },
      inventory: { lowStock: 0, outOfStock: 0, totalProducts: 0 },
      alerts: []
    };
  }
}