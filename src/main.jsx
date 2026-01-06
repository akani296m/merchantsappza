import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ProductProvider } from './context/productcontext.jsx'; // <--- Import this

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProductProvider> {/* <--- Wrap Everything Here */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ProductProvider>
  </React.StrictMode>
)