import React, { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle, AlertCircle, Eye, EyeOff, Building, DollarSign } from 'lucide-react';
import { useAdminMerchant } from '../../context/adminMerchantContext';
import { supabase } from '../../lib/supabase';

// Payment Gateway Icons as SVG components
const PaystackIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
        <rect x="2" y="4" width="4" height="16" fill="#00C3F7" rx="1" />
        <rect x="8" y="8" width="4" height="12" fill="#00C3F7" rx="1" />
        <rect x="14" y="2" width="4" height="18" fill="#00C3F7" rx="1" />
    </svg>
);

const PayfastIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
        <text x="2" y="18" fontSize="14" fontWeight="bold" fill="#1A1A2E" fontFamily="Arial">Pf</text>
    </svg>
);

const YocoIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8" stroke="#0066FF" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M20 12c0 4.4-3.6 8-8 8s-8-3.6-8-8" stroke="#0066FF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
);

const PeachPaymentsIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M4 6l8-2 8 2v12l-8 2-8-2V6z" fill="#1A1A2E" />
        <path d="M6 8l6-1.5 6 1.5v8l-6 1.5-6-1.5V8z" fill="#00D4AA" />
        <path d="M8 10l4-1 4 1v4l-4 1-4-1v-4z" fill="#FF6B9D" />
    </svg>
);

const OzowIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M4 4l16 16M20 4L4 20" stroke="#1A1A2E" strokeWidth="4" strokeLinecap="round" />
    </svg>
);

// Gateway data configuration
const PAYMENT_GATEWAYS = [
    {
        id: 'paystack',
        name: 'Paystack',
        icon: PaystackIcon,
        description: 'Accept payments via cards, bank transfers, and mobile money',
        keyField: 'paystack_public_key',
        dashboardUrl: 'https://dashboard.paystack.com/#/settings/developers',
        dashboardLabel: 'Paystack Dashboard → Settings → API Keys & Webhooks',
    },
    {
        id: 'payfast',
        name: 'Payfast',
        icon: PayfastIcon,
        description: 'South African payment gateway supporting multiple payment methods',
        keyField: 'payfast_merchant_id',
        dashboardUrl: 'https://www.payfast.co.za/dashboard',
        dashboardLabel: 'Payfast Dashboard → Settings → Integration',
    },
    {
        id: 'yoco',
        name: 'Yoco',
        icon: YocoIcon,
        description: 'Accept card payments with competitive rates',
        keyField: 'yoco_secret_key',
        dashboardUrl: 'https://portal.yoco.com/',
        dashboardLabel: 'Yoco Portal → API Keys',
        isSecretKey: true, // Flag to indicate this is a secret key, not public
    },
    {
        id: 'peach_payments',
        name: 'Peach Payments',
        icon: PeachPaymentsIcon,
        description: 'Enterprise-grade payment processing for Africa',
        keyField: 'peach_entity_id',
        dashboardUrl: 'https://dashboard.peachpayments.com/',
        dashboardLabel: 'Peach Dashboard → Settings → API Configuration',
    },
    {
        id: 'ozow',
        name: 'Ozow',
        icon: OzowIcon,
        description: 'Instant EFT payments directly from customer bank accounts',
        keyField: 'ozow_site_code',
        dashboardUrl: 'https://ozow.com/merchant',
        dashboardLabel: 'Ozow Merchant Portal → API Settings',
    },
];

export default function FinanceSettings() {
    const { merchant, refetch } = useAdminMerchant();
    const [expandedGateway, setExpandedGateway] = useState(null);
    const [gatewayKeys, setGatewayKeys] = useState({});
    const [showKeys, setShowKeys] = useState({});
    const [saving, setSaving] = useState({});
    const [saveStatus, setSaveStatus] = useState({});

    // Load existing gateway keys when merchant data loads
    useEffect(() => {
        const fetchGatewayKeys = async () => {
            if (!merchant?.id) return;

            // Initialize from merchant context
            const keys = {};
            PAYMENT_GATEWAYS.forEach(gateway => {
                if (merchant[gateway.keyField]) {
                    keys[gateway.id] = merchant[gateway.keyField];
                }
            });
            setGatewayKeys(keys);

            // Fetch keys from database if not in context
            try {
                const { data, error } = await supabase
                    .from('merchants')
                    .select('paystack_public_key, yoco_secret_key')
                    .eq('id', merchant.id)
                    .single();

                if (!error && data) {
                    setGatewayKeys(prev => ({
                        ...prev,
                        paystack: data.paystack_public_key || prev.paystack,
                        yoco: data.yoco_secret_key || prev.yoco
                    }));
                }
            } catch (err) {
                console.error('Error fetching gateway keys:', err);
            }
        };

        fetchGatewayKeys();
    }, [merchant?.id, merchant?.paystack_public_key]);

    const handleSaveGateway = async (gatewayId, keyField) => {
        if (!merchant?.id) {
            setSaveStatus(prev => ({ ...prev, [gatewayId]: 'error' }));
            return;
        }

        setSaving(prev => ({ ...prev, [gatewayId]: true }));
        setSaveStatus(prev => ({ ...prev, [gatewayId]: null }));

        try {
            const updateData = {};
            updateData[keyField] = gatewayKeys[gatewayId]?.trim() || null;

            const { error } = await supabase
                .from('merchants')
                .update(updateData)
                .eq('id', merchant.id);

            if (error) throw error;

            setSaveStatus(prev => ({ ...prev, [gatewayId]: 'success' }));
            refetch();

            setTimeout(() => setSaveStatus(prev => ({ ...prev, [gatewayId]: null })), 3000);
        } catch (error) {
            console.error(`Error saving ${gatewayId} configuration:`, error);
            setSaveStatus(prev => ({ ...prev, [gatewayId]: 'error' }));
        } finally {
            setSaving(prev => ({ ...prev, [gatewayId]: false }));
        }
    };

    const isGatewayActive = (gatewayId) => {
        return gatewayKeys[gatewayId] && gatewayKeys[gatewayId].trim().length > 0;
    };

    const toggleExpanded = (gatewayId) => {
        setExpandedGateway(expandedGateway === gatewayId ? null : gatewayId);
    };

    const renderGatewayContent = (gateway) => {
        const isActive = isGatewayActive(gateway.id);
        const isSecretKey = gateway.isSecretKey || false;

        return (
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold text-gray-900">{gateway.name}</h3>
                    {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle size={12} />
                            Connected
                        </span>
                    )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{gateway.description}</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {gateway.name} {isSecretKey ? 'Secret' : 'Public'} Key
                        </label>
                        <div className="relative">
                            <input
                                type={showKeys[gateway.id] ? 'text' : 'password'}
                                value={gatewayKeys[gateway.id] || ''}
                                onChange={(e) => setGatewayKeys(prev => ({ ...prev, [gateway.id]: e.target.value }))}
                                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white"
                                placeholder={isSecretKey ? 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxx' : 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowKeys(prev => ({ ...prev, [gateway.id]: !prev[gateway.id] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showKeys[gateway.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">
                            Get your {isSecretKey ? 'secret' : 'public'} key from your{' '}
                            <a
                                href={gateway.dashboardUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {gateway.dashboardLabel}
                            </a>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSaveGateway(gateway.id, gateway.keyField)}
                            disabled={saving[gateway.id]}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                            {saving[gateway.id] ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                'Save Configuration'
                            )}
                        </button>

                        {saveStatus[gateway.id] === 'success' && (
                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                <CheckCircle size={16} />
                                Saved successfully!
                            </div>
                        )}

                        {saveStatus[gateway.id] === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                                <AlertCircle size={16} />
                                Failed to save
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Important Security Note:</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    {isSecretKey ? (
                                        <>
                                            <li>Use your <strong>Secret Key</strong> (starts with <code className="bg-blue-100 px-1 rounded">sk_</code>)</li>
                                            <li>This key is securely stored and never exposed to customers</li>
                                            <li>Keep this key confidential and never share it publicly</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Only use your <strong>Public Key</strong> (starts with <code className="bg-blue-100 px-1 rounded">pk_</code>)</li>
                                            <li>Never use your Secret Key in this field</li>
                                            <li>The public key is safe to use in your storefront checkout</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl space-y-8" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            {/* Payment Gateway Section */}
            <div>
                {/* Headline - Outside the card */}
                <h2 className="text-xl font-semibold text-gray-900 mb-5" style={{ color: '#111827', fontWeight: 600 }}>
                    Payment Gateway
                </h2>

                {/* Card Container */}
                <div
                    className="bg-white rounded-2xl border overflow-hidden"
                    style={{
                        borderRadius: '16px',
                        borderColor: '#E5E7EB',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                    }}
                >
                    {PAYMENT_GATEWAYS.map((gateway, index) => {
                        const Icon = gateway.icon;
                        const isActive = isGatewayActive(gateway.id);
                        const isExpanded = expandedGateway === gateway.id;
                        const isLast = index === PAYMENT_GATEWAYS.length - 1;

                        return (
                            <div key={gateway.id}>
                                {/* List Item Row */}
                                <div
                                    onClick={() => toggleExpanded(gateway.id)}
                                    className="flex items-center justify-between px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50"
                                    style={{ padding: '16px 20px' }}
                                >
                                    {/* Left Side: Icon + Text */}
                                    <div className="flex items-center gap-4">
                                        {/* Brand Icon Container */}
                                        <div
                                            className="flex items-center justify-center"
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                backgroundColor: '#F3F4F6',
                                                borderRadius: '10px',
                                            }}
                                        >
                                            <Icon />
                                        </div>

                                        {/* Text Block */}
                                        <div className="flex flex-col">
                                            <span
                                                className="font-medium"
                                                style={{
                                                    fontSize: '16px',
                                                    fontWeight: 500,
                                                    color: '#1F2937',
                                                    lineHeight: '1.4'
                                                }}
                                            >
                                                {gateway.name}
                                            </span>
                                            <span
                                                className="flex items-center gap-1.5"
                                                style={{
                                                    fontSize: '14px',
                                                    fontWeight: 400,
                                                    color: '#6B7280',
                                                    lineHeight: '1.4'
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: isActive ? '#50C878' : '#D1D5DB',
                                                        fontSize: '10px'
                                                    }}
                                                >
                                                    ●
                                                </span>
                                                Gateway is {isActive ? 'active' : 'inactive'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Side: Chevron */}
                                    <ChevronRight
                                        size={20}
                                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                        style={{ color: '#9CA3AF' }}
                                    />
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && renderGatewayContent(gateway)}

                                {/* Divider - Only between items, not after last */}
                                {!isLast && (
                                    <div
                                        style={{
                                            height: '1px',
                                            backgroundColor: '#F3F4F6',
                                            marginLeft: '20px',
                                            marginRight: '20px'
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Billing Information Section */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-5" style={{ color: '#111827', fontWeight: 600 }}>
                    Billing Information
                </h2>

                <div
                    className="bg-white rounded-2xl border"
                    style={{
                        borderRadius: '16px',
                        borderColor: '#E5E7EB',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        padding: '20px'
                    }}
                >
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <DollarSign className="text-blue-600 mt-0.5" size={20} />
                                <div>
                                    <h3 className="font-medium text-blue-900 mb-1">Current Plan: Free Trial</h3>
                                    <p className="text-sm text-blue-700">
                                        You're currently on a free trial. Upgrade to unlock premium features.
                                    </p>
                                    <button className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                                        View Plans
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Your Business Name"
                                    defaultValue={merchant?.business_name || ''}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tax ID / VAT Number
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
