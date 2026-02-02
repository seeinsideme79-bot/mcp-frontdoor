# Gateway Middleware

Express middleware for authentication, logging, and request processing.

## Files

### `auth.js` - Multi-Method Authentication
**Purpose:** Bearer token authentication (PAT + OAuth 2.0)  
**Applied To:** All routes except `/health`  
**Methods:**
1. **PAT (Personal Access Token)**
   - Token Source: `process.env.MCP_AUTH_TOKEN`
   - Used by: Claude Desktop/Web
   - Auth Object: `{ sub: "pat", iss: "pat", scopes: ["*"] }`

2. **OAuth 2.0 (JWT)**
   - Token Validation: Via `../oauth/verifyJwt.js`
   - Used by: ChatGPT Desktop/Web
   - Auth Object: `{ sub, iss, aud, scopes, claims }`

**Flow:**
```javascript
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  // No token? Set req.auth = null, continue (route decides if auth required)
  if (!authHeader) {
    req.auth = null;
    return next();
  }
  
  const token = authHeader.replace(/^Bearer\s+/i, '');
  
  // Try PAT first
  if (token === process.env.MCP_AUTH_TOKEN) {
    req.auth = { sub: 'pat', iss: 'pat', scopes: ['*'] };
    return next();
  }
  
  // Try OAuth JWT
  try {
    const decoded = await verifyJwt(token);
    req.auth = {
      sub: decoded.sub,
      iss: decoded.iss,
      aud: decoded.aud,
      scopes: parseScopes(decoded.scope),
      claims: decoded
    };
    return next();
  } catch (err) {
    req.auth = null;
    return next();
  }
}
```

**Important Notes:**
- Middleware NEVER returns 401 - it just sets `req.auth`
- Routes decide if auth is required
- This allows public endpoints (health check) to work

### `logger.js` - Basic Request Logging
**Purpose:** Logs HTTP method and path  
**Applied To:** All routes  
**Output:** Console (captured by systemd journal)

**Implementation:**
```javascript
module.exports = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};
```

**Note:** This is minimal logging. Detailed logging is in `routes/mcp.js` (controlled by DEBUG_MODE).

## Detailed Logging in routes/mcp.js

While `logger.js` provides basic logging, the main MCP route (`routes/mcp.js`) has its own sophisticated logging system controlled by the `DEBUG_MODE` environment variable.

### Debug Mode (`DEBUG_MODE=true`)
**When to use:** Development, troubleshooting, debugging OAuth issues  
**Logs include:**
- Full request headers (including Authorization token)
- Complete request body (JSON-RPC methods and params)
- Decoded authentication object (JWT claims, scopes)
- IP address
- Timestamp

**Example Output:**
```
================================================================================
[2026-02-02T12:58:29.138Z] Incoming POST request to /mcp
IP: 20.215.220.138
Headers: {
  "host": "mcp.seeinside.me",
  "authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IlNLMzh3...",
  "content-type": "application/json",
  "user-agent": "openai-mcp/1.0.0 (ChatGPT)"
}
Body: {
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "list_repositories",
    "arguments": {}
  }
}
Auth: {
  "sub": "U38wyeBg3Yk0WR9G7gq7B3cUjFU7",
  "iss": "https://api.descope.com/v1/apps/P38we5quCMyfSRIWXACyEufomM6y",
  "aud": ["P38we5quCMyfSRIWXACyEufomM6y"],
  "scopes": ["files:read", "files:write", "git:read", "issues:read", "issues:write"],
  "claims": { ... full JWT payload ... }
}
================================================================================
```

### Production Mode (`DEBUG_MODE=false`)
**When to use:** Production deployment  
**Logs include:**
- Timestamp
- HTTP method
- IP address (shortened)
- Auth status (✓ with subject, or ✗)
- Request method (GET/POST/tools/call)

**Example Output:**
```
[2026-02-02T12:58:29.138Z] POST /mcp | IP: 20.215.220.138 | Auth: ✓ (U38wy...) | Method: tools/call
[2026-02-02T12:58:30.456Z] GET /mcp | IP: 176.234.135.190 | Auth: ✓ (pat) | Method: GET
```

**Implementation in routes/mcp.js:**
```javascript
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

router.all('/', async (req, res) => {
  const timestamp = new Date().toISOString();

  if (DEBUG_MODE) {
    // Detailed debug logging
    console.log('\n' + '='.repeat(80));
    console.log(`[${timestamp}] Incoming ${req.method} request to /mcp`);
    console.log('IP:', req.ip);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Auth:', req.auth ? JSON.stringify(req.auth, null, 2) : 'No auth');
    console.log('='.repeat(80) + '\n');
  } else {
    // Minimal production logging
    const ip = req.ip;
    const authStatus = req.auth ? `✓ (${req.auth.sub})` : '✗';
    const method = req.body?.method || req.method;
    console.log(`[${timestamp}] ${req.method} /mcp | IP: ${ip} | Auth: ${authStatus} | Method: ${method}`);
  }
  
  // ... rest of route handler
});
```

### Toggling Debug Mode

**Enable debug mode:**
```bash
# Edit .env file
DEBUG_MODE=true

# Restart service
sudo systemctl restart remote-mcp-server.service
```

**Disable debug mode (production):**
```bash
# Edit .env file
DEBUG_MODE=false

# Restart service
sudo systemctl restart remote-mcp-server.service
```

**View logs:**
```bash
# Real-time access logs
tail -f ~/projects/remote-mcp-server/logs/remote-mcp-server-access.log

# Systemd journal (includes all console output)
sudo journalctl -u remote-mcp-server.service -f
```

## Security Considerations

### What's Logged in Production Mode
✅ IP addresses (for rate limiting analysis)  
✅ Auth status (success/failure)  
✅ Request methods (for monitoring)  
✅ Timestamps (for auditing)

### What's NOT Logged in Production Mode
❌ Full Authorization tokens  
❌ Request bodies (may contain sensitive data)  
❌ Complete JWT payloads  
❌ Full headers (may contain secrets)

### What's Logged in Debug Mode
⚠️ **Everything** - Only use for troubleshooting!  
⚠️ Tokens, bodies, full JWT claims are visible  
⚠️ Never leave DEBUG_MODE=true in production

## Adding New Middleware

1. Create middleware file in `middleware/`
2. Export middleware function: `module.exports = (req, res, next) => { ... }`
3. Register in `src/server.js` with `app.use(middleware)`
4. Document in this README
5. Consider logging implications (debug vs production)

## Testing Middleware

### Test PAT Authentication
```bash
curl -H "Authorization: Bearer YOUR_PAT" https://mcp.seeinside.me/mcp
```

### Test OAuth Authentication
```bash
curl -H "Authorization: Bearer YOUR_JWT" https://mcp.seeinside.me/mcp
```

### Test No Authentication
```bash
curl https://mcp.seeinside.me/health  # Should work (public endpoint)
curl https://mcp.seeinside.me/mcp     # Should work (auth optional for GET)
```

## Recent Updates (Feb 2026)

- ✅ Added OAuth 2.0 JWT validation to auth.js
- ✅ Implemented multi-method authentication (PAT + OAuth)
- ✅ Added debug mode logging in routes/mcp.js
- ✅ Enhanced security with scope extraction
- ✅ Improved logging with production/debug modes
- ✅ Added comprehensive logging documentation
