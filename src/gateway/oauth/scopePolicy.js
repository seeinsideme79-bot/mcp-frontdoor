/**
 * Scope policy enforcement
 * Uses shared tool->scope mapping from src/mcp/toolAuth.js
 */

const { requiredScopesForTool } = require('../../mcp/toolAuth');

function hasRequiredScopes(auth, requiredScopes) {
  const req = Array.isArray(requiredScopes) ? requiredScopes : [];
  if (!req.length) return true;

  if (!auth || !Array.isArray(auth.scopes)) return false;
  if (auth.scopes.includes('*')) return true;

  return req.every((s) => auth.scopes.includes(s));
}

module.exports = {
  requiredScopesForTool,
  hasRequiredScopes
};
