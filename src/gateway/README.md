# Gateway Layer

HTTP/REST API layer with multi-method authentication (PAT + OAuth 2.0) for all MCP clients.

## Purpose

Provides HTTP endpoints with authentication and authorization for:
- Claude Desktop/Web (via PAT)
- ChatGPT Desktop/Web (via OAuth 2.0)
- Future clients (Gemini, etc.)

## Structure
```
gateway/
├── routes/           - HTTP route handlers
│   ├── mcp.js       - Main MCP endpoint with debug logging
│   └── health.js    - Health check endpoint
├── middleware/       - Express middleware
│   ├── auth.js      - Multi-method authentication (PAT + OAuth)
│   └── logger.js    - Basic request logging
└── oauth/            - OAuth 2.0 components
    ├── verifyJwt.js        - JWT token validation with JWKS
    ├── scopePolicy.js      - Scope-based access control
    └── wwwAuthenticate.js  - WWW-Authenticate header builder
```

## Routes

### `/mcp` (Main Endpoint)
**File:** `routes/mcp.js`  
**Methods:** GET, POST, HEAD, OPTIONS, DELETE  
**Purpose:** MCP protocol endpoint for all clients  
**Features:**
- Accept header validation (application/json, text/event-stream)
- OAuth scope enforcement for tools/call
- SSE (Server-Sent Events) streaming
- Debug logging (controlled by DEBUG_MODE)
- SecuritySchemes injection for tools/list

**Supported Clients:**
- Claude Desktop (MCP protocol via SSE)
- Claude Web (MCP protocol via SSE)
- ChatGPT Desktop (MCP protocol via JSON + OAuth)
- ChatGPT Web (MCP protocol via JSON + OAuth)

### `/health` (Health Check)
**File:** `routes/health.js`  
**Method:** GET  
**Purpose:** Service health monitoring  
**Response:** `{ "status": "ok" }`

## Middleware

### `auth.js` - Multi-Method Authentication
**Purpose:** Validates Bearer tokens (PAT or JWT)

**Supported Methods:**
1. **PAT (Personal Access Token)**
   - Validates against `MCP_AUTH_TOKEN` environment variable
   - Sets `req.auth = { sub: "pat", iss: "pat", scopes: ["*"] }`
   - Used by Claude Desktop/Web

2. **OAuth 2.0 (JWT)**
   - Validates JWT signature via JWKS
   - Checks issuer, audience, expiration
   - Extracts scopes from token
   - Sets `req.auth = { sub, iss, aud, scopes, claims }`
   - Used by ChatGPT Desktop/Web

**Flow:**
```
Request → Authorization header → auth.js → PAT check → JWT check → req.auth set → next()
                                        ↓ fail          ↓ fail
                                    req.auth = null → 401 Unauthorized (if required)
```

### `logger.js` - Basic Request Logging
**Purpose:** Logs request method and path  
**Output:** `[timestamp] METHOD /path`

## OAuth Components

### `verifyJwt.js` - JWT Token Validation
**Purpose:** Validates JWT tokens using JWKS  
**Features:**
- Fetches JWKS from issuer's `.well-known/jwks.json`
- Verifies JWT signature using `jsonwebtoken`
- Validates claims: issuer, audience, expiration
- Caches JWKS for performance

**Configuration (via .env):**
```bash
OAUTH_ALLOWED_ISSUERS=https://api.descope.com/v1/apps/PROJECT_ID
OAUTH_ALLOWED_AUDIENCES=https://mcp.seeinside.me,PROJECT_ID
```

**Important:** Multiple audiences supported (comma-separated) to handle:
- Web clients: `https://mcp.seeinside.me`
- Desktop clients: `PROJECT_ID` (Descope project ID)

### `scopePolicy.js` - Scope-Based Access Control
**Purpose:** Maps tools to required OAuth scopes  
**Example:**
```javascript
const TOOL_SCOPE_REQUIREMENTS = {
  'list_repositories': ['git:read'],
  'create_issue': ['issues:write'],
  'write_file': ['files:write']
};
```

**Flow:**
```
tools/call request → Extract tool name → requiredScopesForTool() → hasRequiredScopes() → 
    ✓ Has scopes → Continue
    ✗ Missing scopes → 401 + WWW-Authenticate header
```

### `wwwAuthenticate.js` - WWW-Authenticate Header Builder
**Purpose:** Builds RFC 9110 compliant WWW-Authenticate headers  
**Format:**
```
WWW-Authenticate: Bearer realm="{resourceMetadataUrl}", 
                         scope="{required_scopes}",
                         error="insufficient_scope",
                         error_description="Missing required scope: git:read"
```

## Debug Logging in routes/mcp.js

The main MCP route supports two logging modes:

### Debug Mode (`DEBUG_MODE=true`)
**Purpose:** Detailed logging for troubleshooting  
**Logs:**
- Full request headers (including Authorization)
- Complete request body (JSON-RPC payload)
- Decoded auth object (JWT claims)
- Separator lines for clarity

**Output:**
```
================================================================================
[timestamp] Incoming POST request to /mcp
IP: 20.215.220.138
Headers: {
  "authorization": "Bearer eyJhbGci...",
  "content-type": "application/json",
  ...
}
Body: {
  "method": "tools/call",
  "params": { "name": "list_repositories" }
}
Auth: {
  "sub": "U38wyeBg3Yk0WR9G7gq7B3cUjFU7",
  "iss": "https://api.descope.com/v1/apps/...",
  "scopes": ["git:read", "git:write"]
}
================================================================================
```

### Production Mode (`DEBUG_MODE=false`)
**Purpose:** Minimal logging for production efficiency  
**Logs:**
- Timestamp
- HTTP method
- IP address
- Auth status (✓/✗)
- Request method (GET/POST/tools/call)

**Output:**
```
[timestamp] POST /mcp | IP: 20.215.220.138 | Auth: ✓ (U38wy...) | Method: tools/call
```

## Security Features

1. **Multi-Method Auth**: Supports both PAT and OAuth
2. **JWT Validation**: Signature verification via JWKS
3. **Scope Enforcement**: Tools require specific scopes
4. **Audience Validation**: Multi-audience support for different clients
5. **Token Expiration**: Checks JWT exp claim
6. **WWW-Authenticate**: Standards-compliant auth challenges
7. **No Token Logging**: Tokens not logged in production mode

## Adding New Routes

1. Create route file (e.g., `supabase.js`)
2. Implement endpoints with auth middleware
3. Add scope requirements in `oauth/scopePolicy.js`
4. Register in `src/server.js`
5. Update OpenAPI spec in `api/openapi.json`
6. Test with both PAT and OAuth tokens

## Recent Updates (Feb 2026)

- ✅ Added OAuth 2.0 authentication via Descope
- ✅ Implemented JWT validation with JWKS
- ✅ Added scope-based access control
- ✅ Fixed multi-audience support for ChatGPT Desktop
- ✅ Added debug mode logging in routes/mcp.js
- ✅ Enhanced WWW-Authenticate header generation
- ✅ Improved error handling for auth failures
