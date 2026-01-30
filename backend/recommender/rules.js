/**
 * Business rules filter for the recommendation system.
 * Aligns recommendations with store positioning: affordable, practical,
 * daily-use essentials for students. Filtering only — no scoring or ranking.
 */

const ALLOWED_CATEGORIES = [
  'Clothing',
  'Shoes',
  'Kitchen',
  'Home',
  'Bathroom',
  'Electronics',
  'Accessories',
  'Lifestyle',
];

const DEFAULT_MAX_PRICE_CENTS = 15000;
const MIN_AVERAGE_RATING = 3.5;

/**
 * Derives average rating from Product.rating (JSON).
 * Returns null if no rating or unparseable; otherwise the average.
 */
function getAverageRating(product) {
  const r = product.rating;
  if (r == null) return null;
  if (typeof r === 'number' && !Number.isNaN(r)) return r;
  if (Array.isArray(r) && r.length > 0) {
    const sum = r.reduce((acc, v) => acc + v, 0);
    return sum / r.length;
  }
  if (typeof r === 'object') {
    if (typeof r.average === 'number' && !Number.isNaN(r.average))
      return r.average;
    if (typeof r.stars === 'number' && !Number.isNaN(r.stars)) return r.stars;
    if (
      typeof r.sum === 'number' &&
      typeof r.count === 'number' &&
      r.count > 0
    ) {
      return r.sum / r.count;
    }
  }
  return null;
}

/**
 * Applies business positioning rules to a list of products.
 * Only filters; does not rank or score.
 *
 * @param {Object[]} products - Array of Sequelize Product instances
 * @param {Object} [context] - Optional context
 * @param {string} [context.currentProductId] - Exclude this product (e.g. currently viewed)
 * @param {number} [context.maxPriceCents] - Max price in cents (default 15000)
 * @param {string[]} [context.excludedProductIds] - Additional product IDs to exclude
 * @returns {Object[]} Filtered array of eligible products
 */
function applyBusinessRules(products, context = {}) {
  const maxPriceCents = context.maxPriceCents ?? DEFAULT_MAX_PRICE_CENTS;
  const currentProductId = context.currentProductId ?? null;
  const excludedIds = new Set(
    Array.isArray(context.excludedProductIds)
      ? context.excludedProductIds.map((id) => String(id))
      : []
  );
  if (currentProductId != null) excludedIds.add(String(currentProductId));

  return products.filter((p) => {
    if (p.stock <= 0) return false;
    if (p.priceCents > maxPriceCents) return false;
    if (!ALLOWED_CATEGORIES.includes(p.category)) return false;
    if (excludedIds.has(String(p.id))) return false;

    const avg = getAverageRating(p);
    if (avg !== null && avg < MIN_AVERAGE_RATING) return false;

    return true;
  });
}

export { applyBusinessRules };
