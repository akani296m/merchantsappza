import React, { useState } from 'react';
import {
    Box,
    Sparkles,
    FileText,
    Layout,
    Shield,
    Search,
    Eye,
    CreditCard,
    CheckCircle,
    ExternalLink
} from 'lucide-react';
import { useAdminMerchant } from '../../context/adminMerchantContext';
import { supabase } from '../../lib/supabase';

// Polar Product IDs for each plan
// Replace these with your actual Polar product IDs from your Polar dashboard
const POLAR_PRODUCTS = {
    launch: import.meta.env.VITE_POLAR_LAUNCH_PRODUCT_ID || 'YOUR_LAUNCH_PRODUCT_ID',
    growth: import.meta.env.VITE_POLAR_GROWTH_PRODUCT_ID || 'YOUR_GROWTH_PRODUCT_ID',
};

// Fly.io API URL for Polar endpoints
const POLAR_API_URL = import.meta.env.VITE_POLAR_API_URL || 'https://soldt-polar-api.fly.dev';

export default function Billing() {
    const { merchant, refetch } = useAdminMerchant();
    const [loading, setLoading] = useState(false);

    // Check if merchant has an active subscription
    const hasActiveSubscription = merchant?.subscription_status === 'active' &&
        merchant?.subscription_plan &&
        merchant?.subscription_plan !== 'trial';

    // Function to handle plan selection - redirects to Polar checkout
    const handleSelectPlan = async (planName) => {
        if (!merchant?.id) {
            alert('Unable to start checkout. Please try again.');
            return;
        }

        const productId = POLAR_PRODUCTS[planName.toLowerCase()];
        if (!productId || productId.startsWith('YOUR_')) {
            alert('This plan is not yet configured. Please contact support.');
            return;
        }

        setLoading(true);
        try {
            // Build checkout URL with merchant info
            const params = new URLSearchParams({
                products: productId,
                customerExternalId: merchant.id.toString(),
                customerEmail: merchant.email || '',
                customerName: merchant.name || '',
                metadata: JSON.stringify({ merchantId: merchant.id, plan: planName }),
            });

            // Redirect to Polar checkout via Fly.io API
            window.location.href = `${POLAR_API_URL}/api/polar-checkout?${params.toString()}`;
        } catch (error) {
            console.error('Error redirecting to checkout:', error);
            alert('Failed to start checkout. Please try again.');
            setLoading(false);
        }
    };

    // Function to open customer portal for managing subscription
    const handleManageSubscription = () => {
        if (!merchant?.id) {
            alert('Unable to open subscription management. Please try again.');
            return;
        }
        window.location.href = `${POLAR_API_URL}/api/polar-customer-portal?merchantId=${merchant.id}`;
    };

    const features = {
        launch: [
            { icon: Box, text: 'Unlimited Products' },
            { icon: Sparkles, text: 'Free co.za available with Domain Credits' },
            { icon: FileText, text: 'Storefront & Checkout' },
        ],
        growth: [
            { icon: Box, text: 'Unlimited Products' },
            { icon: Sparkles, text: 'Full Access to our suite of apps' },
            { icon: Shield, text: 'Unlimited Emails' },
            { icon: Search, text: 'Highest Access to Storefront AI Builder' },
            { icon: Eye, text: '... and more', isGray: true },
        ],
    };

    return (
        <div className="min-h-screen" style={{ background: '#F7F7F5' }}>
            {/* Current Subscription Status - Show if active */}
            {hasActiveSubscription && (
                <div className="max-w-4xl mx-auto px-4 pt-8 pb-6">
                    <div
                        className="bg-white rounded-xl p-6 border flex items-center justify-between"
                        style={{ borderColor: '#E0E0E0' }}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ background: '#F0F9FF' }}
                            >
                                <CheckCircle size={24} style={{ color: '#3B82F6' }} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1" style={{ color: '#111' }}>
                                    Active Subscription
                                </h3>
                                <p className="text-sm" style={{ color: '#666' }}>
                                    You're currently on the <span className="font-semibold capitalize">{merchant?.subscription_plan}</span> plan
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleManageSubscription}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
                            style={{
                                background: '#3B82F6',
                                color: 'white',
                            }}
                        >
                            <CreditCard size={18} />
                            Manage Subscription
                            <ExternalLink size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="text-center mb-10 pt-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#111' }}>
                    {hasActiveSubscription ? 'Change Your Plan' : 'Choose your Plan'}
                </h1>
                <p className="text-base font-medium" style={{ color: '#888' }}>
                    Plans built for every stage of your business journey
                </p>
            </div>

            {/* Pricing Cards Container */}
            <div className="flex justify-center items-start gap-6 pb-12 px-4">
                {/* Card A: LAUNCH (Left Side) */}
                <div
                    className="bg-white rounded-2xl"
                    style={{
                        width: '340px',
                        height: '550px',
                        border: '1px solid #E0E0E0',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header Content */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-3" style={{ color: '#111' }}>
                            LAUNCH
                        </h2>
                        <div className="mb-1">
                            <span
                                className="font-bold"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontSize: '48px',
                                    color: '#000',
                                    lineHeight: '1',
                                }}
                            >
                                R330
                            </span>
                        </div>
                        <p className="text-xs" style={{ color: '#888' }}>
                            per member / month
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => handleSelectPlan('launch')}
                        disabled={loading}
                        className="w-full rounded-md font-medium mb-6 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: '#EBF5FA',
                            color: '#2eaadc',
                            height: '40px',
                            fontSize: '14px',
                        }}
                    >
                        {loading ? 'Processing...' : 'Continue'}
                    </button>

                    {/* Feature List */}
                    <div className="flex flex-col gap-3 flex-1">
                        {features.launch.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <feature.icon size={16} style={{ color: '#333', marginTop: '2px' }} strokeWidth={1.5} />
                                <span className="text-sm" style={{ color: '#333' }}>
                                    {feature.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card B: GROWTH (Right Side - Promoted) */}
                <div
                    className="bg-white rounded-2xl"
                    style={{
                        width: '340px',
                        height: '550px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0px 10px 30px rgba(0,0,0,0.08)',
                    }}
                >
                    {/* Header Content */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-3" style={{ color: '#111' }}>
                            Growth
                        </h2>
                        <div className="mb-1">
                            <span
                                className="font-bold"
                                style={{
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    fontSize: '48px',
                                    color: '#000',
                                    lineHeight: '1',
                                }}
                            >
                                R730
                            </span>
                        </div>
                        <p className="text-xs" style={{ color: '#888' }}>
                            per member / month
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => handleSelectPlan('growth')}
                        disabled={loading}
                        className="w-full rounded-md font-medium mb-6 transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: '#3B82F6',
                            color: 'white',
                            height: '40px',
                            fontSize: '14px',
                        }}
                    >
                        {loading ? 'Processing...' : 'Continue'}
                    </button>

                    {/* Feature List */}
                    <div className="flex flex-col gap-3 flex-1">
                        {features.growth.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <feature.icon
                                    size={16}
                                    style={{
                                        color: feature.isGray ? '#888' : '#333',
                                        marginTop: '2px',
                                        opacity: feature.isGray ? 0 : 1
                                    }}
                                    strokeWidth={1.5}
                                />
                                <span
                                    className="text-sm"
                                    style={{
                                        color: feature.isGray ? '#999' : '#333',
                                        marginLeft: feature.isGray ? '-20px' : '0'
                                    }}
                                >
                                    {feature.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
