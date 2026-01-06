import React, { createContext, useContext, useState } from 'react';

// 1. Create the Context
const ProductContext = createContext();

// 2. Create the Provider (The "Box" wrapper)
export function ProductProvider({ children }) {
  // This is where your products actually live
  const [products, setProducts] = useState([]);

  // Function to add a new product
  const addProduct = (newProduct) => {
    // We add an ID to the product so we can find it later
    const productWithId = { ...newProduct, id: Date.now().toString() };
    setProducts((prev) => [productWithId, ...prev]);
  };
  const editProduct = (id, updatedProduct) => {
  setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
};

const deleteProduct = (id) => {
  setProducts(prev => prev.filter(p => p.id !== id));
};

// Add to Provider value
<ProductContext.Provider value={{ products, addProduct, editProduct, deleteProduct }}></ProductContext.Provider>

  return (
    <ProductContext.Provider value={{ products, addProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

// 3. Create a helper hook so it's easy to use
export function useProducts() {
  return useContext(ProductContext);
}