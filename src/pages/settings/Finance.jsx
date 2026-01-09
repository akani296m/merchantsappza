import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, DollarSign, Building, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAdminMerchant } from '../../context/adminMerchantContext';
import { supabase } from '../../lib/supabase';

export default function FinanceSettings() {
    const { merchant, refetch } = useAdminMerchant();
    const [paystackPublicKey, setPaystackPublicKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    // Load existing Paystack key when merchant data loads
    useEffect(() => {
        const fetchPaystackKey = async () => {
            if (!merchant?.id) return;

            // First, try to use data from context
            if (merchant.paystack_public_key) {
                setPaystackPublicKey(merchant.paystack_public_key);
                return;
            }

            // Fallback: fetch directly if not in context
            try {
                const { data, error } = await supabase
                    .from('merchants')
                    .select('paystack_public_key')
                    .eq('id', merchant.id)
                    .single();

                if (!error && data?.paystack_public_key) {
                    setPaystackPublicKey(data.paystack_public_key);
                }
            } catch (err) {
                console.error('Error fetching Paystack key:', err);
            }
        };

        fetchPaystackKey();
    }, [merchant?.id, merchant?.paystack_public_key]);

    const handleSavePaystack = async () => {
        if (!merchant?.id) {
            setSaveStatus('error');
            return;
        }

        setSaving(true);
        setSaveStatus(null);

        try {
            const { error } = await supabase
                .from('merchants')
                .update({ paystack_public_key: paystackPublicKey.trim() || null })
                .eq('id', merchant.id);

            if (error) throw error;

            setSaveStatus('success');
            refetch(); // Refresh merchant data

            // Clear success message after 3 seconds
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error('Error saving Paystack key:', error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const isPaystackConnected = paystackPublicKey && paystackPublicKey.trim().length > 0;

    return (
        <div className="max-w-4xl space-y-6">
            {/* Payment Gateway Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CreditCard size={24} className="text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Payment Gateway</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Configure how you accept payments from customers
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Paystack Integration */}
                    <div className="border-2 border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                    <CreditCard className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        Paystack
                                        {isPaystackConnected && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                <CheckCircle size={12} />
                                                Connected
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-500">Accept payments via cards, bank transfers, and mobile money</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Paystack Public Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        value={paystackPublicKey}
                                        onChange={(e) => setPaystackPublicKey(e.target.value)}
                                        className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                        placeholder="pk_test_xxxxxxxxxxxxxxxxxxxxxxxx"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Get your public key from your{' '}
                                    <a
                                        href="https://dashboard.paystack.com/#/settings/developers"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Paystack Dashboard → Settings → API Keys & Webhooks
                                    </a>
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSavePaystack}
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Configuration'
                                    )}
                                </button>

                                {saveStatus === 'success' && (
                                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                        <CheckCircle size={16} />
                                        Saved successfully!
                                    </div>
                                )}

                                {saveStatus === 'error' && (
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
                                            <li>Only use your <strong>Public Key</strong> (starts with <code className="bg-blue-100 px-1 rounded">pk_</code>)</li>
                                            <li>Never use your Secret Key in this field</li>
                                            <li>The public key is safe to use in your storefront checkout</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Other Payment Providers (Coming Soon) */}
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Other Payment Providers</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 opacity-50 cursor-not-allowed">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CreditCard className="text-purple-600" size={24} />
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">Stripe</h3>
                                    <p className="text-sm text-gray-500">Coming Soon</p>
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 opacity-50 cursor-not-allowed">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CreditCard className="text-blue-600" size={24} />
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">PayPal</h3>
                                    <p className="text-sm text-gray-500">Coming Soon</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Building size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Billing Information</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Your billing details for subscription and fees
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <DollarSign className="text-blue-600 mt-0.5" size={20} />
                                <div>
                                    <h3 className="font-medium text-blue-900 mb-1">Current Plan: Free Trial</h3>
                                    <p className="text-sm text-blue-700">
                                        You're currently on a free trial. Upgrade to unlock premium features.
                                    </p>
                                    <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
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
