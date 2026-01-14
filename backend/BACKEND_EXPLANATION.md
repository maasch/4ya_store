# Backend Basics Explained for Frontend Developers 🚀

## What is a Backend?

Think of the backend as the **"brain"** of your e-commerce application:
- **Frontend** = What users see and interact with (your React/Vue/Angular app)
- **Backend** = The server that stores data, processes requests, and sends responses

When a user clicks "Add to Cart" in your frontend, the frontend sends a request to the backend, which saves it to a database and responds with confirmation.

---

## Architecture Overview

This backend uses:
- **Node.js** - JavaScript runtime (lets you run JavaScript on a server)
- **Express.js** - Web framework (makes it easy to create APIs)
- **Sequelize** - Database ORM (Object-Relational Mapping - talks to databases easily)
- **SQLite** - Database (stores your data in a file)

```
┌─────────────┐         HTTP Requests          ┌─────────────┐
│   Frontend  │ ──────────────────────────────> │   Backend   │
│  (Browser)  │ <────────────────────────────── │  (Server)   │
└─────────────┘         JSON Responses          └─────────────┘
                                                       │
                                                       ▼
                                                ┌─────────────┐
                                                │  Database   │
                                                │  (SQLite)   │
                                                └─────────────┘
```

---

## How It Works: The Flow

### 1. **Server Starts** (`server.js`)

When you run `npm start`, the server:
- Creates an Express app
- Sets up middleware (CORS, JSON parsing)
- Connects to the database
- Loads default data if database is empty
- Listens on port 3000 for incoming requests

```javascript
// server.js - The main entry point
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

### 2. **Routes** - The API Endpoints

Routes are like **"doors"** to your backend. Each route handles a specific type of request.

**Example:** When your frontend calls `GET /api/products`, it goes to `routes/products.js`

```
Frontend Request:  GET http://localhost:3000/api/products
                          │
                          ▼
                   routes/products.js
                          │
                          ▼
                   Queries database for products
                          │
                          ▼
                   Returns JSON array of products
```

### 3. **Models** - Data Structure

Models define what your data looks like. Think of them as **"blueprints"** for your database tables.

**Example:** `models/Product.js` defines:
- What fields a product has (id, name, price, etc.)
- What types they are (string, number, UUID)
- Validation rules

```javascript
// models/Product.js
Product = {
  id: UUID,
  name: String,
  priceCents: Number,
  image: String,
  rating: { stars: Number, count: Number },
  keywords: Array
}
```

### 4. **Database** - Where Data Lives

- Uses **SQLite** (a file-based database) by default
- Data is stored in `database.sqlite` file
- When you add/update/delete data, it's saved to this file
- Can also use MySQL or PostgreSQL if configured

---

## API Endpoints Explained

### Products
```
GET /api/products
→ Returns all products
→ Can search: GET /api/products?search=laptop
```

### Cart Items
```
GET    /api/cart-items              → Get all cart items
POST   /api/cart-items              → Add item to cart
PUT    /api/cart-items/:productId   → Update cart item
DELETE /api/cart-items/:productId   → Remove from cart
```

### Orders
```
GET  /api/orders        → Get all orders
POST /api/orders        → Create order (checkout)
GET  /api/orders/:id    → Get specific order
```

### Other
```
GET  /api/delivery-options  → Get shipping options
GET  /api/payment-summary   → Calculate cart total
POST /api/reset             → Reset database to defaults
```

---

## How Frontend Communicates with Backend

### Example: Adding to Cart

**1. Frontend sends request:**
```javascript
// In your frontend code
fetch('http://localhost:3000/api/cart-items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'abc-123',
    quantity: 2
  })
})
```

**2. Backend receives request:**
```javascript
// routes/cartItems.js
router.post('/', async (req, res) => {
  const { productId, quantity } = req.body; // Extract data
  
  // Validate
  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }
  
  // Save to database
  const cartItem = await CartItem.create({ productId, quantity });
  
  // Send response back
  res.status(201).json(cartItem);
});
```

**3. Frontend receives response:**
```javascript
// Response:
{
  productId: 'abc-123',
  quantity: 2,
  deliveryOptionId: '1'
}
```

---

## Key Concepts

### HTTP Methods
- **GET** - Retrieve data (like reading)
- **POST** - Create new data (like writing)
- **PUT** - Update existing data (like editing)
- **DELETE** - Remove data (like deleting)

### Status Codes
- **200** - Success
- **201** - Created successfully
- **400** - Bad request (invalid data)
- **404** - Not found
- **500** - Server error

### Request/Response Format
- **Request Body** - Data sent TO backend (usually JSON)
- **Response Body** - Data sent FROM backend (usually JSON)
- **Query Parameters** - Extra info in URL (`?search=laptop`)
- **URL Parameters** - Part of URL path (`/orders/:orderId`)

---

## File Structure Explained

```
backend/
├── server.js              ← Main entry point, starts server
├── models/                ← Data structure definitions
│   ├── Product.js         ← Product model
│   ├── CartItem.js        ← Cart item model
│   ├── Order.js           ← Order model
│   └── index.js           ← Database connection setup
├── routes/                 ← API endpoints
│   ├── products.js         ← /api/products endpoints
│   ├── cartItems.js        ← /api/cart-items endpoints
│   ├── orders.js           ← /api/orders endpoints
│   └── ...
├── defaultData/            ← Initial data to load
│   ├── defaultProducts.js
│   └── ...
└── images/                 ← Static image files
```

---

## Common Patterns You'll See

### 1. **Async/Await**
Backend operations (like database queries) are asynchronous:
```javascript
const products = await Product.findAll(); // Wait for database
res.json(products); // Then send response
```

### 2. **Error Handling**
```javascript
if (!product) {
  return res.status(404).json({ error: 'Product not found' });
}
```

### 3. **Query Parameters**
```javascript
const search = req.query.search; // From ?search=laptop
const expand = req.query.expand; // From ?expand=product
```

### 4. **URL Parameters**
```javascript
const { productId } = req.params; // From /cart-items/:productId
```

---

## Testing the Backend

### Using Browser
- Visit `http://localhost:3000/api/products` to see products

### Using Postman/Thunder Client
- Send GET/POST/PUT/DELETE requests to test endpoints

### Using Frontend
- Make fetch/axios calls from your React/Vue app

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start server (development mode with auto-restart)
npm run dev

# Start server (production mode)
npm start
```

---

## Important Notes for Frontend Developers

1. **CORS** - Already enabled, so your frontend can call the API
2. **Port** - Backend runs on port 3000 by default
3. **Base URL** - `http://localhost:3000/api/` for all endpoints
4. **JSON** - All requests/responses use JSON format
5. **Database** - Resets when you restart? Check if `database.sqlite` exists

---

## Next Steps

1. **Start the server**: `npm run dev`
2. **Test endpoints**: Visit `http://localhost:3000/api/products` in browser
3. **Connect frontend**: Update your frontend API calls to point to `http://localhost:3000/api/`
4. **Read documentation.md**: See all available endpoints and their parameters

---

## Need Help?

- Check `documentation.md` for all API endpoints
- Check `troubleshooting.md` for common issues
- Look at route files to understand how each endpoint works
