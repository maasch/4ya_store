/**
 * Middleware that requires the user to be authenticated (session must have userId).
 * Returns 401 JSON error if not authenticated.
 */
export default function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'You must be signed in to do that.' });
  }
  next();
}
