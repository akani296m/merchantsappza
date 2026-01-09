import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Admin Layouts & Components
import AdminLayout from './components/adminlayout';
import ProtectedRoute from './components/protectedRoute';
import RequireMerchant from './components/requireMerchant';

// Admin Pages
import HomePage from './pages/home';
import OrdersPage from './pages/orders';
import OrderDetail from './pages/orderdetail';
import ProductCreator from './pages/products';
import ProductsPage from './pages/productlisting';
import CustomersPage from './pages/customers';
import Onboarding from './pages/onboarding';
import Login from './pages/login';
import Signup from './pages/signup';

// Settings Pages
import {
  SettingsLayout,
  GeneralSettings,
  FinanceSettings,
  ManageStoreSettings,
  OrdersNotificationsSettings,
  ShippingSettings,
  TaxesSettings,
} from './pages/settings';

// Storefront Editor
import { StorefrontEditor } from './pages/storefront-editor';

// Storefront (new structure)
import {
  StorefrontLayout,
  StoreHome,
  Catalog,
  ProductDetail,
  Cart,
  Checkout,
  OrderConfirmation
} from './storefront';

export default function App() {
  return (
    <Routes>

      {/* =========================================== */}
      {/* PUBLIC AUTH ROUTES                         */}
      {/* =========================================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* =========================================== */}
      {/* ONBOARDING (Protected but no merchant req) */}
      {/* =========================================== */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />

      {/* =========================================== */}
      {/* GROUP 1: ADMIN DASHBOARD ROUTES (PROTECTED)*/}
      {/* Requires authentication AND merchant        */}
      {/* =========================================== */}
      <Route element={
        <ProtectedRoute>
          <RequireMerchant>
            <AdminLayout />
          </RequireMerchant>
        </ProtectedRoute>
      }>
        <Route path="/" element={<HomePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/create" element={<ProductCreator />} />
        <Route path="/customers" element={<CustomersPage />} />

        {/* Marketing Routes */}
        <Route path="/marketing/email" element={<div className="p-8"><h1 className="text-2xl font-bold mb-2">Email Marketing</h1><p className="text-gray-500">Connect with your customers via email. Feature coming soon.</p></div>} />
        <Route path="/marketing/facebook" element={<div className="p-8"><h1 className="text-2xl font-bold mb-2">Facebook Marketing</h1><p className="text-gray-500">Manage your Facebook ads and posts. Feature coming soon.</p></div>} />
        <Route path="/marketing/tiktok" element={<div className="p-8"><h1 className="text-2xl font-bold mb-2">TikTok Marketing</h1><p className="text-gray-500">Create viral content on TikTok. Feature coming soon.</p></div>} />
      </Route>

      {/* =========================================== */}
      {/* GROUP 2: PUBLIC STOREFRONT ROUTES          */}
      {/* New: /s/:merchantSlug/*                    */}
      {/* =========================================== */}
      <Route path="/s/:merchantSlug" element={<StorefrontLayout />}>
        {/* /s/:merchantSlug → storefront home */}
        <Route index element={<StoreHome />} />

        {/* /s/:merchantSlug/products → product catalog */}
        <Route path="products" element={<Catalog />} />

        {/* /s/:merchantSlug/product/:productId → product detail */}
        <Route path="product/:productId" element={<ProductDetail />} />

        {/* /s/:merchantSlug/cart */}
        <Route path="cart" element={<Cart />} />

        {/* /s/:merchantSlug/checkout */}
        <Route path="checkout" element={<Checkout />} />

        {/* /s/:merchantSlug/order-confirmation/:orderId */}
        <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
      </Route>

      {/* =========================================== */}
      {/* STOREFRONT EDITOR (Protected + Merchant)   */}
      {/* =========================================== */}
      <Route path="/store/editor" element={
        <ProtectedRoute>
          <RequireMerchant>
            <StorefrontEditor />
          </RequireMerchant>
        </ProtectedRoute>
      } />

      {/* =========================================== */}
      {/* SETTINGS ROUTES (Protected, Custom Layout)*/}
      {/* =========================================== */}
      <Route path="/settings" element={
        <ProtectedRoute>
          <RequireMerchant>
            <SettingsLayout />
          </RequireMerchant>
        </ProtectedRoute>
      }>
        <Route path="general" element={<GeneralSettings />} />
        <Route path="finance" element={<FinanceSettings />} />
        <Route path="manage-store" element={<ManageStoreSettings />} />
        <Route path="orders-notifications" element={<OrdersNotificationsSettings />} />
        <Route path="shipping" element={<ShippingSettings />} />
        <Route path="taxes" element={<TaxesSettings />} />
        {/* Default redirect to general settings */}
        <Route index element={<GeneralSettings />} />
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1><p className="text-gray-600">The page you're looking for doesn't exist.</p></div></div>} />

    </Routes>
  );
}
