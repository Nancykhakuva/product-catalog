import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';

export default function ProductForm({ isEdit = false, initialValues = null, onSubmit }) {
  const navigate = useNavigate();
  const { categories } = useProductContext();

  const [title, setTitle] = useState(initialValues?.title || '');
  const [price, setPrice] = useState(initialValues?.price !== undefined ? String(initialValues.price) : '');
  const [category, setCategory] = useState(initialValues?.category || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors = {};
    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const numPrice = Number(price);

    if (!trimmedTitle) {
      newErrors.title = 'Title is required';
    }

    if (price === '' || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!trimmedCategory) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        price: Number(price),
        category: category.trim(),
      });
    } catch (err) {
      setSubmitError(err.message || 'An error occurred while saving the product');
      setSubmitting(false);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate data-testid="product-form">
      <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>

      <label>
        Title
        <input
          name="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          disabled={submitting}
          data-testid="input-title"
        />
        {errors.title && <span className="error" data-testid="error-title">{errors.title}</span>}
      </label>

      <label>
        Price
        <input
          name="price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
          }}
          disabled={submitting}
          data-testid="input-price"
        />
        {errors.price && <span className="error" data-testid="error-price">{errors.price}</span>}
      </label>

      <label>
        Category
        <input
          name="category"
          type="text"
          list="category-suggestions"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
          }}
          disabled={submitting}
          data-testid="input-category"
        />
        <datalist id="category-suggestions">
          {categories.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
        {errors.category && <span className="error" data-testid="error-category">{errors.category}</span>}
      </label>

      {submitError && (
        <p className="error" data-testid="submit-error">
          {submitError}
        </p>
      )}

      <div className="actions">
        <button
          className="btn primary"
          type="submit"
          disabled={submitting}
          data-testid="save-btn"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => navigate('/')}
          disabled={submitting}
          data-testid="cancel-btn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
