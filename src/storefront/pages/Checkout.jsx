import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/cartcontext';
import { useMerchant } from '../context/MerchantContext';
import { supabase } from '../../lib/supabase';

// Helper function for consistent currency formatting
const formatCurrency = (amount) => {
    return Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// InputField component defined OUTSIDE the main component to prevent re-creation on every render
const InputField = ({ name, label, type = 'text', placeholder = '', maxLength, value, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        {error && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
    </div>
);

export default function Checkout() {
    const navigate = useNavigate();
    const { merchantSlug } = useParams();
    const { merchant } = useMerchant();
    const { cartItems, getSubtotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const isCompletingOrder = useRef(false);
    const basePath = `/s/${merchantSlug}`;

    const [formData, setFormData] = useState({
        email: '', firstName: '', lastName: '', phone: '',
        address: '', city: '', province: '', postalCode: '',
        cardNumber: '', cardName: '', expiryDate: '', cvv: '',
        orderNotes: ''
    });

    useEffect(() => {
        if (cartItems.length === 0 && !isCompletingOrder.current) {
            navigate(`${basePath}/cart`);
        }
    }, [cartItems, navigate, basePath]);

    const subtotal = getSubtotal();
    const shipping = subtotal >= 1500 ? 0 : 150;
    const tax = subtotal * 0.15;
    const total = subtotal + shipping + tax;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.province) newErrors.province = 'Province is required';
        if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
        if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
        if (!formData.cardName) newErrors.cardName = 'Cardholder name is required';
        if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
        if (!formData.cvv) newErrors.cvv = 'CVV is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        setLoading(true);
        isCompletingOrder.current = true;

        try {
            const orderData = {
                merchant_id: merchant?.id,
                customer_email: formData.email,
                customer_name: `${formData.firstName} ${formData.lastName}`,
                customer_phone: formData.phone,
                shipping_address: { address: formData.address, city: formData.city, province: formData.province, postalCode: formData.postalCode },
                items: cartItems.map(item => ({ product_id: item.id, title: item.title, quantity: item.quantity, price: item.price, subtotal: item.price * item.quantity })),
                subtotal, shipping, tax, total,
                status: 'pending', payment_status: 'pending',
                notes: formData.orderNotes || null,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase.from('orders').insert([orderData]).select().single();
            if (error) throw error;
            clearCart();
            navigate(`${basePath}/order-confirmation/${data.id}`, { state: { orderId: data.id, orderData: data } });
        } catch (error) {
            console.error('Error creating order:', error);
            alert('There was an error processing your order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) return null;

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-8">
                    <Link to={`${basePath}/cart`} className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4"><ArrowLeft size={18} /> Back to Cart</Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Checkout</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField name="email" label="Email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} error={errors.email} />
                                    <InputField name="phone" label="Phone" placeholder="071 234 5678" value={formData.phone} onChange={handleInputChange} error={errors.phone} />
                                    <InputField name="firstName" label="First Name" value={formData.firstName} onChange={handleInputChange} error={errors.firstName} />
                                    <InputField name="lastName" label="Last Name" value={formData.lastName} onChange={handleInputChange} error={errors.lastName} />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                                <div className="space-y-4">
                                    <InputField name="address" label="Street Address" placeholder="123 Main Street" value={formData.address} onChange={handleInputChange} error={errors.address} />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <InputField name="city" label="City" value={formData.city} onChange={handleInputChange} error={errors.city} />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                                            <select name="province" value={formData.province} onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg outline-none ${errors.province ? 'border-red-500' : 'border-gray-300'}`}>
                                                <option value="">Select</option>
                                                <option value="Gauteng">Gauteng</option>
                                                <option value="Western Cape">Western Cape</option>
                                                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                                <option value="Eastern Cape">Eastern Cape</option>
                                                <option value="Free State">Free State</option>
                                                <option value="Limpopo">Limpopo</option>
                                                <option value="Mpumalanga">Mpumalanga</option>
                                                <option value="Northern Cape">Northern Cape</option>
                                                <option value="North West">North West</option>
                                            </select>
                                        </div>
                                        <InputField name="postalCode" label="Postal Code" maxLength="4" value={formData.postalCode} onChange={handleInputChange} error={errors.postalCode} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-4">Payment Information</h2>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                                    <Lock className="text-blue-600" size={20} />
                                    <p className="text-sm text-blue-800">Your payment information is encrypted and secure.</p>
                                </div>
                                <div className="space-y-4">
                                    <InputField name="cardNumber" label="Card Number" placeholder="1234 5678 9012 3456" maxLength="19" value={formData.cardNumber} onChange={handleInputChange} error={errors.cardNumber} />
                                    <InputField name="cardName" label="Cardholder Name" placeholder="Name on card" value={formData.cardName} onChange={handleInputChange} error={errors.cardName} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField name="expiryDate" label="Expiry Date" placeholder="MM/YY" maxLength="5" value={formData.expiryDate} onChange={handleInputChange} error={errors.expiryDate} />
                                        <InputField name="cvv" label="CVV" placeholder="123" maxLength="4" value={formData.cvv} onChange={handleInputChange} error={errors.cvv} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-6">
                                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3 pb-4 border-b">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="text-gray-400" size={24} /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.title}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                <p className="text-sm font-medium mt-1">R {formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>R {formatCurrency(subtotal)}</span></div>
                                    <div className="flex justify-between text-gray-600"><span>Shipping</span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : <span>R {formatCurrency(shipping)}</span>}</div>
                                    <div className="flex justify-between text-gray-600"><span>VAT (15%)</span><span>R {formatCurrency(tax)}</span></div>
                                    <div className="border-t pt-3"><div className="flex justify-between text-lg font-bold"><span>Total</span><span>R {formatCurrency(total)}</span></div></div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2">
                                    {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</> : <><Lock size={18} /> Complete Order</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
