import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

export default function ProductListPage() {
  const navigate = useNavigate();
  const { products, loading, error, categories, deleteProduct } = useProductContext();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [actionError, setActionError] = useState('');

  const handleDelete = async (id, title) => {
    setActionError('');
    const confirmed = window.confirm(`Delete "${title}"?`);
    if (!confirmed) return;

    try {
      await deleteProduct(id);
    } catch (err) {
      setActionError(err.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="error-banner" data-testid="fetch-error">
        Error: {error}
      </div>
    );
  }

  // Ensure selected category is valid if products changed
  const activeCategory =
    selectedCategory !== 'all' && !categories.includes(selectedCategory)
      ? 'all'
      : selectedCategory;

  const visibleProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div>
      <div className="toolbar">
        <select
          id="category-filter"
          value={activeCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          data-testid="category-filter"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          className="btn primary"
          onClick={() => navigate('/products/new')}
          data-testid="add-product-btn"
        >
          Add Product
        </button>
      </div>

      {actionError && (
        <p className="error" style={{ marginBottom: '16px' }} data-testid="action-error">
          {actionError}
        </p>
      )}

      {visibleProducts.length === 0 ? (
        <p data-testid="empty-message">No products found.</p>
      ) : (
        <div className="grid">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

