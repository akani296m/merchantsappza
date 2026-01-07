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

  // --- DATA ---
  const revenueData = [
    { time: '1 AM', revenue: 20000 },
    { time: '3 AM', revenue: 25000 },
    { time: '5 AM', revenue: 45000 },
    { time: '7 AM', revenue: 55000 },
    { time: '9 AM', revenue: 70000 },
    { time: '11 AM', revenue: 85000 },
    { time: '1 PM', revenue: 95000 },
    { time: '3 PM', revenue: 88000 },
    { time: '5 PM', revenue: 92000 },
    { time: '7 PM', revenue: 98000 },
    { time: '9 PM', revenue: 105000 },
    { time: '11 PM', revenue: 100000 }
  ];

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
              <span className="text-4xl font-bold text-gray-900">
                {formatCurrency(100000)}
              </span>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                <TrendingUp size={16} />
                <span className="text-sm font-semibold">+12.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHART */}
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