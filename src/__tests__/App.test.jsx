import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../App';

const mockProducts = [
  {
    id: 1,
    title: 'Test Essence Mascara',
    description: 'A great test mascara',
    category: 'beauty',
    price: 9.99,
    rating: 4.5,
    thumbnail: 'https://example.com/mascara.jpg',
  },
  {
    id: 2,
    title: 'Test Cologne',
    description: 'A pleasant test fragrance',
    category: 'fragrances',
    price: 49.99,
    rating: 4.8,
    thumbnail: 'https://example.com/cologne.jpg',
  },
];

describe('Product Catalog App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    global.fetch = vi.fn((url, options) => {
      const urlStr = String(url);

      if (urlStr.includes('/products?limit=30')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ products: [...mockProducts] }),
        });
      }

      if (urlStr.endsWith('/products/add') && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ id: 195, ...body }),
        });
      }

      if (urlStr.includes('/products/') && options?.method === 'PUT') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 1, ...body }),
        });
      }

      if (urlStr.includes('/products/') && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 1, isDeleted: true }),
        });
      }

      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated user to /login', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('login-username')).toBeInTheDocument();
  });

  it('validates login form inputs', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('login-submit'));
    expect(screen.getByTestId('login-error')).toHaveTextContent('Username and password are required');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('logs in successfully, sets token, and navigates to product list', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId('login-username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-submit'));

    expect(localStorage.getItem('token')).toBe('dummy');

    await waitFor(() => {
      expect(screen.getByText('Product Catalog')).toBeInTheDocument();
    });

    expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
    expect(screen.getByTestId('category-filter')).toBeInTheDocument();
  });

  it('loads products and derives categories dynamically', async () => {
    localStorage.setItem('token', 'dummy');

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Initial fetch shows products
    await waitFor(() => {
      expect(screen.getByText('Test Essence Mascara')).toBeInTheDocument();
      expect(screen.getByText('Test Cologne')).toBeInTheDocument();
    });

    // Check categories derived dynamically
    const filter = screen.getByTestId('category-filter');
    expect(filter).toContainElement(screen.getByRole('option', { name: 'All categories' }));
    expect(filter).toContainElement(screen.getByRole('option', { name: 'beauty' }));
    expect(filter).toContainElement(screen.getByRole('option', { name: 'fragrances' }));

    // Filter by category
    fireEvent.change(filter, { target: { value: 'beauty' } });
    expect(screen.getByText('Test Essence Mascara')).toBeInTheDocument();
    expect(screen.queryByText('Test Cologne')).not.toBeInTheDocument();
  });

  it('logs out and redirects to /login', async () => {
    localStorage.setItem('token', 'dummy');

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('logout-btn'));

    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('validates product form and adds a new product', async () => {
    localStorage.setItem('token', 'dummy');

    render(
      <MemoryRouter initialEntries={['/products/new']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-form')).toBeInTheDocument();
    });

    // Submit empty to test validation
    fireEvent.click(screen.getByTestId('save-btn'));
    expect(screen.getByTestId('error-title')).toHaveTextContent('Title is required');
    expect(screen.getByTestId('error-price')).toHaveTextContent('Price must be a positive number');
    expect(screen.getByTestId('error-category')).toHaveTextContent('Category is required');

    // Fill valid data
    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Brand New Serum' } });
    fireEvent.change(screen.getByTestId('input-price'), { target: { value: '25.50' } });
    fireEvent.change(screen.getByTestId('input-category'), { target: { value: 'skincare' } });

    fireEvent.click(screen.getByTestId('save-btn'));

    // Should navigate back to list and show new item
    await waitFor(() => {
      expect(screen.getByText('Brand New Serum')).toBeInTheDocument();
    });
  });

  it('shows product detail view and handles back button', async () => {
    localStorage.setItem('token', 'dummy');

    render(
      <MemoryRouter initialEntries={['/products/1']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('detail-title')).toHaveTextContent('Test Essence Mascara');
    });

    expect(screen.getByTestId('detail-price')).toHaveTextContent('$9.99');
    expect(screen.getByTestId('detail-category')).toHaveTextContent('beauty');
    expect(screen.getByTestId('detail-rating')).toHaveTextContent('4.5');
    expect(screen.getByTestId('detail-description')).toHaveTextContent('A great test mascara');

    fireEvent.click(screen.getByTestId('back-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    });
  });

  it('redirects to / when detail page is opened for nonexistent product id', async () => {
    localStorage.setItem('token', 'dummy');

    render(
      <MemoryRouter initialEntries={['/products/999999']}>
        <App />
      </MemoryRouter>
    );

    // After products load, if id not found, redirect to /
    await waitFor(() => {
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    });
  });

  it('edits a product and updates state', async () => {
    localStorage.setItem('token', 'dummy');

    render(
      <MemoryRouter initialEntries={['/products/1/edit']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('input-title')).toHaveValue('Test Essence Mascara');
    });

    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Updated Mascara Deluxe' } });
    fireEvent.click(screen.getByTestId('save-btn'));

    await waitFor(() => {
      expect(screen.getByText('Updated Mascara Deluxe')).toBeInTheDocument();
    });
  });

  it('deletes a product after confirmation', async () => {
    localStorage.setItem('token', 'dummy');
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Essence Mascara')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-btn-1'));

    await waitFor(() => {
      expect(screen.queryByText('Test Essence Mascara')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Test Cologne')).toBeInTheDocument();
  });
});

