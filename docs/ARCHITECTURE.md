# MCP Frontdoor - Architecture

## System Overview
```
┌─────────────────────────────────────────────┐
│           Client Layer                      │
│  ┌──────────────┐    ┌──────────────┐      │
│  │ Claude       │    │ ChatGPT      │      │
│  │ Desktop      │    │ Actions      │      │
│  └──────┬───────┘    └──────┬───────┘      │
└─────────┼────────────────────┼──────────────┘
          │ MCP Protocol       │ REST API
          │ (stdio/HTTP)       │ (HTTP/JSON)
          │                    │
┌─────────▼────────────────────▼──────────────┐
│         Gateway Layer (Express)             │
│  ┌──────────────┐    ┌──────────────┐      │
│  │ MCP Handler  │    │ REST Routes  │      │
│  └──────┬───────┘    └──────┬───────┘      │
└─────────┼────────────────────┼──────────────┘
          │                    │
          └────────┬───────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Tools Layer (Business Logic)        │
│  ┌─────────────┐      ┌──────────────┐     │
│  │   GitHub    │      │  Filesystem  │     │
│  │   (7 ops)   │      │   (4 ops)    │     │
│  └─────────────┘      └──────────────┘     │
└─────────────────────────────────────────────┘
```

## Design Principles

1. **Protocol Agnostic Tools**: Tools have no knowledge of MCP or REST
2. **Stateless Gateway**: Each request is independent
3. **Security by Design**: Bearer auth, path validation, HTTPS
4. **Modularity**: Easy to add protocols or tools

## Component Details

See individual component READMEs:
- [Gateway Layer](../src/gateway/README.md)
- [MCP Protocol](../src/mcp/README.md)
- [Tools Layer](../src/tools/README.md)

## Data Flow

### Claude Desktop Request
1. Windows: mcp-remote.cmd (stdio wrapper)
2. HTTPS → Nginx → Node.js:9100
3. POST /mcp (MCP JSON-RPC)
4. MCP Handler → Tool → Response

### ChatGPT Request
1. ChatGPT Actions (OpenAPI)
2. HTTPS → Nginx → Node.js:9100
3. GET /github/repos (REST)
4. Route → Tool → JSON Response

## Security Architecture

### Authentication
- Bearer token (32-byte hex)
- Environment variable storage
- Token validation middleware

### Network Security
- TLS 1.2+ only
- Nginx reverse proxy
- UFW firewall rules

### Filesystem Security
- Path validation (startsWith check)
- Restricted to /home/ubuntu/projects
- No directory traversal

## Scalability

### Current (1GB RAM)
- 1-5 concurrent users
- Lightweight tools only

### Production Recommendations
- 2-4GB RAM
- Load balancer
- Rate limiting
- Monitoring (Prometheus/Grafana)
