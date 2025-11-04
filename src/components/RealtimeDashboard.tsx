"use client";

import React, { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
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
  const { isConnected, dashboardData, joinDashboard } = useSocket();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Join dashboard room when component mounts
    joinDashboard();
  }, [joinDashboard]);

  useEffect(() => {
    if (dashboardData) {
      setLastUpdate(new Date());
    }
  }, [dashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (!dashboardData) {
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
          <div className={`flex items-center gap-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{isConnected ? 'Live' : 'Offline'}</span>
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
              <p className="text-2xl font-bold text-white">{formatCurrency(dashboardData.revenue.today)}</p>
              <p className={`text-sm ${dashboardData.revenue.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {dashboardData.revenue.growth >= 0 ? '+' : ''}{dashboardData.revenue.growth.toFixed(1)}% from yesterday
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Orders</p>
              <p className="text-2xl font-bold text-white">{formatNumber(dashboardData.orders.pending)}</p>
              <p className="text-sm text-gray-400">
                {dashboardData.orders.completed} completed today
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Online Users</p>
              <p className="text-2xl font-bold text-white">{formatNumber(dashboardData.users.online)}</p>
              <p className="text-sm text-gray-400">
                {dashboardData.users.newToday} new today
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Inventory Alerts</p>
              <p className="text-2xl font-bold text-white">{dashboardData.inventory.lowStock + dashboardData.inventory.outOfStock}</p>
              <p className="text-sm text-gray-400">
                {dashboardData.inventory.totalProducts} total products
              </p>
            </div>
            <Package className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {dashboardData.alerts.length > 0 && (
        <div className="bg-zinc-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Recent Alerts
          </h3>
          <div className="space-y-3">
            {dashboardData.alerts.slice(0, 5).map((alert: DashboardData['alerts'][0]) => (
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