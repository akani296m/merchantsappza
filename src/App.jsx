import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';

// Pages
import HomePage from './pages/home';
import OrdersPage from './pages/orders';
import ProductCreator from './pages/products';
import ProductPreview from './pages/productpreview'; // <--- 1. Import it
import ProductsPage from './pages/productlisting'; // Import the new file
import Onboarding from './pages/onboarding'; // <--- Import it

export default function App() {
  return (
    <div className="flex h-screen bg-[#F6F6F7]">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products/create" element={<ProductCreator />} />
          
          {/* 2. Add the Route */}
          <Route path="/store/product-preview" element={<ProductPreview />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          
          <Route path="*" element={<div className="p-10">Page not found.</div>} />
        </Routes>
      </main>
    </div>
  );
}
