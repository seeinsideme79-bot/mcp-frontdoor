# Source Code

Application source code organized by architectural layer with multi-protocol support and OAuth authentication.

## Structure
```
src/
├── server.js         - Main Express application setup
├── gateway/          - HTTP/REST API layer with OAuth
│   ├── middleware/   - Auth, logging middleware
│   ├── oauth/        - JWT verification, scope policies
│   └── routes/       - MCP and health check routes
├── mcp/              - MCP protocol layer
│   ├── handler.js    - MCP request handler
│   └── toolAuth.js   - Tool-level security schemes
└── tools/            - Business logic (shared by all protocols)
    ├── github/       - GitHub API integration (7 tools)
    └── filesystem/   - Filesystem operations (4 tools)
```

## Layers

### Gateway Layer (`gateway/`)
**Purpose:** HTTP/REST API endpoints with authentication  
**Clients:** ChatGPT Desktop/Web, Claude Desktop/Web, Gemini (future)  
**Protocols:** HTTP/REST, SSE (Server-Sent Events)  
**Auth:** PAT (Bearer token) + OAuth 2.0 (JWT)

**Components:**
- `middleware/auth.js` - Multi-method authentication (PAT + OAuth)
- `middleware/logger.js` - Basic request logging
- `oauth/verifyJwt.js` - JWT token validation with JWKS
- `oauth/scopePolicy.js` - Scope-based access control
- `oauth/wwwAuthenticate.js` - WWW-Authenticate header builder
- `routes/mcp.js` - Main MCP endpoint with debug logging

### MCP Layer (`mcp/`)
**Purpose:** MCP protocol implementation  
**Clients:** Claude Desktop/Web (primary)  
**Protocol:** Streamable HTTP (MCP SDK)  
**Features:**
- Tool registration with security schemes
- Scope-based tool access control
- SSE payload injection for securitySchemes

### Tools Layer (`tools/`)
**Purpose:** Business logic (protocol-agnostic)  
**Clients:** ALL (shared by Gateway and MCP)  
**Principle:** Tools don't know about protocols or auth

**Available Tools:**
- **GitHub** (7 tools): list_repositories, get_repository, list_issues, create_issue, get_file_content, search_code, list_branches
- **Filesystem** (4 tools): read_file, write_file, list_directory, create_directory

## Authentication Flow

### PAT (Personal Access Token)
```
Client → Bearer Token → auth.js → Validates against MCP_AUTH_TOKEN → Success
```

### OAuth 2.0 (JWT)
```
Client → Bearer JWT → auth.js → verifyJwt.js → JWKS validation → Scope check → Success
```

## Debug Logging

The system supports two logging modes controlled by `DEBUG_MODE` environment variable:

### Debug Mode (`DEBUG_MODE=true`)
```
================================================================================
[timestamp] Incoming POST request to /mcp
IP: 20.215.220.138
Headers: { ... full headers ... }
Body: { ... full request body ... }
Auth: { ... decoded JWT claims ... }
================================================================================
```

### Production Mode (`DEBUG_MODE=false`)
```
[timestamp] POST /mcp | IP: 20.215.220.138 | Auth: ✓ (sub) | Method: tools/call
```

## Design Principles

1. **Separation of Concerns**: Protocol logic separate from business logic
2. **Reusability**: Tools used by multiple protocols
3. **Security**: Multi-layer auth (PAT + OAuth), scope-based access
4. **Testability**: Each layer can be tested independently
5. **Modularity**: Easy to add new protocols or tools
6. **Observability**: Debug mode for troubleshooting, production mode for efficiency

## Adding New Tools

1. Create tool directory in `tools/`
2. Implement tool class with standard interface
3. Register in MCP handler (`mcp/handler.js`)
4. Add scope requirements in `gateway/oauth/scopePolicy.js`
5. Add security schemes in `mcp/toolAuth.js`
6. Add REST routes in Gateway (`gateway/routes/`) if needed
7. Update API specs in `api/`

## Security Considerations

- **Path Traversal Protection**: Filesystem tools validate paths using `path.relative()`
- **Scope Enforcement**: Tools require specific OAuth scopes
- **Token Validation**: JWTs validated against Descope JWKS endpoint
- **Audience Validation**: Multi-audience support for different clients
- **Rate Limiting**: (TODO) Add rate limiting middleware
- **Error Handling**: Sensitive data not exposed in error messages

## Recent Updates (Feb 2026)

- ✅ Added OAuth 2.0 authentication via Descope
- ✅ Implemented scope-based access control
- ✅ Added debug mode logging in routes/mcp.js
- ✅ Fixed OAuth audience validation for ChatGPT Desktop
- ✅ Enhanced security with JWT validation
