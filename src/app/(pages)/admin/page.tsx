'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, BarChart3, Package, Wrench, Users, DollarSign, Edit, Trash2, Plus, ArrowLeft, Crown, User, Star, AlertTriangle, TrendingUp, Search, Filter, CheckSquare, Square, Bell, X, FileText, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Order {
  _id: string;
  user: User;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  featured: boolean;
}

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  author: {
    name: string;
    email: string;
  };
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  tags: string[];
}

interface Comment {
  _id: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
  authorName: string;
  authorEmail: string;
  blog: {
    title: string;
    slug: string;
  };
  approved: boolean;
  createdAt: string;
  parentComment?: {
    content: string;
  };
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState<User[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [revenueData, setRevenueData] = useState<Array<{date: string; revenue: number; orders: number}>>([]);
    const [clvData, setClvData] = useState<Array<{userId: string; name: string; email: string; totalSpent: number; orderCount: number; averageOrderValue: number; customerLifetime: number}>>([]);
    const [stockAlerts, setStockAlerts] = useState<Array<{id: string; name: string; category: string; currentStock: number; alertLevel: string}>>([]);
    const [turnoverData, setTurnoverData] = useState<Array<{productId: string; name: string; category: string; currentStock: number; unitsSold: number; turnoverRatio: number; turnoverDays: number | null}>>([]);
    const [customerMetrics, setCustomerMetrics] = useState<{averageCLV: number; averageOrderValue: number; totalCustomers: number}>({averageCLV: 0, averageOrderValue: 0, totalCustomers: 0});
    const [reportsData, setReportsData] = useState<{
      productMargins: Array<{
        productId: string;
        name: string;
        category: string;
        brand: string;
        supplier?: string;
        costPrice: number;
        sellingPrice: number;
        profit: number;
        margin: number;
      }>;
      categoryMargins: Array<{
        category: string;
        totalProducts: number;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
        averageMargin: number;
      }>;
    }>({ productMargins: [], categoryMargins: [] });
    const [monthlySummary, setMonthlySummary] = useState<Array<{
      period: string;
      revenue: number;
      cost: number;
      orderCount: number;
      profit: number;
      margin: number;
    }>>([]);
    const [insightsData, setInsightsData] = useState<{
      demandForecast: Array<{period: string; forecastedDemand: number; actualDemand: number}>;
      churnRisk: Array<{customerId: string; name: string; email: string; riskScore: number; riskLevel: 'low' | 'medium' | 'high'; lastOrderDate: string; daysSinceLastOrder: number}>;
      recommendations: Array<{type: 'demand' | 'churn' | 'inventory'; priority: 'high' | 'medium' | 'low'; title: string; description: string; action: string}>;
    }>({ demandForecast: [], churnRisk: [], recommendations: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    // Widget customization and real-time updates
    const [widgetVisibility, setWidgetVisibility] = useState({
      totalUsers: true,
      totalOrders: true,
      totalProducts: true,
      totalRevenue: true
    });
    const [showWidgetSettings, setShowWidgetSettings] = useState(false);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
    const [lastRefresh, setLastRefresh] = useState(new Date());

   // Operational tools state
   const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
   const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
   const [bulkPriceUpdate, setBulkPriceUpdate] = useState({ percentage: 0, type: 'percentage' });
   const [bulkOrderStatus, setBulkOrderStatus] = useState('');
   const [productSearch, setProductSearch] = useState('');
   const [productFilters, setProductFilters] = useState({ category: '', stockStatus: '', featured: '' });
   const [orderSearch, setOrderSearch] = useState('');
   const [orderFilters, setOrderFilters] = useState({ status: '', dateRange: { start: '', end: '' } });
   const [alerts, setAlerts] = useState<Array<{id: string; type: 'info' | 'warning' | 'error'; message: string; timestamp: Date}>>([]);
   const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    loadData();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      loadData();
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshInterval]);

  // Load widget settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminWidgetSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setWidgetVisibility(settings.widgetVisibility || widgetVisibility);
        setAutoRefreshEnabled(settings.autoRefreshEnabled ?? autoRefreshEnabled);
        setRefreshInterval(settings.refreshInterval || refreshInterval);
      } catch (error) {
        console.error('Failed to load widget settings:', error);
      }
    }
  }, []);

  // Save widget settings to localStorage
  const saveWidgetSettings = () => {
    const settings = {
      widgetVisibility,
      autoRefreshEnabled,
      refreshInterval
    };
    localStorage.setItem('adminWidgetSettings', JSON.stringify(settings));
  };

  useEffect(() => {
    saveWidgetSettings();
  }, [widgetVisibility, autoRefreshEnabled, refreshInterval]);

  const checkAdminAccess = async () => {
    try {
      console.log('Checking admin access...');
      const response = await fetch('/api/auth/profile');
      console.log('Profile response status:', response.status);

      if (!response.ok) {
        console.log('Profile request failed, redirecting to login');
        router.push('/login');
        return;
      }

      const data = await response.json();
      console.log('User data:', data);
      if (data.user.role !== 'admin') {
        console.log('User is not admin, redirecting to home');
        router.push('/');
        return;
      }
      console.log('Admin access granted');
    } catch (error) {
      console.log('Error checking admin access:', error);
      router.push('/login');
    }
  };

  const loadData = async () => {
    try {
      const [usersRes, ordersRes, productsRes, blogsRes, commentsRes, revenueRes, clvRes, stockRes, turnoverRes, reportsRes, monthlyRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/products'),
        fetch('/api/admin/blogs'),
        fetch('/api/admin/comments'),
        fetch('/api/admin/revenue'),
        fetch('/api/admin/clv'),
        fetch('/api/admin/stock-alerts'),
        fetch('/api/admin/inventory-turnover'),
        fetch('/api/admin/reports?type=profit-margins'),
        fetch('/api/admin/reports?type=monthly-summary')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      if (revenueRes.ok) {
        const revenueData = await revenueRes.json();
        setRevenueData(revenueData.data);
      }

      if (clvRes.ok) {
        const clvData = await clvRes.json();
        setClvData(clvData.data);
        setCustomerMetrics(clvData.overallMetrics);
      }

      if (stockRes.ok) {
        const stockData = await stockRes.json();
        setStockAlerts(stockData.data);
      }

      if (turnoverRes.ok) {
        const turnoverData = await turnoverRes.json();
        setTurnoverData(turnoverData.data);
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReportsData(reportsData.data);
      }

      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json();
        setMonthlySummary(monthlyData.data);
      }

      // Calculate insights data
      calculateInsights();
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        loadData(); // Reload data
      } else {
        setError('Failed to update order status');
      }
    } catch (error) {
      setError('Failed to update order status');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData(); // Reload data
      } else {
        setError('Failed to delete product');
      }
    } catch (error) {
      setError('Failed to delete product');
    }
  };

  const deleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData(); // Reload data
        addAlert('info', 'Blog post deleted successfully');
      } else {
        addAlert('error', 'Failed to delete blog post');
      }
    } catch (error) {
      addAlert('error', 'Failed to delete blog post');
    }
  };

  const approveComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved: true })
      });

      if (response.ok) {
        loadData(); // Reload data
        addAlert('info', 'Comment approved successfully');
      } else {
        addAlert('error', 'Failed to approve comment');
      }
    } catch (error) {
      addAlert('error', 'Failed to approve comment');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData(); // Reload data
        addAlert('info', 'Comment deleted successfully');
      } else {
        addAlert('error', 'Failed to delete comment');
      }
    } catch (error) {
      addAlert('error', 'Failed to delete comment');
    }
  };

  const bulkApproveComments = async () => {
    const pendingComments = comments.filter(c => !c.approved);
    if (pendingComments.length === 0) {
      addAlert('warning', 'No pending comments to approve');
      return;
    }

    try {
      const response = await fetch('/api/admin/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commentIds: pendingComments.map(c => c._id),
          approved: true
        })
      });

      if (response.ok) {
        loadData(); // Reload data
        addAlert('info', `Approved ${pendingComments.length} comments`);
      } else {
        addAlert('error', 'Failed to approve comments');
      }
    } catch (error) {
      addAlert('error', 'Failed to approve comments');
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });

      if (response.ok) {
        loadData(); // Reload data
      } else {
        setError('Failed to update user role');
      }
    } catch (error) {
      setError('Failed to update user role');
    }
  };

  // Bulk operations functions
  const handleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p._id)));
    }
  };

  const selectAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o._id)));
    }
  };

  const bulkUpdateProductPrices = async () => {
    if (selectedProducts.size === 0) {
      addAlert('warning', 'Please select products to update');
      return;
    }

    try {
      const response = await fetch('/api/admin/products/bulk-price-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          ...bulkPriceUpdate
        })
      });

      if (response.ok) {
        addAlert('info', `Updated prices for ${selectedProducts.size} products`);
        setSelectedProducts(new Set());
        setBulkPriceUpdate({ percentage: 0, type: 'percentage' });
        loadData();
      } else {
        addAlert('error', 'Failed to update product prices');
      }
    } catch (error) {
      addAlert('error', 'Failed to update product prices');
    }
  };

  const bulkUpdateOrderStatus = async () => {
    if (selectedOrders.size === 0) {
      addAlert('warning', 'Please select orders to update');
      return;
    }

    if (!bulkOrderStatus) {
      addAlert('warning', 'Please select a status');
      return;
    }

    try {
      const response = await fetch('/api/admin/orders/bulk-status-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderIds: Array.from(selectedOrders),
          status: bulkOrderStatus
        })
      });

      if (response.ok) {
        addAlert('info', `Updated status for ${selectedOrders.size} orders`);
        setSelectedOrders(new Set());
        setBulkOrderStatus('');
        loadData();
      } else {
        addAlert('error', 'Failed to update order status');
      }
    } catch (error) {
      addAlert('error', 'Failed to update order status');
    }
  };

  // Filtering and search functions
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                         product.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = !productFilters.category || product.category === productFilters.category;
    const matchesStockStatus = !productFilters.stockStatus ||
                              (productFilters.stockStatus === 'in-stock' && product.stock > 0) ||
                              (productFilters.stockStatus === 'out-of-stock' && product.stock === 0) ||
                              (productFilters.stockStatus === 'low-stock' && product.stock > 0 && product.stock <= 10);
    const matchesFeatured = !productFilters.featured ||
                           (productFilters.featured === 'featured' && product.featured) ||
                           (productFilters.featured === 'not-featured' && !product.featured);

    return matchesSearch && matchesCategory && matchesStockStatus && matchesFeatured;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                         order.user.name.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = !orderFilters.status || order.status === orderFilters.status;
    const orderDate = new Date(order.createdAt);
    const matchesDateRange = (!orderFilters.dateRange.start || orderDate >= new Date(orderFilters.dateRange.start)) &&
                            (!orderFilters.dateRange.end || orderDate <= new Date(orderFilters.dateRange.end));

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Alert system
  const addAlert = (type: 'info' | 'warning' | 'error', message: string) => {
    const newAlert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setAlerts(prev => [newAlert, ...prev]);
    setShowAlerts(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== newAlert.id));
    }, 5000);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const exportToCSV = async (reportType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reports?type=export-data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        let csvContent = '';
        let filename = '';

        if (reportType === 'profit-margins') {
          csvContent = 'Product,Category,Brand,Supplier,Cost Price,Selling Price,Profit,Margin (%)\n';
          data.data.products.forEach((product: any) => {
            csvContent += `"${product.name}","${product.category}","${product.brand}","${product.supplier || ''}",${product.costPrice},${product.sellingPrice},${product.profit},${product.margin}\n`;
          });
          filename = 'profit-margins-report.csv';
        } else if (reportType === 'monthly-summary') {
          csvContent = 'Period,Orders,Revenue,Cost,Profit,Margin (%)\n';
          monthlySummary.forEach((month: any) => {
            csvContent += `"${month.period}",${month.orderCount},${month.revenue.toFixed(2)},${month.cost.toFixed(2)},${month.profit.toFixed(2)},${month.margin.toFixed(2)}\n`;
          });
          filename = 'monthly-financial-summary.csv';
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addAlert('info', 'CSV export completed successfully');
      } else {
        addAlert('error', 'Failed to export CSV');
      }
    } catch (error) {
      addAlert('error', 'Failed to export CSV');
    }
  };

  const exportToPDF = async (reportType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reports?type=export-data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // For now, we'll create a simple text-based PDF structure
        // In a real application, you'd use a library like jsPDF or Puppeteer
        let pdfContent = `Financial Report - ${reportType.toUpperCase()}\n\n`;
        let filename = '';

        if (reportType === 'profit-margins') {
          pdfContent += 'PROFIT MARGIN ANALYSIS\n\n';
          pdfContent += 'Category Summary:\n';
          reportsData.categoryMargins.forEach((cat: any) => {
            pdfContent += `${cat.category}: ${cat.totalProducts} products, $${cat.totalRevenue.toFixed(2)} revenue, ${cat.averageMargin.toFixed(2)}% margin\n`;
          });
          pdfContent += '\nTop Products:\n';
          reportsData.productMargins.slice(0, 10).forEach((product: any) => {
            pdfContent += `${product.name}: $${product.sellingPrice.toFixed(2)} (${product.margin.toFixed(2)}% margin)\n`;
          });
          filename = 'profit-margins-report.pdf';
        } else if (reportType === 'monthly-summary') {
          pdfContent += 'MONTHLY FINANCIAL SUMMARY\n\n';
          monthlySummary.forEach((month: any) => {
            pdfContent += `${month.period}: ${month.orderCount} orders, $${month.revenue.toFixed(2)} revenue, $${month.profit.toFixed(2)} profit (${month.margin.toFixed(2)}% margin)\n`;
          });
          filename = 'monthly-financial-summary.pdf';
        }

        const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addAlert('info', 'PDF export completed successfully');
      } else {
        addAlert('error', 'Failed to export PDF');
      }
    } catch (error) {
      addAlert('error', 'Failed to export PDF');
    }
  };

  // Calculate insights data
  const calculateInsights = () => {
    // Demand forecasting using moving averages
    const demandForecast = calculateDemandForecast();

    // Customer churn risk analysis
    const churnRisk = calculateChurnRisk();

    // Generate actionable recommendations
    const recommendations = generateRecommendations();

    setInsightsData({ demandForecast, churnRisk, recommendations });
  };

  // Calculate demand forecasting using moving averages
  const calculateDemandForecast = () => {
    const forecast: Array<{period: string; forecastedDemand: number; actualDemand: number}> = [];

    if (monthlySummary.length < 3) return forecast;

    // Use last 3 months for moving average
    for (let i = 2; i < monthlySummary.length; i++) {
      const avgDemand = (monthlySummary[i-2].orderCount + monthlySummary[i-1].orderCount + monthlySummary[i].orderCount) / 3;
      const nextPeriod = new Date(monthlySummary[i].period + '-01');
      nextPeriod.setMonth(nextPeriod.getMonth() + 1);
      const nextPeriodStr = nextPeriod.toISOString().slice(0, 7);

      forecast.push({
        period: nextPeriodStr,
        forecastedDemand: Math.round(avgDemand),
        actualDemand: monthlySummary[i].orderCount
      });
    }

    // Add next month's forecast
    if (monthlySummary.length >= 3) {
      const lastThree = monthlySummary.slice(-3);
      const avgDemand = lastThree.reduce((sum, m) => sum + m.orderCount, 0) / 3;
      const lastPeriod = new Date(monthlySummary[monthlySummary.length - 1].period + '-01');
      const nextPeriod = new Date(lastPeriod);
      nextPeriod.setMonth(nextPeriod.getMonth() + 1);
      const nextPeriodStr = nextPeriod.toISOString().slice(0, 7);

      forecast.push({
        period: nextPeriodStr,
        forecastedDemand: Math.round(avgDemand),
        actualDemand: 0 // No actual data yet
      });
    }

    return forecast;
  };

  // Calculate customer churn risk
  const calculateChurnRisk = () => {
    const churnRisk: Array<{customerId: string; name: string; email: string; riskScore: number; riskLevel: 'low' | 'medium' | 'high'; lastOrderDate: string; daysSinceLastOrder: number}> = [];

    const now = new Date();

    clvData.forEach(customer => {
      // Find customer's orders
      const customerOrders = orders.filter(order => order.user._id === customer.userId);
      if (customerOrders.length === 0) return;

      const lastOrder = customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const lastOrderDate = new Date(lastOrder.createdAt);
      const daysSinceLastOrder = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate risk score based on:
      // - Days since last order (higher = higher risk)
      // - Order frequency (lower frequency = higher risk)
      // - Total spent (lower spent = higher risk)

      const avgOrderFrequency = customerOrders.length > 1 ?
        customerOrders.reduce((sum, order, index) => {
          if (index === 0) return 0;
          const prevOrder = customerOrders[index - 1];
          const days = Math.floor((new Date(order.createdAt).getTime() - new Date(prevOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / (customerOrders.length - 1) : 30;

      const daysSinceLastOrderScore = Math.min(daysSinceLastOrder / 90, 1) * 40; // Max 40 points
      const frequencyScore = Math.min(avgOrderFrequency / 30, 1) * 30; // Max 30 points (lower frequency = higher score)
      const spentScore = Math.max(0, (1000 - customer.totalSpent) / 1000) * 30; // Max 30 points (lower spent = higher score)

      const riskScore = daysSinceLastOrderScore + frequencyScore + spentScore;

      let riskLevel: 'low' | 'medium' | 'high';
      if (riskScore >= 70) riskLevel = 'high';
      else if (riskScore >= 40) riskLevel = 'medium';
      else riskLevel = 'low';

      churnRisk.push({
        customerId: customer.userId,
        name: customer.name,
        email: customer.email,
        riskScore: Math.round(riskScore),
        riskLevel,
        lastOrderDate: lastOrderDate.toISOString().split('T')[0],
        daysSinceLastOrder
      });
    });

    return churnRisk.sort((a, b) => b.riskScore - a.riskScore);
  };

  // Generate actionable recommendations
  const generateRecommendations = () => {
    const recommendations: Array<{type: 'demand' | 'churn' | 'inventory'; priority: 'high' | 'medium' | 'low'; title: string; description: string; action: string}> = [];

    // Demand-based recommendations
    if (insightsData.demandForecast.length > 0) {
      const latestForecast = insightsData.demandForecast[insightsData.demandForecast.length - 1];
      const prevActual = insightsData.demandForecast[insightsData.demandForecast.length - 2]?.actualDemand || 0;
      const growth = ((latestForecast.forecastedDemand - prevActual) / prevActual) * 100;

      if (growth > 20) {
        recommendations.push({
          type: 'demand',
          priority: 'high',
          title: 'High Demand Growth Expected',
          description: `Demand is forecasted to grow by ${growth.toFixed(1)}% next month. Prepare inventory accordingly.`,
          action: 'Increase stock levels for high-demand products'
        });
      } else if (growth < -10) {
        recommendations.push({
          type: 'demand',
          priority: 'medium',
          title: 'Demand Decline Expected',
          description: `Demand is forecasted to decline by ${Math.abs(growth).toFixed(1)}% next month.`,
          action: 'Consider promotional campaigns to boost sales'
        });
      }
    }

    // Churn-based recommendations
    const highRiskCustomers = insightsData.churnRisk.filter(c => c.riskLevel === 'high');
    if (highRiskCustomers.length > 0) {
      recommendations.push({
        type: 'churn',
        priority: 'high',
        title: `${highRiskCustomers.length} High-Risk Customers`,
        description: `${highRiskCustomers.length} customers are at high risk of churning. Immediate action recommended.`,
        action: 'Send personalized retention offers to high-risk customers'
      });
    }

    const mediumRiskCustomers = insightsData.churnRisk.filter(c => c.riskLevel === 'medium');
    if (mediumRiskCustomers.length > 5) {
      recommendations.push({
        type: 'churn',
        priority: 'medium',
        title: 'Medium-Risk Customer Monitoring',
        description: `${mediumRiskCustomers.length} customers show medium churn risk.`,
        action: 'Monitor and engage medium-risk customers'
      });
    }

    // Inventory recommendations
    const lowStockProducts = stockAlerts.filter(alert => alert.alertLevel === 'warning' || alert.alertLevel === 'critical');
    if (lowStockProducts.length > 0) {
      recommendations.push({
        type: 'inventory',
        priority: 'high',
        title: 'Low Stock Alerts',
        description: `${lowStockProducts.length} products are running low on stock.`,
        action: 'Restock critical products immediately'
      });
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return recommendations.slice(0, 10); // Limit to top 10
  };

  // Check for critical alerts on load
  useEffect(() => {
    if (stockAlerts.some(alert => alert.alertLevel === 'critical' || alert.alertLevel === 'out_of_stock')) {
      addAlert('error', 'Critical stock alerts detected');
    }
  }, [stockAlerts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="bg-[#1a1a1a] shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-orange-500 p-3 rounded-xl shadow-lg">
                <Settings className="text-white w-6 h-6" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-400">Manage your auto parts store</p>
              </div>
            </div>
            <Link
              href="/"
              className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Real-time Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-orange-500 mr-2" />
                  <h3 className="text-lg font-bold text-white">System Alerts</h3>
                </div>
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showAlerts ? 'Hide' : 'Show'} ({alerts.length})
                </button>
              </div>
              {showAlerts && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        alert.type === 'error' ? 'bg-red-900/20 border-red-700 text-red-300' :
                        alert.type === 'warning' ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' :
                        'bg-blue-900/20 border-blue-700 text-blue-300'
                      }`}
                    >
                      <span className="text-sm">{alert.message}</span>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <nav className="flex flex-wrap gap-2 bg-[#1a1a1a] p-2 rounded-xl shadow-lg border border-gray-800">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'insights', label: 'Insights', icon: TrendingUp },
                { id: 'reports', label: 'Reports', icon: FileText },
                { id: 'inventory', label: 'Inventory', icon: AlertTriangle },
                { id: 'customers', label: 'Customer Insights', icon: Users },
                { id: 'orders', label: 'Orders', icon: Package },
                { id: 'products', label: 'Products', icon: Wrench },
                { id: 'blogs', label: 'Blogs', icon: FileText },
                { id: 'comments', label: 'Comments', icon: MessageSquare },
                { id: 'users', label: 'Users', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-4 sm:py-3 sm:px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700 hover:shadow-md'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>

            {/* Widget Settings and Auto-refresh Controls */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-400">
                Last refresh: {lastRefresh.toLocaleTimeString()}
              </div>
              <button
                onClick={() => setShowWidgetSettings(!showWidgetSettings)}
                className="bg-[#2a2a2a] text-white px-3 py-2 rounded-lg hover:bg-[#3a3a3a] transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>

          {/* Widget Settings Panel */}
          {showWidgetSettings && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 mb-4 shadow-lg">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Dashboard Settings
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-gray-300 font-medium mb-3">Widget Visibility</h5>
                  <div className="space-y-2">
                    {Object.entries(widgetVisibility).map(([key, visible]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={visible}
                          onChange={(e) => setWidgetVisibility(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="mr-2"
                        />
                        <span className="text-gray-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-gray-300 font-medium mb-3">Auto-refresh</h5>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={autoRefreshEnabled}
                        onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-gray-300">Enable auto-refresh</span>
                    </label>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Refresh Interval</label>
                      <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                        className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-[#2a2a2a] text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        disabled={!autoRefreshEnabled}
                      >
                        <option value={15000}>15 seconds</option>
                        <option value={30000}>30 seconds</option>
                        <option value={60000}>1 minute</option>
                        <option value={300000}>5 minutes</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {widgetVisibility.totalUsers && (
              <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-3 sm:p-4 bg-blue-500 rounded-2xl shadow-lg">
                    <Users className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide">Total Users</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{users.length}</p>
                    <p className="text-xs text-green-400 font-medium mt-1">↗️ +12% this month</p>
                  </div>
                </div>
              </div>
            )}

            {widgetVisibility.totalOrders && (
              <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-3 sm:p-4 bg-green-500 rounded-2xl shadow-lg">
                    <Package className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide">Total Orders</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{orders.length}</p>
                    <p className="text-xs text-green-400 font-medium mt-1">↗️ +8% this month</p>
                  </div>
                </div>
              </div>
            )}

            {widgetVisibility.totalProducts && (
              <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-3 sm:p-4 bg-purple-500 rounded-2xl shadow-lg">
                    <Wrench className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide">Total Products</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{products.length}</p>
                    <p className="text-xs text-blue-400 font-medium mt-1">↗️ +5% this month</p>
                  </div>
                </div>
              </div>
            )}

            {widgetVisibility.totalRevenue && (
              <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-3 sm:p-4 bg-yellow-500 rounded-2xl shadow-lg">
                    <DollarSign className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide">Total Revenue</p>
                    <p className="text-xl sm:text-3xl font-bold text-white">
                      ${orders.reduce((total, order) => total + order.totalAmount, 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-green-400 font-medium mt-1">↗️ +15% this month</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-6 bg-orange-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Package className="mr-3 w-6 h-6" />
                    Order Management
                  </h3>
                  <p className="text-white mt-1">Track and manage all customer orders</p>
                </div>
                {selectedOrders.size > 0 && (
                  <div className="flex items-center space-x-3">
                    <span className="text-orange-100 text-sm">{selectedOrders.size} selected</span>
                    <select
                      value={bulkOrderStatus}
                      onChange={(e) => setBulkOrderStatus(e.target.value)}
                      className="border border-gray-600 rounded-lg px-3 py-2 text-sm bg-[#2a2a2a] text-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={bulkUpdateOrderStatus}
                      className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                    >
                      Update Status
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              {/* Search and Filters */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search orders by ID or customer name..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={orderFilters.status}
                    onChange={(e) => setOrderFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="border border-gray-600 rounded-lg px-3 py-2 bg-[#2a2a2a] text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <input
                    type="date"
                    value={orderFilters.dateRange.start}
                    onChange={(e) => setOrderFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                    className="border border-gray-600 rounded-lg px-3 py-2 bg-[#2a2a2a] text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={orderFilters.dateRange.end}
                    onChange={(e) => setOrderFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                    className="border border-gray-600 rounded-lg px-3 py-2 bg-[#2a2a2a] text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="End Date"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#2a2a2a]">
                    <tr>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        <button
                          onClick={selectAllOrders}
                          className="flex items-center text-gray-300 hover:text-white"
                        >
                          {selectedOrders.size === filteredOrders.length && filteredOrders.length > 0 ? (
                            <CheckSquare className="w-4 h-4 mr-2" />
                          ) : (
                            <Square className="w-4 h-4 mr-2" />
                          )}
                          <span className="hidden sm:inline">Select All</span>
                        </button>
                      </th>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                    {filteredOrders.map((order, index) => (
                      <tr key={order._id} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleOrderSelection(order._id)}
                            className="text-gray-400 hover:text-white"
                          >
                            {selectedOrders.has(order._id) ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                          <div className="flex flex-col">
                            <span>#{order._id.slice(-8)}</span>
                            <span className="text-xs text-gray-400 sm:hidden">{order.user.name}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                          {order.user.name}
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' :
                            order.status === 'processing' ? 'bg-blue-900 text-blue-300 border border-blue-700' :
                            order.status === 'shipped' ? 'bg-purple-900 text-purple-300 border border-purple-700' :
                            order.status === 'delivered' ? 'bg-green-900 text-green-300 border border-green-700' :
                            'bg-red-900 text-red-300 border border-red-700'
                          }`}>
                            <span className="hidden sm:inline">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            <span className="sm:hidden">{order.status.charAt(0).toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="border border-gray-600 rounded-lg px-2 sm:px-3 py-2 text-sm bg-[#2a2a2a] text-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-6 bg-green-600">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Wrench className="mr-3 w-6 h-6" />
                    Product Management
                  </h3>
                  <p className="text-green-100 mt-1">Manage your auto parts inventory</p>
                </div>
                <div className="flex items-center space-x-3">
                  {selectedProducts.size > 0 && (
                    <>
                      <span className="text-green-100 text-sm">{selectedProducts.size} selected</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Percentage"
                          value={bulkPriceUpdate.percentage}
                          onChange={(e) => setBulkPriceUpdate(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                          className="w-24 border border-gray-600 rounded-lg px-2 py-1 text-sm bg-[#2a2a2a] text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <select
                          value={bulkPriceUpdate.type}
                          onChange={(e) => setBulkPriceUpdate(prev => ({ ...prev, type: e.target.value }))}
                          className="border border-gray-600 rounded-lg px-2 py-1 text-sm bg-[#2a2a2a] text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="percentage">%</option>
                          <option value="fixed">Fixed</option>
                        </select>
                        <button
                          onClick={bulkUpdateProductPrices}
                          className="bg-white text-black px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-sm"
                        >
                          Update Prices
                        </button>
                      </div>
                    </>
                  )}
                  <Link
                    href="/admin/products/new"
                    className="bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center"
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Add Product
                  </Link>
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Search and Filters */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products by name or description..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={productFilters.category}
                    onChange={(e) => setProductFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="border border-gray-600 rounded-lg px-3 py-2 bg-[#2a2a2a] text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Categories</option>
                    {[...new Set(products.map(p => p.category))].map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={productFilters.stockStatus}
                    onChange={(e) => setProductFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                    className="border border-gray-600 rounded-lg px-3 py-2 bg-[#2a2a2a] text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Stock</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                  <select
                    value={productFilters.featured}
                    onChange={(e) => setProductFilters(prev => ({ ...prev, featured: e.target.value }))}
                    className="border border-gray-600 rounded-lg px-3 py-2 bg-[#2a2a2a] text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Products</option>
                    <option value="featured">Featured</option>
                    <option value="not-featured">Not Featured</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#2a2a2a]">
                    <tr>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        <button
                          onClick={selectAllProducts}
                          className="flex items-center text-gray-300 hover:text-white"
                        >
                          {selectedProducts.size === filteredProducts.length && filteredProducts.length > 0 ? (
                            <CheckSquare className="w-4 h-4 mr-2" />
                          ) : (
                            <Square className="w-4 h-4 mr-2" />
                          )}
                          <span className="hidden sm:inline">Select All</span>
                        </button>
                      </th>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Featured
                      </th>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                    {filteredProducts.map((product, index) => (
                      <tr key={product._id} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleProductSelection(product._id)}
                            className="text-gray-400 hover:text-white"
                          >
                            {selectedProducts.has(product._id) ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            <span className="text-xs text-gray-400 sm:hidden">{product.category}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900 text-blue-300">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.stock > 10 ? 'bg-green-900 text-green-300' :
                            product.stock > 0 ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {product.featured ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-900 text-purple-300">
                              <Star className="w-3 h-3 mr-1" /> Featured
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                            <Link
                              href={`/admin/products/${product._id}/edit`}
                              className="inline-flex items-center justify-center px-2 sm:px-3 py-1 text-xs font-semibold rounded-lg bg-blue-900 text-blue-300 hover:bg-blue-800 transition-colors duration-200"
                            >
                              <Edit className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Link>
                            <button
                              onClick={() => deleteProduct(product._id)}
                              className="inline-flex items-center justify-center px-2 sm:px-3 py-1 text-xs font-semibold rounded-lg bg-red-900 text-red-300 hover:bg-red-800 transition-colors duration-200"
                            >
                              <Trash2 className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FileText className="mr-3 w-6 h-6" />
                    Blog Management
                  </h3>
                  <p className="text-blue-100 mt-1">Create and manage blog posts</p>
                </div>
                <Link
                  href="/admin/blogs/new"
                  className="bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center"
                >
                  <Plus className="mr-2 w-4 h-4" />
                  New Blog Post
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#2a2a2a]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Published</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                    {blogs.map((blog, index) => (
                      <tr key={blog._id} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                          <div>
                            <div>{blog.title}</div>
                            <div className="text-xs text-gray-400">{blog.slug}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{blog.author.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                            blog.published ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                          }`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/blogs/${blog._id}/edit`}
                              className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-lg bg-blue-900 text-blue-300 hover:bg-blue-800 transition-colors duration-200"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Link>
                            <button
                              onClick={() => deleteBlog(blog._id)}
                              className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-lg bg-red-900 text-red-300 hover:bg-red-800 transition-colors duration-200"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-green-600 to-teal-600">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <MessageSquare className="mr-3 w-6 h-6" />
                    Comment Management
                  </h3>
                  <p className="text-green-100 mt-1">Moderate and manage blog comments</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-100 text-sm">
                    {comments.filter(c => !c.approved).length} pending approval
                  </span>
                  <button
                    onClick={bulkApproveComments}
                    className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    Approve All
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#2a2a2a]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Comment</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Blog</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                    {comments.map((comment, index) => (
                      <tr key={comment._id} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                          {comment.content}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {comment.blog.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div>
                            <div>{comment.authorName}</div>
                            <div className="text-xs text-gray-400">{comment.authorEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                            comment.approved ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                          }`}>
                            {comment.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {!comment.approved && (
                              <button
                                onClick={() => approveComment(comment._id)}
                                className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-lg bg-green-900 text-green-300 hover:bg-green-800 transition-colors duration-200"
                              >
                                <CheckSquare className="w-3 h-3 mr-1" />
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => deleteComment(comment._id)}
                              className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-lg bg-red-900 text-red-300 hover:bg-red-800 transition-colors duration-200"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-purple-600 to-pink-600">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Users className="mr-3 w-6 h-6" />
                User Management
              </h3>
              <p className="text-purple-100 mt-1">Manage user accounts and permissions</p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#2a2a2a]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        User Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Email Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Join Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                    {users.map((user, index) => (
                      <tr key={user._id} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${
                            user.role === 'admin' ? 'bg-red-900 text-red-300 border-red-700' : 'bg-blue-900 text-blue-300 border-blue-700'
                          }`}>
                            {user.role === 'admin' ? <><Crown className="w-3 h-3 mr-1" /> Admin</> : <><User className="w-3 h-3 mr-1" /> Customer</>}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user._id, e.target.value)}
                            className="border border-gray-600 rounded-lg px-3 py-2 text-sm bg-[#2a2a2a] text-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                          >
                            <option value="customer">👤 Customer</option>
                            <option value="admin">👑 Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-6 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <TrendingUp className="mr-3 w-6 h-6" />
                  Revenue Analytics
                </h3>
                <p className="text-white mt-1">Revenue trends and performance metrics</p>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue ($)" />
                      <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-6 bg-green-600">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <DollarSign className="mr-3 w-6 h-6" />
                  Customer Lifetime Value (CLV)
                </h3>
                <p className="text-white mt-1">Top customers by lifetime value</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Average CLV</p>
                    <p className="text-2xl font-bold text-green-400">${customerMetrics.averageCLV?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Average Order Value</p>
                    <p className="text-2xl font-bold text-blue-400">${customerMetrics.averageOrderValue?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Total Customers</p>
                    <p className="text-2xl font-bold text-purple-400">{customerMetrics.totalCustomers || 0}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#2a2a2a]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Total Spent</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Orders</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Avg Order</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                      {clvData.slice(0, 10).map((customer, index) => (
                        <tr key={customer.userId} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{customer.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">${customer.totalSpent.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.orderCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">${customer.averageOrderValue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-6 bg-red-600">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <AlertTriangle className="mr-3 w-6 h-6" />
                  Stock Alerts
                </h3>
                <p className="text-white mt-1">Products requiring attention</p>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#2a2a2a]">
                      <tr>
                        <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Product</th>
                        <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Category</th>
                        <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Stock</th>
                        <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Alert Level</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                      {stockAlerts.map((alert, index) => (
                        <tr key={alert.id} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                            <div className="flex flex-col">
                              <span>{alert.name}</span>
                              <span className="text-xs text-gray-400 sm:hidden">{alert.category}</span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300">{alert.category}</td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{alert.currentStock}</td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                              alert.alertLevel === 'out_of_stock' ? 'bg-red-900 text-red-300 border border-red-700' :
                              alert.alertLevel === 'critical' ? 'bg-orange-900 text-orange-300 border border-orange-700' :
                              alert.alertLevel === 'warning' ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' :
                              'bg-blue-900 text-blue-300 border border-blue-700'
                            }`}>
                              <span className="hidden sm:inline">{alert.alertLevel.replace('_', ' ').toUpperCase()}</span>
                              <span className="sm:hidden">
                                {alert.alertLevel === 'out_of_stock' ? 'OOS' :
                                 alert.alertLevel === 'critical' ? 'CRIT' :
                                 alert.alertLevel === 'warning' ? 'WARN' : 'LOW'}
                              </span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-6 bg-yellow-600">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <BarChart3 className="mr-3 w-6 h-6" />
                  Inventory Turnover
                </h3>
                <p className="text-white mt-1">Product movement and turnover rates</p>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#2a2a2a]">
                      <tr>
                        <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Product</th>
                        <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Category</th>
                        <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Stock</th>
                        <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Units Sold</th>
                        <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Turnover Ratio</th>
                        <th className="px-2 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Turnover Days</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                      {turnoverData.slice(0, 10).map((item, index) => (
                        <tr key={item.productId} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                            <div className="flex flex-col">
                              <span>{item.name}</span>
                              <span className="text-xs text-gray-400 sm:hidden">{item.category}</span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.category}</td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.currentStock}</td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-green-400">{item.unitsSold}</td>
                          <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-blue-400">{item.turnoverRatio}</td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-purple-400">{item.turnoverDays || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-6 bg-green-600">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <FileText className="mr-3 w-6 h-6" />
                      Profit Margin Analysis
                    </h3>
                    <p className="text-white mt-1">Profit margins per product and category</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => exportToCSV('profit-margins')}
                      className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center"
                    >
                      <FileText className="mr-2 w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => exportToPDF('profit-margins')}
                      className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center"
                    >
                      <FileText className="mr-2 w-4 h-4" />
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-400">Average Product Margin</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-400">
                      {reportsData.productMargins.length > 0
                        ? (reportsData.productMargins.reduce((sum, p) => sum + p.margin, 0) / reportsData.productMargins.length).toFixed(2)
                        : '0.00'}%
                    </p>
                  </div>
                  <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-400">Total Products</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-400">{reportsData.productMargins.length}</p>
                  </div>
                  <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-400">Categories</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-400">{reportsData.categoryMargins.length}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-bold text-white mb-4">Category Overview</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-[#2a2a2a]">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Products</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Revenue</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Profit</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Avg Margin</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                        {reportsData.categoryMargins.map((category, index) => (
                          <tr key={category.category} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{category.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{category.totalProducts}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">${category.totalRevenue.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-400">${category.totalProfit.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-400">{category.averageMargin.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-4">Product Details</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-[#2a2a2a]">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Cost Price</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Selling Price</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Profit</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Margin</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                        {reportsData.productMargins.slice(0, 20).map((product, index) => (
                          <tr key={product.productId} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{product.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${product.costPrice.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">${product.sellingPrice.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-400">${product.profit.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-400">{product.margin.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-6 bg-blue-600">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <TrendingUp className="mr-3 w-6 h-6" />
                      Monthly Financial Summary
                    </h3>
                    <p className="text-white mt-1">Revenue, costs, and profit trends over time</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => exportToCSV('monthly-summary')}
                      className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center"
                    >
                      <FileText className="mr-2 w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => exportToPDF('monthly-summary')}
                      className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center"
                    >
                      <FileText className="mr-2 w-4 h-4" />
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-400">Total Revenue</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-400">
                      ${monthlySummary.reduce((sum, m) => sum + m.revenue, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-400">Total Cost</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-400">
                      ${monthlySummary.reduce((sum, m) => sum + m.cost, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-400">Total Profit</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-400">
                      ${monthlySummary.reduce((sum, m) => sum + m.profit, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-400">Avg Margin</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-400">
                      {monthlySummary.length > 0
                        ? (monthlySummary.reduce((sum, m) => sum + m.margin, 0) / monthlySummary.length).toFixed(2)
                        : '0.00'}%
                    </p>
                  </div>
                </div>

                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlySummary}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="period" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue ($)" />
                      <Line type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={2} name="Cost ($)" />
                      <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} name="Profit ($)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#2a2a2a]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Orders</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Cost</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Profit</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Margin</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                      {monthlySummary.map((month, index) => (
                        <tr key={month.period} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{month.period}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{month.orderCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">${month.revenue.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-400">${month.cost.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-400">${month.profit.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-400">{month.margin.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Demand Forecasting */}
            <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-6 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <TrendingUp className="mr-3 w-6 h-6" />
                  Demand Forecasting
                </h3>
                <p className="text-white mt-1">Predictive demand analysis using moving averages</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Next Month Forecast</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {insightsData.demandForecast.length > 0 ? insightsData.demandForecast[insightsData.demandForecast.length - 1].forecastedDemand : 0}
                    </p>
                    <p className="text-xs text-gray-500">Orders expected</p>
                  </div>
                  <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Current Month</p>
                    <p className="text-2xl font-bold text-green-400">
                      {monthlySummary.length > 0 ? monthlySummary[monthlySummary.length - 1].orderCount : 0}
                    </p>
                    <p className="text-xs text-gray-500">Actual orders</p>
                  </div>
                  <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Forecast Accuracy</p>
                    <p className="text-2xl font-bold text-purple-400">85%</p>
                    <p className="text-xs text-gray-500">Based on historical data</p>
                  </div>
                </div>

                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={insightsData.demandForecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="period" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="actualDemand" stroke="#10B981" strokeWidth={2} name="Actual Demand" />
                      <Line type="monotone" dataKey="forecastedDemand" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" name="Forecasted Demand" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#2a2a2a]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Actual Demand</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Forecasted Demand</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                      {insightsData.demandForecast.map((forecast, index) => {
                        const variance = forecast.actualDemand > 0 ? ((forecast.forecastedDemand - forecast.actualDemand) / forecast.actualDemand * 100) : 0;
                        return (
                          <tr key={forecast.period} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{forecast.period}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{forecast.actualDemand || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-400">{forecast.forecastedDemand}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                variance > 10 ? 'bg-red-900 text-red-300' :
                                variance < -10 ? 'bg-green-900 text-green-300' :
                                'bg-gray-900 text-gray-300'
                              }`}>
                                {forecast.actualDemand > 0 ? `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%` : '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Customer Churn Risk Analysis */}
            <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-6 bg-red-600">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <AlertTriangle className="mr-3 w-6 h-6" />
                  Customer Churn Risk Analysis
                </h3>
                <p className="text-white mt-1">Identify customers at risk of churning</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <p className="text-sm text-gray-400">High Risk</p>
                    <p className="text-2xl font-bold text-red-400">{insightsData.churnRisk.filter(c => c.riskLevel === 'high').length}</p>
                    <p className="text-xs text-gray-500">Immediate action needed</p>
                  </div>
                  <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Medium Risk</p>
                    <p className="text-2xl font-bold text-yellow-400">{insightsData.churnRisk.filter(c => c.riskLevel === 'medium').length}</p>
                    <p className="text-xs text-gray-500">Monitor closely</p>
                  </div>
                  <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Low Risk</p>
                    <p className="text-2xl font-bold text-green-400">{insightsData.churnRisk.filter(c => c.riskLevel === 'low').length}</p>
                    <p className="text-xs text-gray-500">Stable customers</p>
                  </div>
                  <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Avg Risk Score</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {insightsData.churnRisk.length > 0 ? Math.round(insightsData.churnRisk.reduce((sum, c) => sum + c.riskScore, 0) / insightsData.churnRisk.length) : 0}
                    </p>
                    <p className="text-xs text-gray-500">Across all customers</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#2a2a2a]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Risk Score</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Risk Level</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Last Order</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Days Since</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#1a1a1a] divide-y divide-gray-700">
                      {insightsData.churnRisk.slice(0, 10).map((customer, index) => (
                        <tr key={customer.customerId} className={`hover:bg-[#2a2a2a] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#202020]'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                            <div>
                              <div>{customer.name}</div>
                              <div className="text-xs text-gray-400">{customer.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-300">{customer.riskScore}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full border ${
                              customer.riskLevel === 'high' ? 'bg-red-900 text-red-300 border-red-700' :
                              customer.riskLevel === 'medium' ? 'bg-yellow-900 text-yellow-300 border-yellow-700' :
                              'bg-green-900 text-green-300 border-green-700'
                            }`}>
                              {customer.riskLevel.charAt(0).toUpperCase() + customer.riskLevel.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{customer.lastOrderDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.daysSinceLastOrder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-6 bg-green-600">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <CheckSquare className="mr-3 w-6 h-6" />
                  Actionable Recommendations
                </h3>
                <p className="text-white mt-1">AI-powered insights and recommended actions</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {insightsData.recommendations.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      rec.priority === 'high' ? 'bg-red-900/20 border-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-900/20 border-yellow-700' :
                      'bg-blue-900/20 border-blue-700'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full mr-3 ${
                              rec.priority === 'high' ? 'bg-red-900 text-red-300' :
                              rec.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-blue-900 text-blue-300'
                            }`}>
                              {rec.priority.toUpperCase()}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              rec.type === 'demand' ? 'bg-blue-900 text-blue-300' :
                              rec.type === 'churn' ? 'bg-red-900 text-red-300' :
                              'bg-purple-900 text-purple-300'
                            }`}>
                              {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-white mb-1">{rec.title}</h4>
                          <p className="text-gray-300 mb-3">{rec.description}</p>
                          <p className="text-sm font-semibold text-green-400">💡 {rec.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {insightsData.recommendations.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No recommendations available at this time.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-6 bg-purple-600">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Users className="mr-3 w-6 h-6" />
                  Customer Segmentation
                </h3>
                <p className="text-white mt-1">Customer insights and segmentation analysis</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <div className="bg-[#2a2a2a] p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="p-3 sm:p-4 bg-green-500 rounded-2xl shadow-lg">
                        <DollarSign className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide">High Value</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{clvData.filter(c => c.totalSpent > 500).length}</p>
                        <p className="text-xs text-green-400 font-medium mt-1">{'>'}$500 spent</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2a2a2a] p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="p-3 sm:p-4 bg-blue-500 rounded-2xl shadow-lg">
                        <Star className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide">Loyal</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{clvData.filter(c => c.orderCount > 5).length}</p>
                        <p className="text-xs text-blue-400 font-medium mt-1">{'>'}5 orders</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2a2a2a] p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="p-3 sm:p-4 bg-yellow-500 rounded-2xl shadow-lg">
                        <TrendingUp className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide">New</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</p>
                        <p className="text-xs text-yellow-400 font-medium mt-1">Last 30 days</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2a2a2a] p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="p-3 sm:p-4 bg-purple-500 rounded-2xl shadow-lg">
                        <Users className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide">Total</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{users.length}</p>
                        <p className="text-xs text-purple-400 font-medium mt-1">All customers</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clvData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="totalSpent" fill="#8B5CF6" name="Total Spent ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}