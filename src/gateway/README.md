# Gateway Layer

HTTP/REST API layer for REST-based clients (ChatGPT, Gemini).

## Purpose

Provides RESTful HTTP endpoints for clients that don't support MCP protocol.

## Structure
```
gateway/
├── routes/        - HTTP route handlers
└── middleware/    - Express middleware (auth, logging, etc)
```

## Routes

Routes are organized by domain:

- **health.js**: Health check endpoint
- **github.js**: GitHub tool endpoints
- **mcp.js**: MCP protocol endpoint (for Claude Desktop)

## Middleware

- **auth.js**: Bearer token authentication
- **logger.js**: Request/response logging

## Design Pattern

Each route file exports an Express router.

## Adding New Routes

1. Create route file (e.g., `supabase.js`)
2. Implement endpoints
3. Register in `src/server.js`
4. Update OpenAPI spec in `api/openapi.json`
