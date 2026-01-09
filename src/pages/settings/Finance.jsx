import React, { useState } from 'react';
import { CreditCard, Plus, DollarSign, Building } from 'lucide-react';

export default function FinanceSettings() {
    const [paymentMethods, setPaymentMethods] = useState([
        { id: 1, type: 'Visa', last4: '4242', expiry: '12/24', isDefault: true },
    ]);

    return (
        <div className="max-w-4xl space-y-6">
            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CreditCard size={24} className="text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Manage how you receive payments from customers
                                </p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                            <Plus size={18} />
                            Add Method
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        {/* Payment Provider Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CreditCard className="text-purple-600" size={24} />
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">Stripe</h3>
                                    <p className="text-sm text-gray-500">Accept credit cards and more</p>
                                    <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        Connect Stripe
                                    </button>
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CreditCard className="text-blue-600" size={24} />
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">PayPal</h3>
                                    <p className="text-sm text-gray-500">Accept PayPal payments</p>
                                    <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        Connect PayPal
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-700">Note:</span> Payment providers will require additional setup and verification before you can accept payments.
                            </p>
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
