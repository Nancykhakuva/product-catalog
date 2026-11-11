// Product Catalog - plain HTML/CSS/JS, hash-based routing.

const API = 'https://dummyjson.com/products';
const JSON_HEADERS = { 'Content-Type': 'application/json' };
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="16">No image</text></svg>'
  );

// Products live in one state object that every route reads.
const state = {
  products: [],
  loading: true,
  error: '',
  category: 'all',
};

const app = document.getElementById('app');

/* ---------- helpers ---------- */

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function hasToken() {
  return !!localStorage.getItem('token');
}

function go(path) {
  location.hash = '#' + path;
}

function findProduct(id) {
  return state.products.find((p) => p.id === Number(id));
}

function getCategories() {
  // Derived from the fetched products, not hardcoded.
  return [...new Set(state.products.map((p) => p.category))].sort();
}

const spinnerHTML = '<div class="spinner" role="status" aria-label="Loading"></div>';

/* ---------- data ---------- */

async function loadProducts() {
  try {
    const res = await fetch(`${API}?limit=30`);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const data = await res.json();
    state.products = data.products;
  } catch (err) {
    state.error = err.message || 'Something went wrong';
  } finally {
    state.loading = false;
    router();
  }
}

// DummyJSON does not persist writes, so after each successful call we update
// local state. Products added locally have ids the server doesn't know, so
// for those we skip the PUT/DELETE request (it would 404).
async function addProduct(data) {
  const res = await fetch(`${API}/add`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add product');
  // The API always returns the same new id, so generate a unique one.
  const id = Math.max(0, ...state.products.map((p) => p.id)) + 1;
  state.products.unshift({
    thumbnail: PLACEHOLDER,
    description: 'No description.',
    ...data,
    id,
    local: true,
  });
}

async function updateProduct(id, data) {
  const existing = findProduct(id);
  if (!existing.local) {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update product');
  }
  Object.assign(existing, data);
}

async function deleteProduct(id) {
  const existing = findProduct(id);
  if (!existing.local) {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
  }
  state.products = state.products.filter((p) => p.id !== Number(id));
}

/* ---------- views ---------- */

function layout(content) {
  return `
    <header class="header">
      <h1>Product Catalog</h1>
      <button class="btn" data-action="logout">Logout</button>
    </header>
    <main class="container">${content}</main>`;
}

function loginView() {
  app.innerHTML = `
    <div class="login-wrap">
      <form class="card form" id="login-form" novalidate>
        <h2>Login</h2>
        <label>Username <input name="username" /></label>
        <label>Password <input name="password" type="password" /></label>
        <p class="error" id="login-error"></p>
        <button class="btn primary" type="submit">Log in</button>
        <p class="hint">Any username and password will do.</p>
      </form>
    </div>`;
}

function listView() {
  if (state.loading) return (app.innerHTML = layout(spinnerHTML));
  if (state.error) {
    return (app.innerHTML = layout(`<p class="error">Error: ${esc(state.error)}</p>`));
  }

  const categories = getCategories();
  if (state.category !== 'all' && !categories.includes(state.category)) {
    state.category = 'all';
  }
  const visible =
    state.category === 'all'
      ? state.products
      : state.products.filter((p) => p.category === state.category);

  const options = categories
    .map((c) => `<option value="${esc(c)}" ${c === state.category ? 'selected' : ''}>${esc(c)}</option>`)
    .join('');

  const cards = visible
    .map(
      (p) => `
      <div class="card">
        <a href="#/products/${p.id}">
          <img src="${esc(p.thumbnail)}" alt="${esc(p.title)}" />
          <h3>${esc(p.title)}</h3>
        </a>
        <p class="price">$${Number(p.price).toFixed(2)}</p>
        <div class="actions">
          <button class="btn" data-nav="/products/${p.id}/edit">Edit</button>
          <button class="btn danger" data-action="delete" data-id="${p.id}">Delete</button>
        </div>
      </div>`
    )
    .join('');

  app.innerHTML = layout(`
    <div class="toolbar">
      <select id="category-filter">
        <option value="all">All categories</option>
        ${options}
      </select>
      <button class="btn primary" data-nav="/products/new">Add Product</button>
    </div>
    <p class="error" id="action-error"></p>
    ${visible.length === 0 ? '<p>No products found.</p>' : ''}
    <div class="grid">${cards}</div>`);
}

function detailView(id) {
  if (state.loading) return (app.innerHTML = layout(spinnerHTML));
  if (state.error) {
    return (app.innerHTML = layout(`<p class="error">Error: ${esc(state.error)}</p>`));
  }
  const p = findProduct(id);
  if (!p) return go('/'); // not in state -> back to the list

  app.innerHTML = layout(`
    <div class="card detail">
      <button class="btn" data-nav="/">Back</button>
      <img src="${esc(p.thumbnail)}" alt="${esc(p.title)}" />
      <h2>${esc(p.title)}</h2>
      <p class="price">$${Number(p.price).toFixed(2)}</p>
      <p><strong>Category:</strong> ${esc(p.category)}</p>
      <p><strong>Rating:</strong> ${esc(p.rating ?? 'N/A')}</p>
      <p>${esc(p.description)}</p>
      <p class="error" id="action-error"></p>
      <div class="actions">
        <button class="btn" data-nav="/products/${p.id}/edit">Edit</button>
        <button class="btn danger" data-action="delete-detail" data-id="${p.id}">Delete</button>
      </div>
    </div>`);
}

// One form for both "add" and "edit".
function formView(id) {
  if (state.loading) return (app.innerHTML = layout(spinnerHTML));
  if (state.error) {
    return (app.innerHTML = layout(`<p class="error">Error: ${esc(state.error)}</p>`));
  }
  const isEdit = id !== undefined;
  const p = isEdit ? findProduct(id) : null;
  if (isEdit && !p) return go('/'); // not in state -> back to the list

  const categoryOptions = getCategories().map((c) => `<option value="${esc(c)}"></option>`).join('');

  app.innerHTML = layout(`
    <form class="card form" id="product-form" data-id="${isEdit ? p.id : ''}" novalidate>
      <h2>${isEdit ? 'Edit Product' : 'Add Product'}</h2>
      <label>Title
        <input name="title" value="${isEdit ? esc(p.title) : ''}" />
        <span class="error" data-error="title"></span>
      </label>
      <label>Price
        <input name="price" type="number" step="0.01" value="${isEdit ? esc(p.price) : ''}" />
        <span class="error" data-error="price"></span>
      </label>
      <label>Category
        <input name="category" list="categories" value="${isEdit ? esc(p.category) : ''}" />
        <datalist id="categories">${categoryOptions}</datalist>
        <span class="error" data-error="category"></span>
      </label>
      <p class="error" id="submit-error"></p>
      <div class="actions">
        <button class="btn primary" type="submit" id="save-btn">Save</button>
        <button class="btn" type="button" data-nav="/">Cancel</button>
      </div>
    </form>`);
}

/* ---------- router ---------- */

function parseRoute() {
  const path = location.hash.replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean);

  if (path === '/login') return { name: 'login' };
  if (parts.length === 0) return { name: 'list' };
  if (parts[0] === 'products') {
    if (parts[1] === 'new' && parts.length === 2) return { name: 'new' };
    if (/^\d+$/.test(parts[1] || '')) {
      if (parts.length === 2) return { name: 'detail', id: parts[1] };
      if (parts.length === 3 && parts[2] === 'edit') return { name: 'edit', id: parts[1] };
    }
  }
  return { name: 'unknown' };
}

function router() {
  const route = parseRoute();

  // Auth guard
  if (route.name === 'login') {
    if (hasToken()) return go('/');
    return loginView();
  }
  if (!hasToken()) return go('/login');

  switch (route.name) {
    case 'list': return listView();
    case 'new': return formView();
    case 'detail': return detailView(route.id);
    case 'edit': return formView(route.id);
    default: return go('/');
  }
}

/* ---------- events (delegated) ---------- */

app.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-nav], [data-action]');
  if (!el) return;

  if (el.dataset.nav) return go(el.dataset.nav);

  const { action, id } = el.dataset;

  if (action === 'logout') {
    localStorage.removeItem('token');
    return go('/login');
  }

  if (action === 'delete' || action === 'delete-detail') {
    const product = findProduct(id);
    if (!product || !confirm(`Delete "${product.title}"?`)) return;
    try {
      await deleteProduct(id);
      if (action === 'delete-detail') go('/');
      else listView();
    } catch (err) {
      const box = document.getElementById('action-error');
      if (box) box.textContent = err.message;
    }
  }
});

app.addEventListener('change', (e) => {
  if (e.target.id === 'category-filter') {
    state.category = e.target.value;
    listView();
  }
});

app.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (e.target.id === 'login-form') {
    const { username, password } = e.target.elements;
    if (!username.value.trim() || !password.value.trim()) {
      document.getElementById('login-error').textContent = 'Username and password are required';
      return;
    }
    localStorage.setItem('token', 'dummy');
    return go('/');
  }

  if (e.target.id === 'product-form') {
    const form = e.target;
    const title = form.elements.title.value.trim();
    const priceRaw = form.elements.price.value;
    const price = Number(priceRaw);
    const category = form.elements.category.value.trim();

    const errors = {};
    if (!title) errors.title = 'Title is required';
    if (priceRaw === '' || Number.isNaN(price) || price <= 0) {
      errors.price = 'Price must be a positive number';
    }
    if (!category) errors.category = 'Category is required';

    form.querySelectorAll('[data-error]').forEach((span) => {
      span.textContent = errors[span.dataset.error] || '';
    });
    if (Object.keys(errors).length) return;

    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    try {
      const data = { title, price, category };
      if (form.dataset.id) await updateProduct(form.dataset.id, data);
      else await addProduct(data);
      go('/');
    } catch (err) {
      document.getElementById('submit-error').textContent = err.message;
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
  }
});

window.addEventListener('hashchange', router);

/* ---------- start ---------- */

router();
loadProducts(); // fetch once on load
