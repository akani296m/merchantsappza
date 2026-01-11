import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Package, Edit2, ShoppingBag, ChevronRight, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdminMerchant } from '../context/adminMerchantContext';

export default function Home() {
  const { merchantId, merchant, loading: merchantLoading } = useAdminMerchant();
  const [editingProduct, setEditingProduct] = useState(null);
  // NEW: State for the dropdown
  const [timeRange, setTimeRange] = useState('This Week');
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const navigate = useNavigate();

  // Fetch recent orders from Supabase - scoped to merchant
  useEffect(() => {
    const fetchRecentOrders = async () => {
      // Wait for merchant context
      if (merchantLoading || !merchantId) {
        setLoadingOrders(false);
        setRecentOrders([]);
        return;
      }

      try {
        setLoadingOrders(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('merchant_id', merchantId) // ✅ Scope to current merchant
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentOrders(data || []);
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchRecentOrders();
  }, [merchantId, merchantLoading]);

  // Fetch revenue data from Supabase based on time range - scoped to merchant
  useEffect(() => {
    const fetchRevenueData = async () => {
      // Wait for merchant context
      if (merchantLoading || !merchantId) {
        setLoadingRevenue(false);
        setRevenueData([]);
        setTotalRevenue(0);
        return;
      }

      try {
        setLoadingRevenue(true);

        // Calculate date range based on selection
        const now = new Date();
        let startDate = new Date();

        switch (timeRange) {
          case 'Today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'This Week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'This Month':
            startDate.setDate(now.getDate() - 30);
            break;
          case 'Year to Date':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate.setDate(now.getDate() - 7);
        }

        const { data, error } = await supabase
          .from('orders')
          .select('created_at, total')
          .eq('merchant_id', merchantId) // ✅ Scope to current merchant
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Process data based on time range
        const processedData = processRevenueData(data || [], timeRange);
        setRevenueData(processedData);

        // Calculate total revenue
        const total = (data || []).reduce((sum, order) => sum + (order.total || 0), 0);
        setTotalRevenue(total);

      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setRevenueData([]);
        setTotalRevenue(0);
      } finally {
        setLoadingRevenue(false);
      }
    };

    fetchRevenueData();
  }, [timeRange, merchantId, merchantLoading]);

  // Helper function to process revenue data for charts
  const processRevenueData = (orders, range) => {
    if (!orders || orders.length === 0) {
      return getEmptyDataForRange(range);
    }

    const groupedData = {};

    orders.forEach(order => {
      const date = new Date(order.created_at);
      let key;

      switch (range) {
        case 'Today':
          // Group by hour
          key = `${date.getHours()}:00`;
          break;
        case 'This Week':
          // Group by day
          const daysAgo = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
          key = daysAgo === 0 ? 'Today' : `${7 - daysAgo}d ago`;
          break;
        case 'Month':
          // Group by week
          const weeksAgo = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24 * 7));
          key = `Week ${4 - weeksAgo}`;
          break;
        case 'Year to Date':
          // Group by month
          key = date.toLocaleDateString('en-US', { month: 'short' });
          break;
        default:
          key = date.toLocaleDateString();
      }

      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key] += order.total || 0;
    });

    // Convert to array format for stacked bar chart (split revenue into two segments)
    return Object.entries(groupedData).map(([time, totalRevenue]) => {
      // Split revenue into two segments (60% and 40% for visual effect)
      const segment1 = totalRevenue * 0.6;
      const segment2 = totalRevenue * 0.4;
      return {
        time,
        revenue1: segment1,
        revenue2: segment2,
        total: totalRevenue
      };
    });
  };

  // Helper to provide empty data structure when no orders
  const getEmptyDataForRange = (range) => {
    const createDataPoint = (time) => ({
      time,
      revenue1: 0,
      revenue2: 0,
      total: 0
    });

    switch (range) {
      case 'Today':
        return Array.from({ length: 24 }, (_, i) => createDataPoint(`${i}:00`));
      case 'This Week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => createDataPoint(day));
      case 'Month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => createDataPoint(week));
      case 'Year to Date':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map(month => createDataPoint(month));
      default:
        return [];
    }
  };

  // --- DATA ---
  const bestSellers = [
    { id: 1, name: 'Premium Wireless Headphones', unitsSold: 1247, icon: '🎧' },
    { id: 2, name: 'Smart Watch Series X', unitsSold: 1089, icon: '⌚' },
    { id: 3, name: 'Laptop Pro 15\"', unitsSold: 892, icon: '💻' },
    { id: 4, name: 'Bluetooth Speaker', unitsSold: 756, icon: '🔊' },
    { id: 5, name: 'USB-C Hub Adapter', unitsSold: 634, icon: '🔌' }
  ];

  // --- HELPERS ---
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'delivered': { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
      'shipped': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Shipped' },
      'processing': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Processing' },
      'pending': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
    };
    return configs[status?.toLowerCase()] || configs['pending'];
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const closeModal = () => {
    setEditingProduct(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Sales Analytics Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Header with Title and Segmented Control */}
        <div className="flex items-center justify-between mb-8">
          {/* Title with Icon */}
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-[#111827]" />
            <h2 className="text-[16px] font-semibold text-[#111827]">Sales</h2>
          </div>

          {/* Segmented Control Filter */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            {['Today', 'This Week', 'Month', 'Year to Date'].map((option) => (
              <button
                key={option}
                onClick={() => setTimeRange(option)}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all ${timeRange === option
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#9CA3AF] hover:text-[#6B7280]'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* CHART */}
        {loadingRevenue ? (
          <div className="flex items-center justify-center" style={{ height: 400 }}>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : revenueData.length === 0 ? (
          <div className="flex items-center justify-center flex-col" style={{ height: 400 }}>
            <TrendingUp className="text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">No revenue data available for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={revenueData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap="20%"
            >
              {/* Gridlines - faint dashed horizontal lines */}
              <CartesianGrid
                strokeDasharray="5 5"
                stroke="#E5E7EB"
                vertical={false}
              />

              {/* X-Axis */}
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                dy={10}
              />

              {/* Y-Axis */}
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12, textAnchor: 'end' }}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${value / 1000}K`;
                  return value;
                }}
                ticks={[0, 10000, 50000, 100000, 130000, 150000]}
                domain={[0, 150000]}
              />

              {/* Tooltip */}
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const total = payload[0].payload.total;
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(total)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {payload[0].payload.time}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Stacked Bars with gradients and rounded tops */}
              <defs>
                <linearGradient id="colorRevenue1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EC4899" stopOpacity={1} />
                  <stop offset="100%" stopColor="#F472B6" stopOpacity={1} />
                </linearGradient>
              </defs>

              {/* Bottom segment of the bar */}
              <Bar
                dataKey="revenue1"
                stackId="a"
                fill="url(#colorRevenue1)"
                radius={[0, 0, 0, 0]}
                maxBarSize={32}
              />

              {/* Top segment of the bar with rounded top */}
              <Bar
                dataKey="revenue2"
                stackId="a"
                fill="url(#colorRevenue2)"
                radius={[8, 8, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Activity & Table Row (1/3 + 2/3 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - 1/3 width */}
        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              See All
            </button>
          </div>

          {loadingOrders ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 4).map((order) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer group"
                  >
                    {/* Icon Container */}
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="text-purple-600" size={20} />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">Order #{String(order.id || '').slice(0, 8)}</p>
                      <p className="text-xs text-gray-500 truncate">{order.customer_name} • {getTimeAgo(order.created_at)}</p>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products Table - 2/3 width */}
        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Products</h3>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Sort
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stocks</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map((product, index) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{ height: '60px' }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                          {product.icon}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-700">{Math.floor(Math.random() * 500) + 50}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-900 font-medium">
                        {formatCurrency(Math.floor(Math.random() * 5000) + 500)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-700">{product.unitsSold.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal (Stays inside Home because it edits Home data) */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  defaultValue={editingProduct.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units Sold
                </label>
                <input
                  type="number"
                  defaultValue={editingProduct.unitsSold}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}