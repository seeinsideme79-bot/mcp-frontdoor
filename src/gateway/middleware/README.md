# Gateway Middleware

Express middleware for request processing.

## Files

### `auth.js`
**Purpose:** Bearer token authentication  
**Applied To:** All routes except `/health`  
**Token Source:** `process.env.MCP_AUTH_TOKEN`  

### `logger.js`
**Purpose:** Request/response logging  
**Applied To:** All routes  
**Output:** Console + log files  

## Adding New Middleware

1. Create middleware file
2. Export middleware function
3. Register in `src/server.js` with `app.use()`
