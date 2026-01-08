import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Package, Edit2, ShoppingBag, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [editingProduct, setEditingProduct] = useState(null);
  // NEW: State for the dropdown
  const [timeRange, setTimeRange] = useState('This Week');
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const navigate = useNavigate();

  // Fetch recent orders from Supabase
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoadingOrders(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
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
  }, []);

  // Fetch revenue data from Supabase based on time range
  useEffect(() => {
    const fetchRevenueData = async () => {
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
  }, [timeRange]);

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
        case 'This Month':
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

    // Convert to array format for chart
    return Object.entries(groupedData).map(([time, revenue]) => ({
      time,
      revenue
    }));
  };

  // Helper to provide empty data structure when no orders
  const getEmptyDataForRange = (range) => {
    switch (range) {
      case 'Today':
        return Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          revenue: 0
        }));
      case 'This Week':
        return ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', '1d ago', 'Today'].map(day => ({
          time: day,
          revenue: 0
        }));
      case 'This Month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => ({
          time: week,
          revenue: 0
        }));
      case 'Year to Date':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
          time: month,
          revenue: 0
        }));
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

      {/* Revenue Analytics Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            {/* MODIFIED: Flex container to hold Title and Dropdown side-by-side */}
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-gray-600 text-sm font-medium">Total Revenue</h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Today">Today</option>
                <option value="Year to Date">Year to Date</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {loadingRevenue ? (
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-4xl font-bold text-gray-900">
                    {formatCurrency(totalRevenue)}
                  </span>
                  {totalRevenue > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      <TrendingUp size={16} />
                      <span className="text-sm font-semibold">+12.5%</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* CHART */}
        {loadingRevenue ? (
          <div className="flex items-center justify-center" style={{ height: 300 }}>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : revenueData.length === 0 ? (
          <div className="flex items-center justify-center flex-col" style={{ height: 300 }}>
            <TrendingUp className="text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">No revenue data available for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Two Column Layout: Best Sellers & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Best Sellers</h3>
          </div>
          <div className="space-y-3">
            {bestSellers.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-2xl">
                    {product.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.unitsSold.toLocaleString()} units sold
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(product)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit2 size={16} />
                  <span className="font-medium">Edit</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
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
              {recentOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">#{order.id}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>{getTimeAgo(order.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span>
                      <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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