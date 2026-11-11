import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import ProductForm from '../components/ProductForm';

export default function ProductNewPage() {
  const navigate = useNavigate();
  const { addProduct } = useProductContext();

  const handleAdd = async (data) => {
    await addProduct(data);
    navigate('/');
  };

  return <ProductForm isEdit={false} onSubmit={handleAdd} />;
}
