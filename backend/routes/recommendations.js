import express from 'express';
import { CartItem } from '../models/CartItem.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ProductView } from '../models/ProductView.js';
import {
  getRecommendations,
  orderCountsByProduct,
} from '../recommender/index.js';

const router = express.Router();

/**
 * GET /api/recommendations
 * Query: currentProductId, limit, excludedProductIds (comma-separated)
 *
 * - Logged-in, no currentProductId: use last viewed product as reference (content + collaborative).
 * - No user / no current product (cold start): rank by popularity (most viewed, + most purchased from orders).
 * - Cart product IDs are always excluded. Orders feed “most purchased” for cold start.
 */
router.get('/', async (req, res) => {
  try {
    let currentProductId = req.query.currentProductId ?? null;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    let excludedProductIds = [];

    if (
      typeof req.query.excludedProductIds === 'string' &&
      req.query.excludedProductIds
    ) {
      excludedProductIds = req.query.excludedProductIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    }

    if (!currentProductId && req.session?.userId) {
      const lastView = await ProductView.findOne({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']],
        attributes: ['productId'],
      });
      if (lastView) currentProductId = lastView.productId;
    }

    const [products, productViews, cartItems, orders] = await Promise.all([
      Product.findAll(),
      ProductView.findAll({ raw: true, attributes: ['userId', 'productId'] }),
      CartItem.findAll({ attributes: ['productId'] }),
      Order.findAll({ attributes: ['products'] }),
    ]);

    const cartIds = cartItems.map((c) => String(c.productId));
    excludedProductIds = [...new Set([...excludedProductIds, ...cartIds])];

    const orderProductCounts = orderCountsByProduct(orders);

    const recommendations = getRecommendations({
      products,
      productViews,
      orderProductCounts,
      context: {
        currentProductId,
        excludedProductIds: excludedProductIds.length
          ? excludedProductIds
          : undefined,
        limit,
      },
    });

    const coldStart = !currentProductId;
    res.json({ products: recommendations, coldStart });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to load recommendations' });
  }
});

export default router;
