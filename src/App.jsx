import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Admin Layouts & Components
import AdminLayout from './components/adminlayout';

// Admin Pages
import HomePage from './pages/home';
import OrdersPage from './pages/orders';
import OrderDetail from './pages/orderdetail';
import ProductCreator from './pages/products';
import ProductsPage from './pages/productlisting';
import Onboarding from './pages/onboarding';

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
      {/* GROUP 1: ADMIN DASHBOARD ROUTES            */}
      {/* Unchanged - still at /admin/* or root      */}
      {/* =========================================== */}
      <Route element={<AdminLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/create" element={<ProductCreator />} />
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
      {/* GROUP 3: FULL SCREEN PAGES (No Layout)     */}
      {/* =========================================== */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* 404 Catch-all */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1><p className="text-gray-600">The page you're looking for doesn't exist.</p></div></div>} />

    </Routes>
  );
}
