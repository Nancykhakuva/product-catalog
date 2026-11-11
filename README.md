# Product Catalog (React)

A React single-page application called **Product Catalog** featuring dummy authentication, dynamic product listing with category filtering, detailed product views, and full CRUD operations (add, edit, delete). Built using **React Hooks** (`useState`, `useEffect`, `useParams`, `useNavigate`) and **React Router v6**. Data is sourced from the free [DummyJSON](https://dummyjson.com) API.

---

## Features & Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Dummy login form. Validates credentials, sets `localStorage.setItem('token', 'dummy')`, and redirects to `/`. |
| `/` | Protected | Displays product cards (thumbnail image, title, price), loading spinner during fetch, category dropdown filter, "Add Product" button, and Edit/Delete buttons on each card. |
| `/products/new` | Protected | Form to add a new product (title, price, category) with validation. Sends `POST https://dummyjson.com/products/add` and updates local state immediately. |
| `/products/:id` | Protected | Product detail view displaying image, title, price, category, rating, description, a "Back" button, and Edit/Delete buttons. Redirects to `/` if product is not in state. |
| `/products/:id/edit` | Protected | Edit form pre-filled with the selected product's information. Sends `PUT https://dummyjson.com/products/{id}` and updates local state immediately. Redirects to `/` if product is not in state. |

---

## Technical Requirements Fulfilled

### 1. Authentication
- On login, saves dummy token: `localStorage.setItem('token', 'dummy')`
- Protected routes redirect unauthenticated users to `/login`
- "Logout" button in header clears the token (`localStorage.removeItem('token')`) and navigates to `/login` using `useNavigate()`

### 2. Data & Category Filtering
- Products are fetched once on initial load via `GET https://dummyjson.com/products?limit=30`
- Displays a loading spinner while fetching, and an error message if the network request fails
- Product state is held centrally in `App` and shared via `ProductContext` and route context
- Categories for the dropdown filter are derived dynamically from the fetched products (`[...new Set(products.map(p => p.category))].sort()`), not hardcoded

### 3. Add, Edit, and Delete
- Reusable `ProductForm` component shared between Add (`/products/new`) and Edit (`/products/:id/edit`)
- Validation:
  - `title` is required
  - `price` must be a positive number (`> 0`)
  - `category` is required
- API Integration:
  - Add: `POST https://dummyjson.com/products/add`
  - Update: `PUT https://dummyjson.com/products/{id}`
  - Delete: `DELETE https://dummyjson.com/products/{id}`
- State updates immediately so the product list reflects changes instantly
- Deletion prompts for confirmation (`window.confirm`) before removing
- If a detail or edit page opens for a product not in state (e.g. after a page refresh or bad ID), it automatically redirects to `/`

### 4. Required Hooks
- `useState`: Form fields, validation errors, active category filter, products list, loading state, error state
- `useEffect`: Fetching initial product catalog on mount, redirecting on missing state, login guard
- `useParams`: Extracting `:id` parameter in `ProductDetailPage` and `ProductEditPage`
- `useNavigate`: Programmatic navigation on login, logout, add/edit form submission, delete, and cancel/back actions

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Navigate to the project directory
cd product-catalog-js

# Install dependencies
npm install
```

### Running in Development Mode
```bash
npm run dev
# Starts Vite dev server (typically at http://localhost:3000 or http://localhost:5173)
```

### Running the Test Suite
```bash
npm test
# Runs Vitest unit and integration test suite
```

### Building for Production
```bash
npm run build
# Compiles and optimizes assets into dist/
```

### Previewing the Production Build
```bash
npm run preview
# Serves the production build locally
```

---

## Project Structure

```
product-catalog-js/
├── index.html                     # HTML page template
├── package.json                   # Project metadata and dependencies
├── vite.config.js                 # Vite & Vitest configuration
├── src/
│   ├── main.jsx                   # React DOM entry point with BrowserRouter
│   ├── App.jsx                    # Root component, state management, routes
│   ├── index.css                  # Global styles and responsive layout
│   ├── setupTests.js              # Test configuration and Jest DOM matchers
│   ├── context/
│   │   └── ProductContext.jsx     # Shared context for product state & handlers
│   ├── components/
│   │   ├── Header.jsx             # Top bar with title and Logout button
│   │   ├── ProtectedRoute.jsx     # Auth guard component
│   │   ├── Spinner.jsx            # Loading indicator
│   │   ├── ProductCard.jsx        # Individual product card in grid
│   │   └── ProductForm.jsx        # Form component shared by Add and Edit
│   ├── pages/
│   │   ├── LoginPage.jsx          # Dummy login page
│   │   ├── ProductListPage.jsx    # Home page with category filter and grid
│   │   ├── ProductDetailPage.jsx  # Single product detail view
│   │   ├── ProductNewPage.jsx     # Add product page
│   │   └── ProductEditPage.jsx    # Edit product page
│   └── __tests__/
│       └── App.test.jsx           # Full suite of unit & integration tests
```
