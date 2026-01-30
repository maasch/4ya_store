/**
 * Popularity-based scoring for cold start (no user / no current product).
 * Uses ProductView counts (most viewed) and optionally order counts (most purchased).
 * All views count, including anonymous (userId null).
 */

/**
 * Builds a map of productId -> view count from ProductView records.
 * Includes every view (logged-in and anonymous).
 *
 * @param {Array<{ productId: string }>} productViews
 * @returns {Map<string, number>}
 */
function viewCountsByProduct(productViews = []) {
  const counts = new Map();
  for (const v of productViews) {
    const id = String(v.productId);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

/**
 * Builds a map of productId -> order count from Order.products JSON.
 * Use for “most purchased” signal when orders are available.
 *
 * @param {Array<{ products: Array<{ productId: string, quantity?: number }> }>} orders
 * @returns {Map<string, number>}
 */
function orderCountsByProduct(orders = []) {
  const counts = new Map();
  for (const order of orders) {
    const items = order.products ?? [];
    for (const item of items) {
      const id = String(item.productId);
      const q = Math.max(0, Number(item.quantity) || 1);
      counts.set(id, (counts.get(id) ?? 0) + q);
    }
  }
  return counts;
}

/**
 * Scores eligible products by popularity: views + optional order counts.
 * Higher view count (and order count if provided) = higher score.
 * Sorted descending by score.
 *
 * @param {Object[]} eligibleProducts - Products already filtered by business rules
 * @param {Array<{ productId: string }>} [productViews] - ProductView records
 * @param {Map<string, number>} [orderProductCounts] - Optional productId -> order quantity (from Order.products)
 * @returns {Array<{ product: object, score: number }>}
 */
function scoreByPopularity(eligibleProducts, productViews = [], orderProductCounts = null) {
  if (!Array.isArray(eligibleProducts)) return [];

  const viewCounts = viewCountsByProduct(productViews);
  const orderCounts = orderProductCounts ?? new Map();

  const scored = eligibleProducts.map((p) => {
    const id = String(p.id);
    const views = viewCounts.get(id) ?? 0;
    const orders = orderCounts.get(id) ?? 0;
    const score = views + 2 * orders;
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export { scoreByPopularity, viewCountsByProduct, orderCountsByProduct };
