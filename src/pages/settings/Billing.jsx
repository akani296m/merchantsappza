import React, { useState } from 'react';
import {
    Box,
    Sparkles,
    FileText,
    Layout,
    Shield,
    Search,
    Eye
} from 'lucide-react';
import { useAdminMerchant } from '../../context/adminMerchantContext';
import { supabase } from '../../lib/supabase';

export default function Billing() {
    const { merchant, refetch } = useAdminMerchant();
    const [loading, setLoading] = useState(false);

    // Function to handle plan selection
    const handleSelectPlan = async (planName) => {
        if (!merchant?.id) {
            alert('Unable to update subscription. Please try again.');
            return;
        }

        setLoading(true);
        try {
            // Update merchant subscription in database
            const { error } = await supabase
                .from('merchants')
                .update({
                    subscription_plan: planName.toLowerCase(),
                    subscription_status: 'active',
                    subscription_started_at: new Date().toISOString(),
                })
                .eq('id', merchant.id);

            if (error) throw error;

            // Refetch merchant data to update the UI
            await refetch();

            alert(`Successfully subscribed to ${planName} plan!`);
        } catch (error) {
            console.error('Error updating subscription:', error);
            alert('Failed to update subscription. Please try again.');
        } finally {
            setLoading(false);
        }
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
            {/* Header Section */}
            <div className="text-center mb-10 pt-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#111' }}>
                    Choose your Plan
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
