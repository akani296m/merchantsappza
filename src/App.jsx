import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';

// Layouts
import AdminLayout from './components/adminlayout';
import StoreLayout from './components/storelayout';

// Pages
import HomePage from './pages/home';
import OrdersPage from './pages/orders';
import OrderDetail from './pages/orderdetail';
import ProductCreator from './pages/products';
import ProductPreview from './pages/productpreview'; // <--- 1. Import it
import ProductsPage from './pages/productlisting'; // Import the new file
import Onboarding from './pages/onboarding'; // <--- Import it
// Store Pages (Create these empty files first if you haven't!)
import StoreHome from './pages/store/StoreHome';
import Catalog from './pages/store/Catalog';
import ProductDetail from './pages/store/ProductDetail';
import Cart from './pages/store/Cart';
import Checkout from './pages/store/Checkout';
import OrderConfirmation from './pages/store/OrderConfirmation';

export default function App() {
  return (



    <Routes>

      {/* --- GROUP 1: ADMIN DASHBOARD ROUTES --- */}
      <Route element={<AdminLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/create" element={<ProductCreator />} />
      </Route>

      {/* --- GROUP 2: STOREFRONT ROUTES --- */}
      <Route path="/store" element={<StoreLayout />}>
        {/* Index means this is the default page for /store */}
        <Route index element={<StoreHome />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-confirmation" element={<OrderConfirmation />} />
      </Route>

      {/* --- GROUP 3: FULL SCREEN PAGES (No Layout) --- */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* 404 Catch-all */}
      <Route path="*" element={<div>Page Not Found</div>} />

    </Routes>
  );
}
