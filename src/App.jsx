import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProductContext } from './context/ProductContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductNewPage from './pages/ProductNewPage';
import ProductEditPage from './pages/ProductEditPage';

const API_BASE = 'https://dummyjson.com/products';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products once on load
  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}?limit=30`);
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        if (isMounted) {
          setProducts(data.products || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch products');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Categories derived dynamically from fetched products, not hardcoded
  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean).sort();

  // Add Product
  const addProduct = async (productData) => {
    const res = await fetch(`${API_BASE}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      throw new Error('Failed to add product');
    }
    const createdData = await res.json();

    // Assign unique id so list changes immediately without collision
    const nextId = Math.max(0, ...products.map((p) => Number(p.id) || 0)) + 1;
    const newProduct = {
      thumbnail: 'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
      description: 'No description available.',
      rating: 0,
      ...productData,
      ...createdData,
      id: nextId,
      local: true,
    };

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  // Update Product
  const updateProduct = async (id, productData) => {
    const target = products.find((p) => String(p.id) === String(id));
    if (target && !target.local) {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!res.ok) {
        throw new Error('Failed to update product');
      }
    }

    // Update state immediately
    setProducts((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, ...productData } : p))
    );
  };

  // Delete Product
  const deleteProduct = async (id) => {
    const target = products.find((p) => String(p.id) === String(id));
    if (target && !target.local) {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete product');
      }
    }

    // Update state immediately
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  };

  const contextValue = {
    products,
    loading,
    error,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductNewPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/products/:id/edit" element={<ProductEditPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProductContext.Provider>
  );
}
