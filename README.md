# MCP Frontdoor

Remote MCP (Model Context Protocol) Server - Multi-client AI tool access gateway with OAuth authentication.

## Quick Start
```bash
npm install
node index.js
```

## Production Deployment
```bash
# Run as systemd service
sudo systemctl start remote-mcp-server.service
sudo systemctl enable remote-mcp-server.service

# View logs
sudo journalctl -u remote-mcp-server.service -f
tail -f ~/projects/remote-mcp-server/logs/remote-mcp-server-access.log
```

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Continue Prompt](docs/CONTINUE-PROMPT.md)

## Features

### Tools
- **GitHub Tools** (10 operations)
  - Repository management
  - Issue tracking
  - File operations (read + write)
  - Code search
  - Pull requests
- **Filesystem Tools** (4 operations)
  - Read/Write files
  - Directory management
  - Path validation with security boundaries

### Authentication
- **PAT (Personal Access Token)** - For Claude.ai Desktop/Web
- **OAuth 2.0 with Descope** - For ChatGPT Desktop/Web
  - JWT token validation
  - Scope-based authorization
  - Multi-audience support

### Protocols
- **MCP (Model Context Protocol)** - Native protocol for Claude
- **REST API** - Universal HTTP access
- **SSE (Server-Sent Events)** - Real-time streaming

### Logging
- **Debug Mode** - Detailed logging with headers, body, auth details
- **Production Mode** - Minimal logging (IP, auth status, method only)
- Toggle via `DEBUG_MODE` environment variable

## Environment Configuration
```bash
# Server
PORT=9100
NODE_ENV=production

# Authentication
MCP_AUTH_TOKEN=your_pat_token_here
GITHUB_TOKEN=your_github_pat_here

# OAuth (Descope)
OAUTH_RESOURCE=https://mcp.seeinside.me
OAUTH_ALLOWED_ISSUERS=https://api.descope.com/v1/apps/YOUR_PROJECT_ID
OAUTH_ALLOWED_AUDIENCES=https://mcp.seeinside.me,YOUR_PROJECT_ID
OAUTH_AUTHORIZATION_SERVERS=https://api.descope.com/v1/apps/YOUR_PROJECT_ID

# Logging
DEBUG_MODE=false  # Set to true for detailed debug logs
```

## Supported Clients

✅ **Claude.ai Desktop** (via PAT)
✅ **Claude.ai Web** (via PAT)
✅ **ChatGPT Desktop** (via OAuth)
✅ **ChatGPT Web** (via OAuth)

## Requirements

- Node.js 18+
- Ubuntu 24.04
- GitHub Personal Access Token
- Descope OAuth Application (for ChatGPT integration)

## Security Features

- JWT token validation with JWKS
- Scope-based access control
- Path traversal protection for filesystem operations
- Secure token storage in environment variables
- HTTPS-only communication (via Nginx reverse proxy)

## Recent Updates (Feb 2026)

- ✅ Added ChatGPT Desktop OAuth integration
- ✅ Fixed OAuth audience validation for multi-client support
- ✅ Implemented debug mode for controlled logging
- ✅ Enhanced security with scope-based authorization
- ✅ Improved error handling and logging middleware
- ✅ Added GitHub write operations (update_file, create_or_update_files, create_pull_request)
- ✅ Verified write operations with ChatGPT Desktop
- ✅ Production deployment completed and tested
- ✅ Fixed Claude Desktop write timeout (Nginx keepalive 30s + Node keepAliveTimeout 25s)
- ✅ Fixed mcp-remote timeout (local install via proxy.js, npx -y removed)
- ✅ Verified Claude Desktop read + write operations working without restart
