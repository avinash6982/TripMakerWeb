const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Get authenticated user from Authorization: Bearer <token>.
 * Returns { id, email } or null.
 */
function getAuthUser(req) {
  const auth = req.headers?.authorization;
  if (!auth || typeof auth !== 'string' || !auth.toLowerCase().startsWith('bearer ')) {
    return null;
  }
  const token = auth.slice(7).trim();
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { getAuthUser };
