import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, User, XCircle, Loader2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdminMerchant } from '../context/adminMerchantContext';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { merchantId, loading: merchantLoading } = useAdminMerchant();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    // Fetch order from Supabase - scoped to merchant
    useEffect(() => {
        const fetchOrder = async () => {
            // Wait for merchant context
            if (merchantLoading || !merchantId) {
                if (!merchantLoading) {
                    setLoading(false);
                }
                return;
            }

            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', id)
                    .eq('merchant_id', merchantId) // ✅ Scope to current merchant
                    .single();

                if (error) throw error;
                setOrder(data);
                setSelectedStatus(data.status);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, merchantId, merchantLoading]);

    const formatCurrency = (value) => {
        return `R ${Number(value).toLocaleString('en-ZA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusConfig = (status) => {
        const configs = {
            'delivered': {
                bg: 'bg-green-100',
                text: 'text-green-700',
                icon: CheckCircle,
                border: 'border-green-200',
                label: 'Delivered'
            },
            'shipped': {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                icon: Truck,
                border: 'border-blue-200',
                label: 'Shipped'
            },
            'processing': {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                icon: Package,
                border: 'border-yellow-200',
                label: 'Processing'
            },
            'pending': {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                icon: Clock,
                border: 'border-gray-200',
                label: 'Pending'
            },
            'cancelled': {
                bg: 'bg-red-100',
                text: 'text-red-700',
                icon: XCircle,
                border: 'border-red-200',
                label: 'Cancelled'
            }
        };
        return configs[status?.toLowerCase()] || configs['pending'];
    };

    const handleUpdateStatus = async () => {
        if (selectedStatus === order.status) return;
        if (!merchantId) {
            alert('Unable to update - merchant not identified');
            return;
        }

        try {
            setUpdating(true);
            const { error } = await supabase
                .from('orders')
                .update({ status: selectedStatus })
                .eq('id', id)
                .eq('merchant_id', merchantId); // ✅ Security: ensure order belongs to this merchant

            if (error) throw error;

            setOrder({ ...order, status: selectedStatus });
            alert('Order status updated successfully!');
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <div className="text-center py-20">
                    <Package className="mx-auto text-gray-300 mb-4" size={80} />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h3>
                    <p className="text-gray-500 mb-6">The order you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/orders')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        <ArrowLeft size={18} />
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Order #{order.id}</h1>
                    <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
                </div>
                <div className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                    <StatusIcon size={18} />
                    <span className="font-semibold">{statusConfig.label}</span>
                </div>
            </div>

            {/* Status Update Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Update Order Status:</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button
                        onClick={handleUpdateStatus}
                        disabled={updating || selectedStatus === order.status}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {updating ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Update Status
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="text-blue-500" size={20} />
                            Order Items
                        </h2>
                        <div className="space-y-4">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                                        </div>
                                        <p className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No items found</p>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span>{order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>VAT (15%)</span>
                                <span>{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                                <span className="text-gray-700">Total</span>
                                <span className="text-gray-900">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="text-blue-500" size={20} />
                            Payment Information
                        </h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status:</span>
                                <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                                </span>
                            </div>
                            {order.notes && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Order Notes:</p>
                                    <p className="text-gray-600">{order.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Customer & Shipping Info */}
                <div className="space-y-6">
                    {/* Customer Info Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="text-blue-500" size={20} />
                            Customer
                        </h2>
                        <div className="space-y-3">
                            <p className="font-semibold text-gray-900">{order.customer_name}</p>
                            <p className="text-sm text-gray-500">{order.customer_email}</p>
                            <p className="text-sm text-gray-500">{order.customer_phone}</p>
                        </div>
                    </div>

                    {/* Shipping Info Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="text-blue-500" size={20} />
                            Shipping Address
                        </h2>
                        <div className="text-gray-600 leading-relaxed text-sm">
                            <p>{order.shipping_address.address}</p>
                            <p>{order.shipping_address.city}, {order.shipping_address.province}</p>
                            <p>{order.shipping_address.postalCode}</p>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Timeline</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Created:</span>
                                <span className="text-gray-900">{formatDate(order.created_at)}</span>
                            </div>
                            {order.updated_at && order.updated_at !== order.created_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="text-gray-900">{formatDate(order.updated_at)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
