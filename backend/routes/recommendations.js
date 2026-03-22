import express from 'express';
import { Product } from '../models/Product.js';
import { ProductView } from '../models/ProductView.js';
import { applyBusinessRules } from '../recommender/rules.js';

const router = express.Router();

const SVD_SERVICE_URL = process.env.SVD_SERVICE_URL || 'http://localhost:8000';

/**
 * GET /api/recommendations
 * Query: currentProductId, limit, excludedProductIds (comma-separated)
 *
 * Flow:
 *   1. Call Python SVD service for ranked item IDs
 *   2. Fetch matching products from DB
 *   3. Apply business rules (price, category, rating, stock filters)
 *   4. Return filtered products to frontend
 *
 * Fallback: if SVD service is unavailable, return products sorted by rating.
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const userId = req.session?.userId || null;

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

    // Add currentProductId to exclusions if provided
    const currentProductId = req.query.currentProductId ?? null;
    if (currentProductId) {
      excludedProductIds.push(currentProductId);
    }

    // ── Try SVD service ─────────────────────────────────────
    let svdItemIds = null;
    let coldStart = true;

    try {
      const params = new URLSearchParams();
      if (userId) params.set('user_id', userId);
      params.set('limit', String(limit * 3)); // request more to allow for filtering
      if (excludedProductIds.length > 0) {
        params.set('exclude', excludedProductIds.join(','));
      }

      const response = await fetch(
        `${SVD_SERVICE_URL}/recommend?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        svdItemIds = data.item_ids || [];
        coldStart = data.cold_start ?? true;
      }
    } catch {
      // SVD service unavailable — will use fallback below
      console.warn(
        '[Recommendations] SVD service unavailable, using rating fallback'
      );
    }

    // ── Fetch products from DB ──────────────────────────────
    const allProducts = await Product.findAll();

    let recommendations;

    if (svdItemIds && svdItemIds.length > 0) {
      // Apply business rules first
      const eligible = applyBusinessRules(allProducts, {
        currentProductId,
        excludedProductIds,
      });

      // Build a set of eligible IDs for fast lookup
      const eligibleIds = new Set(eligible.map((p) => String(p.id)));

      // Keep SVD ordering, filter to only eligible products
      const eligibleMap = new Map(eligible.map((p) => [String(p.id), p]));

      recommendations = [];
      for (const itemId of svdItemIds) {
        if (eligibleIds.has(String(itemId)) && recommendations.length < limit) {
          recommendations.push(eligibleMap.get(String(itemId)));
        }
      }

      // If SVD gave fewer than limit after filtering, pad with eligible products
      if (recommendations.length < limit) {
        const usedIds = new Set(recommendations.map((p) => String(p.id)));
        for (const p of eligible) {
          if (!usedIds.has(String(p.id)) && recommendations.length < limit) {
            recommendations.push(p);
          }
        }
      }
    } else {
      // ── Fallback: sort by rating ────────────────────────────
      const eligible = applyBusinessRules(allProducts, {
        currentProductId,
        excludedProductIds,
      });

      recommendations = eligible
        .sort((a, b) => {
          const ratingA =
            typeof a.rating === 'object' ? a.rating.stars || 0 : a.rating || 0;
          const ratingB =
            typeof b.rating === 'object' ? b.rating.stars || 0 : b.rating || 0;
          return ratingB - ratingA;
        })
        .slice(0, limit);

      coldStart = true;
    }

    // Determine coldStart based on platform interactions, not SVD model knowledge
    // A logged-in user with browsing history is NOT a cold-start user
    if (userId) {
      const viewCount = await ProductView.count({ where: { userId } });
      if (viewCount > 0) {
        coldStart = false;
      }
    }

    res.json({ products: recommendations, coldStart });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to load recommendations' });
  }
});

export default router;
