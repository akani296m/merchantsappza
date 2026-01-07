import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 1. Create the Context
const ProductContext = createContext();

// 2. Create the Provider (The "Box" wrapper)
export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from Supabase on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new product
  const addProduct = async (newProduct) => {
    try {
      // Insert into Supabase - let database handle created_at with default
      const { data, error } = await supabase
        .from('products')
        .insert([{
          title: newProduct.title,
          price: newProduct.price,
          description: newProduct.description,
          category: newProduct.category,
          inventory: newProduct.inventory,
          images: newProduct.images,
          tags: newProduct.tags,
          is_active: newProduct.is_active !== undefined ? newProduct.is_active : true
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state with the new product (prepend to maintain order)
      setProducts((prev) => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Function to edit an existing product
  const editProduct = async (id, updatedProduct) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          title: updatedProduct.title,
          price: updatedProduct.price,
          description: updatedProduct.description,
          category: updatedProduct.category,
          inventory: updatedProduct.inventory,
          images: updatedProduct.images,
          tags: updatedProduct.tags,
          is_active: updatedProduct.is_active,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p => p.id === id ? data : p));
      return { success: true, data };
    } catch (err) {
      console.error('Error editing product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Function to delete a product
  const deleteProduct = async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      editProduct,
      deleteProduct,
      loading,
      error,
      refetch: fetchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
}

// 3. Create a helper hook so it's easy to use
export function useProducts() {
  return useContext(ProductContext);
}