import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/authContext.jsx';
import { AdminMerchantProvider } from './context/adminMerchantContext.jsx';
import { ProductProvider } from './context/productcontext.jsx';
import { CartProvider } from './context/cartcontext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AdminMerchantProvider>
        <ProductProvider>
          <CartProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </CartProvider>
        </ProductProvider>
      </AdminMerchantProvider>
    </AuthProvider>
  </React.StrictMode>
)