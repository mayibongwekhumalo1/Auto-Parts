"use client";

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { TrendingUp, Users, ShoppingCart, DollarSign, AlertTriangle, Package } from 'lucide-react';

interface DashboardData {
  revenue: {
    today: number;
    week: number;
    month: number;
    growth: number;
  };
  orders: {
    pending: number;
    completed: number;
    total: number;
  };
  users: {
    online: number;
    total: number;
    newToday: number;
  };
  inventory: {
    lowStock: number;
    outOfStock: number;
    totalProducts: number;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
}

interface RealtimeDashboardProps {
  className?: string;
}

export default function RealtimeDashboard({ className = "" }: RealtimeDashboardProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Connected to dashboard socket');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from dashboard socket');
      setConnected(false);
    });

    socketInstance.on('dashboard-update', (newData: DashboardData) => {
      setData(newData);
      setLastUpdate(new Date());
    });

    // Request initial data
    socketInstance.emit('join-dashboard');

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (!data) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Connecting...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 p-6 rounded-lg animate-pulse">
              <div className="h-4 bg-zinc-800 rounded mb-2"></div>
              <div className="h-8 bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Real-time Dashboard</h2>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${connected ? 'text-green-500' : 'text-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{connected ? 'Live' : 'Offline'}</span>
          </div>
          <span className="text-xs text-gray-400">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Today's Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.revenue.today)}</p>
              <p className={`text-sm ${data.revenue.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.revenue.growth >= 0 ? '+' : ''}{data.revenue.growth.toFixed(1)}% from yesterday
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Orders</p>
              <p className="text-2xl font-bold text-white">{formatNumber(data.orders.pending)}</p>
              <p className="text-sm text-gray-400">
                {data.orders.completed} completed today
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Online Users</p>
              <p className="text-2xl font-bold text-white">{formatNumber(data.users.online)}</p>
              <p className="text-sm text-gray-400">
                {data.users.newToday} new today
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Inventory Alerts</p>
              <p className="text-2xl font-bold text-white">{data.inventory.lowStock + data.inventory.outOfStock}</p>
              <p className="text-sm text-gray-400">
                {data.inventory.totalProducts} total products
              </p>
            </div>
            <Package className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {data.alerts.length > 0 && (
        <div className="bg-zinc-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Recent Alerts
          </h3>
          <div className="space-y-3">
            {data.alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded border-l-4 ${
                  alert.type === 'error'
                    ? 'border-red-500 bg-red-900/20'
                    : alert.type === 'warning'
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : 'border-blue-500 bg-blue-900/20'
                }`}
              >
                <p className="text-sm text-white">{alert.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-zinc-900 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-3 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors">
            View Low Stock
          </button>
          <button className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors">
            Process Orders
          </button>
          <button className="p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors">
            Generate Report
          </button>
          <button className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors">
            Send Newsletter
          </button>
        </div>
      </div>
    </div>
  );
}