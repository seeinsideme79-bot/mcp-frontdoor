/**
 * OAuth JWT verification (multi-issuer)
 * - Chooses issuer from token (unverified) to find discovery/JWKS
 * - Verifies signature, issuer, audience, exp/nbf
 * - Extracts scopes from `scope` or `scp`
 */

const DISCOVERY_CACHE = new Map(); // issuer -> { jwks, jwksUri, discoveredAt }
const DISCOVERY_TTL_MS = 60 * 60 * 1000; // 1h
const FETCH_TIMEOUT_MS = Number(process.env.OAUTH_HTTP_TIMEOUT_MS || 5000);

function parseEnvList(name) {
  return String(process.env[name] || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeIssuer(iss) {
  return String(iss || '').replace(/\/+$/, '');
}

function isAllowedIssuer(iss) {
  const allowed = parseEnvList('OAUTH_ALLOWED_ISSUERS').map(normalizeIssuer);
  return allowed.includes(normalizeIssuer(iss));
}

function allowedAudiences() {
  const auds = parseEnvList('OAUTH_ALLOWED_AUDIENCES');
  return auds.length ? auds : undefined;
}

async function fetchJson(url) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: ac.signal });
    if (!res.ok) throw new Error(`Discovery fetch failed (${res.status}) for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function discoverMetadata(issuer) {
  // Prefer OIDC, fallback to OAuth metadata
  const base = normalizeIssuer(issuer);
  try {
    return await fetchJson(`${base}/.well-known/openid-configuration`);
  } catch (_) {
    return await fetchJson(`${base}/.well-known/oauth-authorization-server`);
  }
}

function extractScopes(payload) {
  if (typeof payload.scope === 'string' && payload.scope.trim()) {
    return payload.scope.split(/\s+/).map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(payload.scp)) return payload.scp.map(String);
  if (typeof payload.scp === 'string' && payload.scp.trim()) {
    return payload.scp.split(/\s+/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

async function getJwksForIssuer(issuer) {
  const iss = normalizeIssuer(issuer);
  const cached = DISCOVERY_CACHE.get(iss);
  const now = Date.now();

  if (cached && (now - cached.discoveredAt) < DISCOVERY_TTL_MS) {
    return cached.jwks;
  }

  const meta = await discoverMetadata(iss);
  if (!meta.jwks_uri) throw new Error(`No jwks_uri in discovery for issuer: ${iss}`);

  const jose = await import('jose');
  const jwks = jose.createRemoteJWKSet(new URL(meta.jwks_uri));

  DISCOVERY_CACHE.set(iss, { jwks, jwksUri: meta.jwks_uri, discoveredAt: now });
  return jwks;
}

async function verifyJwt(token) {
  if (!token) throw new Error('Missing token');

  const jose = await import('jose');
  const decoded = jose.decodeJwt(token);

  const iss = decoded.iss;
  if (!iss) throw new Error('Token missing iss');
  if (!isAllowedIssuer(iss)) throw new Error(`Issuer not allowed: ${iss}`);

  const jwks = await getJwksForIssuer(iss);
  const aud = allowedAudiences();

  const { payload } = await jose.jwtVerify(token, jwks, {
    issuer: normalizeIssuer(iss),
    audience: aud
  });

  return {
    sub: payload.sub,
    iss: payload.iss,
    aud: payload.aud,
    scopes: extractScopes(payload),
    claims: payload
  };
}

module.exports = {
  verifyJwt,
  parseEnvList,
  normalizeIssuer
};
