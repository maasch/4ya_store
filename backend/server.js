import SequelizeStore from 'connect-session-sequelize';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultDeliveryOptions } from './defaultData/defaultDeliveryOptions.js';
import { defaultProducts } from './defaultData/defaultProducts.js';

import { DeliveryOption } from './models/DeliveryOption.js';

import { Product } from './models/Product.js';
import { migrator } from './migrations.js';

import { sequelize } from './models/index.js';

import cartItemRoutes from './routes/cartItems.js';
import deliveryOptionRoutes from './routes/deliveryOptions.js';
import login from './routes/login.js';
import orderRoutes from './routes/orders.js';
import paymentSummaryRoutes from './routes/paymentSummary.js';
import productRoutes from './routes/products.js';
import recommendationRoutes from './routes/recommendations.js';
import register from './routes/register.js';
import resetRoutes from './routes/reset.js';

const app = express();
const PORT = process.env.PORT || 3691;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Configure sessions
const SessionStore = SequelizeStore(session.Store);
const sessionStore = new SessionStore({
  db: sequelize,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'adelex-development-secret-only',
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Serve images from the images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// Use routes
app.use('/api/products', productRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/delivery-options', deliveryOptionRoutes);
app.use('/api/cart-items', cartItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/payment-summary', paymentSummaryRoutes);
app.use('/api/users', register);
app.use('/api/login', login);

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

// Error handling middleware
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
/* eslint-enable no-unused-vars */

// Sync database and load default data if none exist
// NOTE: `alter: true` can trigger table rebuilds that fail with FK constraints in SQLite.
// Use `/api/reset` (force sync) or set `DB_SYNC_ALTER=true` when you explicitly want schema alteration.
const shouldAlter = process.env.DB_SYNC_ALTER === 'true';
await sequelize.sync(shouldAlter ? { alter: true } : undefined);

try {
  await migrator.up();
  console.log('Migrations executed successfully.');
} catch (error) {
  console.error('Failed to run migrations', error);
}

const productCount = await Product.count();
if (productCount === 0) {
  const timestamp = Date.now();

  const productsWithTimestamps = defaultProducts.map((product, index) => ({
    ...product,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index),
  }));

  const deliveryOptionsWithTimestamps = defaultDeliveryOptions.map(
    (option, index) => ({
      ...option,
      createdAt: new Date(timestamp + index),
      updatedAt: new Date(timestamp + index),
    })
  );

  await Product.bulkCreate(productsWithTimestamps);
  await DeliveryOption.bulkCreate(deliveryOptionsWithTimestamps);
  console.log('Default data added to the database.');
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Another process may be running.`
    );
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});
