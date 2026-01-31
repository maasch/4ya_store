/**
 * Shared helpers for the recommendation pipeline.
 * Used by content-based scoring, collaborative scoring, and the orchestrator.
 */

/**
 * Returns the first n elements of an array.
 *
 * @param {Array} arr - Input array
 * @param {number} n - Max number of items to return
 * @returns {Array}
 */
function topN(arr, n) {
  if (!Array.isArray(arr) || n <= 0) return [];
  return arr.slice(0, n);
}

/**
 * Min-max normalization: maps values to [0, 1].
 * If all values are equal or array is empty, returns 0.5 for each.
 *
 * @param {number[]} values - Raw scores
 * @returns {number[]} Normalized values
 */
function normalizeMinMax(values) {
  if (!Array.isArray(values) || values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const gap = max - min;
  if (gap === 0) return values.map(() => 0.5);
  return values.map((v) => (v - min) / gap);
}

/**
 * Merges content-based and collaborative scores with configurable weights,
 * then returns products sorted by combined score (descending).
 *
 * @param {Array<{ product: object, score: number }>} contentScored - Content-based scores
 * @param {Array<{ product: object, score: number }>} collabScored - Collaborative scores
 * @param {number} contentWeight - Weight for content score (e.g. 0.5)
 * @param {number} collaborativeWeight - Weight for collaborative score (e.g. 0.5)
 * @returns {Array<{ product: object, score: number }>} Sorted by combined score, descending
 */
function mergeAndRank(
  contentScored,
  collabScored,
  contentWeight,
  collaborativeWeight
) {
  const byId = new Map();

  for (const { product, score } of contentScored) {
    const id = String(product.id);
    if (!byId.has(id))
      byId.set(id, { product, contentScore: 0, collabScore: 0 });
    byId.get(id).contentScore = score;
  }
  for (const { product, score } of collabScored) {
    const id = String(product.id);
    if (!byId.has(id))
      byId.set(id, { product, contentScore: 0, collabScore: 0 });
    byId.get(id).collabScore = score;
  }

  const contentScores = [...byId.values()].map((x) => x.contentScore);
  const collabScores = [...byId.values()].map((x) => x.collabScore);
  const normContent = normalizeMinMax(contentScores);
  const normCollab = normalizeMinMax(collabScores);

  const merged = [...byId.values()].map((x, i) => ({
    product: x.product,
    score: contentWeight * normContent[i] + collaborativeWeight * normCollab[i],
  }));

  merged.sort((a, b) => b.score - a.score);
  return merged;
}

export { mergeAndRank, normalizeMinMax, topN };
