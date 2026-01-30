/**
 * Collaborative-style scoring: “users who viewed X also viewed Y.”
 * Uses ProductView data (userId, productId). Users with no userId (anonymous) are skipped.
 */

/**
 * Scores eligible products by co-view frequency with the current product.
 * For each user who viewed currentProductId, we count how often they also viewed
 * each eligible product. Score = total co-view count per product.
 *
 * @param {Object[]} eligibleProducts - Filtered products to score
 * @param {string|null} currentProductId - Product we’re recommending “similar” for (e.g. currently viewed)
 * @param {Array<{ userId?: string | null, productId: string }>} productViews - ProductView records
 * @returns {Array<{ product: object, score: number }>} Same products with behavior-based scores
 */
function scoreByBehavior(eligibleProducts, currentProductId, productViews = []) {
  if (!Array.isArray(eligibleProducts)) return [];
  if (!currentProductId || !productViews.length) {
    return eligibleProducts.map((p) => ({ product: p, score: 0 }));
  }

  const curId = String(currentProductId);
  const eligibleIds = new Set(eligibleProducts.map((p) => String(p.id)));

  // userId -> Set of productIds they viewed
  const byUser = new Map();
  for (const v of productViews) {
    const uid = v.userId;
    if (uid == null) continue;
    const key = String(uid);
    if (!byUser.has(key)) byUser.set(key, new Set());
    byUser.get(key).add(String(v.productId));
  }

  // Users who viewed current product
  const usersWhoViewedCurrent = [...byUser.entries()]
    .filter(([, ids]) => ids.has(curId))
    .map(([u]) => u);

  // For each eligible product, count how many of those users also viewed it
  const scoreMap = new Map();
  for (const p of eligibleProducts) scoreMap.set(String(p.id), 0);

  for (const uid of usersWhoViewedCurrent) {
    const viewed = byUser.get(uid);
    for (const pid of viewed) {
      if (pid !== curId && eligibleIds.has(pid)) {
        scoreMap.set(pid, (scoreMap.get(pid) ?? 0) + 1);
      }
    }
  }

  return eligibleProducts.map((p) => ({
    product: p,
    score: scoreMap.get(String(p.id)) ?? 0,
  }));
}

export { scoreByBehavior };
