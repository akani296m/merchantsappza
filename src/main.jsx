import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/authContext.jsx';
import { AdminMerchantProvider } from './context/adminMerchantContext.jsx';
import { ProductProvider } from './context/productcontext.jsx';
import { CollectionProvider } from './context/collectionContext.jsx';
import { CartProvider } from './context/cartcontext.jsx';
import { PostHogProvider } from 'posthog-js/react';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true,
        debug: import.meta.env.MODE === 'development',
      }}
    >
      <AuthProvider>
        <AdminMerchantProvider>
          <ProductProvider>
            <CollectionProvider>
              <CartProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </CartProvider>
            </CollectionProvider>
          </ProductProvider>
        </AdminMerchantProvider>
      </AuthProvider>
    </PostHogProvider>
  </React.StrictMode>
)