/**
 * Hybrid recommendation orchestrator.
 * Applies business rules → then either:
 * - Cold start (no user / no current product): popularity (most viewed, optional most purchased)
 * - Logged-in with context: content-based + collaborative → hybrid merge → top N
 */

import { applyBusinessRules } from './rules.js';
import { scoreByContent } from './contentBased.js';
import { scoreByBehavior } from './collaborative.js';
import { scoreByPopularity } from './popularity.js';
import { mergeAndRank, topN } from './utils.js';

const DEFAULT_LIMIT = 10;
const DEFAULT_CONTENT_WEIGHT = 0.5;
const DEFAULT_COLLAB_WEIGHT = 0.5;

/**
 * Returns top-N product recommendations.
 * - Cold start (no currentProductId): rank by popularity (views + optional orders).
 * - With currentProductId: content-based + collaborative hybrid.
 *
 * @param {Object} options
 * @param {Object[]} options.products - All products (e.g. from Product.findAll())
 * @param {Array<{ userId?: string | null, productId: string }>} [options.productViews] - For “also viewed” and popularity
 * @param {Map<string, number>} [options.orderProductCounts] - Optional productId -> order quantity (cold start “most purchased”)
 * @param {Object} [options.context]
 * @param {string} [options.context.currentProductId] - Current product (excluded; reference for similarity / co-views)
 * @param {string[]} [options.context.excludedProductIds] - e.g. cart items, to exclude
 * @param {number} [options.context.maxPriceCents]
 * @param {number} [options.context.limit]
 * @param {number} [options.context.contentWeight]
 * @param {number} [options.context.collaborativeWeight]
 * @returns {Object[]} Recommended products (top N)
 */
function getRecommendations({
  products = [],
  productViews = [],
  orderProductCounts = null,
  context = {},
}) {
  const ctx = { ...context };
  const limit = ctx.limit ?? DEFAULT_LIMIT;
  const currentProductId = ctx.currentProductId ?? null;

  const eligible = applyBusinessRules(products, ctx);
  if (eligible.length === 0) return [];

  if (!currentProductId) {
    const scored = scoreByPopularity(
      eligible,
      productViews,
      orderProductCounts
    );
    return topN(scored, limit).map(({ product }) => product);
  }

  const contentWeight = ctx.contentWeight ?? DEFAULT_CONTENT_WEIGHT;
  const collaborativeWeight = ctx.collaborativeWeight ?? DEFAULT_COLLAB_WEIGHT;
  const referenceProduct =
    products.find((p) => String(p.id) === String(currentProductId)) ?? null;

  const contentScored = scoreByContent(eligible, referenceProduct);
  const collabScored = scoreByBehavior(
    eligible,
    currentProductId,
    productViews
  );
  const merged = mergeAndRank(
    contentScored,
    collabScored,
    contentWeight,
    collaborativeWeight
  );
  const top = topN(merged, limit);

  return top.map(({ product }) => product);
}

export { getRecommendations };
export { applyBusinessRules } from './rules.js';
export { scoreByContent } from './contentBased.js';
export { scoreByBehavior } from './collaborative.js';
export { scoreByPopularity, orderCountsByProduct } from './popularity.js';
export { mergeAndRank, normalizeMinMax, topN } from './utils.js';
