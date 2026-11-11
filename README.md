# Product Catalog (HTML, CSS, JavaScript)

A small product catalog with a dummy login, a category filter, and add / edit / delete. Data comes from the free [DummyJSON](https://dummyjson.com) API (no key needed). No frameworks, no build step.

## Run it

Open `index.html` in your browser, or serve the folder (recommended):

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

Or use the VS Code "Live Server" extension. Log in with any username and password.

## Files

```
index.html       page shell
css/style.css    styles
js/app.js        state, API calls, views, hash router, event handlers
```

## Routes (hash-based)

| Route | Description |
| --- | --- |
| `#/login` | Dummy login. Saves `localStorage.token = 'dummy'`, then goes to `#/`. |
| `#/` | Protected. Product cards, loading spinner, category dropdown, Add / Edit / Delete. |
| `#/products/new` | Protected. Add form. |
| `#/products/:id` | Protected. Product detail with Back, Edit, Delete. |
| `#/products/:id/edit` | Protected. Same form as add, pre-filled. |

Protected routes redirect to `#/login` when there is no token. Logout clears it.
Hash routes are used so refreshing a page works on a plain static server or GitHub Pages.

## How it works

- Products are fetched once on load (`GET /products?limit=30`) into a single `state` object that every route reads.
- Categories for the dropdown are derived from the fetched products.
- Add / edit / delete call the matching endpoint, then update `state` and re-render so the list changes immediately.
- Delete asks for confirmation. Validation: title required, price a positive number, category required.
- If a detail or edit page is opened for an id that isn't in state, the app redirects to `#/`.

## Notes

- DummyJSON does not persist writes, so changes live only in the page's memory and reset on refresh.
- Added products get a locally generated id (the API returns the same id every time). Editing or deleting those skips the network call because the server doesn't know about them.
