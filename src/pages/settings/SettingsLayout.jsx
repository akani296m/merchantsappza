import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Settings,
    Building2,
    CreditCard,
    Store,
    ShoppingBag,
    Truck,
    Receipt,
    ChevronLeft,
    ArrowLeft,
    AlertTriangle
} from 'lucide-react';

export default function SettingsLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const settingsSections = [
        {
            name: 'General',
            path: '/settings/general',
            icon: Settings,
            description: 'Manage your store details and preferences'
        },
        {
            name: 'Finance',
            path: '/settings/finance',
            icon: CreditCard,
            description: 'Payment methods and billing'
        },
        {
            name: 'Manage Store',
            path: '/settings/manage-store',
            icon: Store,
            description: 'Store configuration and branding'
        },
        {
            name: 'Orders & Notifications',
            path: '/settings/orders-notifications',
            icon: ShoppingBag,
            description: 'Order processing and email notifications'
        },
        {
            name: 'Shipping',
            path: '/settings/shipping',
            icon: Truck,
            description: 'Shipping zones and delivery options'
        },
        {
            name: 'Taxes',
            path: '/settings/taxes',
            icon: Receipt,
            description: 'Tax rates and collection settings'
        },
        {
            name: 'Danger Zone',
            path: '/settings/danger-zone',
            icon: AlertTriangle,
            description: 'Pause or delete your store'
        },
    ];

    const SettingsNavItem = ({ name, path, icon: Icon, description }) => {
        const isActive = location.pathname === path;

        return (
            <Link
                to={path}
                className={`
          block px-4 py-3.5 rounded-lg transition-all
          ${isActive
                        ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700'
                        : 'hover:bg-gray-50 border-l-4 border-transparent text-gray-700 hover:text-gray-900'
                    }
        `}
            >
                <div className="flex items-start gap-3">
                    <Icon size={20} className={`mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                            {name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {description}
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Back to dashboard"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Manage your store preferences and configuration
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Layout */}
            <div className="flex">
                {/* Settings Sidebar */}
                <aside className="w-80 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
                    <nav className="p-4 space-y-1">
                        {settingsSections.map((section) => (
                            <SettingsNavItem key={section.path} {...section} />
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
