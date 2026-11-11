import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import Spinner from '../components/Spinner';

const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="16">No image</text></svg>'
  );

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading, error, deleteProduct } = useProductContext();

  const [actionError, setActionError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const product = products.find((p) => String(p.id) === String(id));

  // Requirement: If a detail or edit page opens for a product that is not in state
  // (for example after a refresh), redirect to /
  useEffect(() => {
    if (!loading && !product) {
      navigate('/', { replace: true });
    }
  }, [loading, product, navigate]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="error-banner">
        Error: {error}
      </div>
    );
  }

  if (!product) {
    return null; // Will redirect via useEffect
  }

  const handleDelete = async () => {
    setActionError('');
    const confirmed = window.confirm(`Delete "${product.title}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteProduct(product.id);
      navigate('/');
    } catch (err) {
      setActionError(err.message || 'Failed to delete product');
      setDeleting(false);
    }
  };

  return (
    <div className="card detail" data-testid="product-detail">
      <button
        className="btn"
        onClick={() => navigate('/')}
        style={{ alignSelf: 'flex-start' }}
        data-testid="back-btn"
      >
        &larr; Back
      </button>

      <img
        src={product.thumbnail || PLACEHOLDER_IMG}
        alt={product.title}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = PLACEHOLDER_IMG;
        }}
        data-testid="detail-image"
      />

      <h2 data-testid="detail-title">{product.title}</h2>
      <p className="price" data-testid="detail-price">
        ${Number(product.price).toFixed(2)}
      </p>
      <p data-testid="detail-category">
        <strong>Category:</strong> {product.category}
      </p>
      <p data-testid="detail-rating">
        <strong>Rating:</strong> {product.rating !== undefined ? product.rating : 'N/A'}
      </p>
      <p data-testid="detail-description">{product.description || 'No description available.'}</p>

      {actionError && (
        <p className="error" data-testid="detail-action-error">
          {actionError}
        </p>
      )}

      <div className="actions" style={{ marginTop: '16px' }}>
        <button
          className="btn"
          onClick={() => navigate(`/products/${product.id}/edit`)}
          disabled={deleting}
          data-testid="detail-edit-btn"
        >
          Edit
        </button>
        <button
          className="btn danger"
          onClick={handleDelete}
          disabled={deleting}
          data-testid="detail-delete-btn"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

