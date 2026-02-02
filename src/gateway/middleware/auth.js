/**
 * Authentication Middleware
 * - Supports: PAT (MCP_AUTH_TOKEN) + OAuth JWT (multi-issuer)
 * - Bypasses: /health, /, /.well-known/*
 * - For /mcp: does NOT hard-fail on missing/invalid token (route will emit MCP auth meta)
 */

const { verifyJwt } = require('../oauth/verifyJwt');

function isPublicPath(path) {
  const p = String(path || '');
  return p === '/' || p === '/health' || p.startsWith('/.well-known');
}

function isMcpPath(path) {
  return String(path || '').startsWith('/mcp');
}

module.exports = async (req, res, next) => {
  if (isPublicPath(req.path)) return next();

  const authHeader = req.headers.authorization;

  // No Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isMcpPath(req.path)) {
      req.auth = null;
      return next();
    }
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.substring(7).trim();

  // PAT support (for curl/debug)
  const pat = process.env.MCP_AUTH_TOKEN;
  if (pat && token === pat) {
    req.auth = { sub: 'pat', iss: 'pat', scopes: ['*'] };
    return next();
  }

  // OAuth JWT
  try {
    req.auth = await verifyJwt(token);
    return next();
  } catch (err) {
    if (isMcpPath(req.path)) {
      req.auth = null;
      return next();
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};
