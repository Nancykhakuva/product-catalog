import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import ProductForm from '../components/ProductForm';
import Spinner from '../components/Spinner';

export default function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading, error, updateProduct } = useProductContext();

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

  const handleUpdate = async (data) => {
    await updateProduct(product.id, data);
    navigate('/');
  };

  return <ProductForm isEdit={true} initialValues={product} onSubmit={handleUpdate} />;
}
