/**
 * /.well-known routes
 * - oauth-protected-resource (Protected Resource Metadata)
 */

const express = require('express');
const router = express.Router();

const { listAllScopesSupported } = require('../../mcp/toolAuth');

function parseEnvList(name) {
  return String(process.env[name] || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

router.get('/oauth-protected-resource', (req, res) => {
  // Prefer configured resource; otherwise infer from request
  const configured = (process.env.OAUTH_RESOURCE || '').replace(/\/+$/, '');
  const inferredProto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https')
    .split(',')[0]
    .trim();
  const inferred = `${inferredProto}://${req.get('host')}`;

  const resource = configured || inferred;

  // Prefer explicit auth server list; fallback to allowed issuers
  const authorization_servers =
    parseEnvList('OAUTH_AUTHORIZATION_SERVERS').length
      ? parseEnvList('OAUTH_AUTHORIZATION_SERVERS')
      : parseEnvList('OAUTH_ALLOWED_ISSUERS');

  res.setHeader('Cache-Control', 'no-store');
  res.json({
    resource,
    authorization_servers,
    scopes_supported: listAllScopesSupported()
  });
});

module.exports = router;
