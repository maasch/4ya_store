/**
 * Content-based scoring: similarity between products using attributes
 * (category, subCategory, brand, keywords). Used for “similar items” recommendations.
 */

/**
 * Ensures keywords are an array of strings (Product stores as comma-separated or array).
 *
 * @param {Product} product - Sequelize Product instance
 * @returns {string[]}
 */
function getKeywords(product) {
  const k = product.keywords ?? product.get?.('keywords');
  if (Array.isArray(k)) return k.map(String).filter(Boolean);
  if (typeof k === 'string') return k.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

/**
 * Jaccard similarity between two keyword arrays.
 *
 * @param {string[]} a
 * @param {string[]} b
 * @returns {number} Value in [0, 1]
 */
function jaccard(a, b) {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a.map((x) => x.toLowerCase()));
  const setB = new Set(b.map((x) => x.toLowerCase()));
  let intersection = 0;
  for (const x of setA) {
    if (setB.has(x)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Scores eligible products by similarity to a reference product.
 * Uses category, subCategory, brand, and keyword overlap.
 * If no reference product, returns uniform score 0 for all (no preference).
 *
 * @param {Object[]} eligibleProducts - Filtered products (e.g. from business rules)
 * @param {Object|null} referenceProduct - Product we want “similar to” (e.g. currently viewed)
 * @returns {Array<{ product: object, score: number }>} Same products with similarity scores
 */
function scoreByContent(eligibleProducts, referenceProduct) {
  if (!Array.isArray(eligibleProducts)) return [];

  if (!referenceProduct) {
    return eligibleProducts.map((p) => ({ product: p, score: 0 }));
  }

  const refCat = String(referenceProduct.category ?? '').trim();
  const refSub = String(referenceProduct.subCategory ?? '').trim();
  const refBrand = String(referenceProduct.brand ?? '').trim();
  const refKw = getKeywords(referenceProduct);

  const scored = eligibleProducts.map((p) => {
    let score = 0;
    if (refCat && String(p.category ?? '').trim() === refCat) score += 2;
    if (refSub && String(p.subCategory ?? '').trim() === refSub) score += 2;
    if (refBrand && String(p.brand ?? '').trim() === refBrand) score += 1;
    score += 2 * jaccard(getKeywords(p), refKw);
    return { product: p, score };
  });

  return scored;
}

export { scoreByContent, getKeywords, jaccard };
