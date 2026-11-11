import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="16">No image</text></svg>'
  );

export default function ProductCard({ product, onDelete }) {
  const navigate = useNavigate();

  const priceFormatted = Number(product.price).toFixed(2);

  return (
    <div className="card" data-testid={`product-card-${product.id}`}>
      <Link to={`/products/${product.id}`} className="card-link">
        <img
          src={product.thumbnail || PLACEHOLDER_IMG}
          alt={product.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMG;
          }}
        />
        <h3 title={product.title}>{product.title}</h3>
      </Link>
      <p className="price">${priceFormatted}</p>
      <div className="actions">
        <button
          className="btn"
          onClick={() => navigate(`/products/${product.id}/edit`)}
          data-testid={`edit-btn-${product.id}`}
        >
          Edit
        </button>
        <button
          className="btn danger"
          onClick={() => onDelete(product.id, product.title)}
          data-testid={`delete-btn-${product.id}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
