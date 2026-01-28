/**
 * Authentication Middleware
 * Bearer token validation for all routes except /health
 */

module.exports = (req, res, next) => {
  // Skip authentication for health check
  if (req.path === '/health') {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = process.env.MCP_AUTH_TOKEN;

  // Check if token is configured
  if (!token) {
    console.error('[AUTH] MCP_AUTH_TOKEN not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // Validate Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  // Validate token
  const providedToken = authHeader.substring(7);
  if (providedToken !== token) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
};
