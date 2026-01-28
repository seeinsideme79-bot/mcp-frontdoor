# Gateway Routes

HTTP route handlers for REST API endpoints.

## Files

### `health.js`
**Purpose:** Server health check  
**Endpoint:** `GET /health`  
**Auth:** None (public)  
**Returns:** Server status, tool list, version  

### `github.js`
**Purpose:** GitHub tool operations  
**Endpoints:** 7 GitHub endpoints
**Auth:** Required (Bearer token)  

### `mcp.js`
**Purpose:** MCP protocol endpoint  
**Endpoints:** POST/GET/DELETE /mcp
**Client:** Claude Desktop  

## Adding New Routes

1. Create new route file
2. Import tool from `src/tools/`
3. Implement endpoints
4. Export router
5. Register in `src/server.js`
