#!/bin/bash
# Create all documentation files

set -e

BASE_DIR="/home/ubuntu/projects/remote-mcp-server"
DOCS_DIR="$BASE_DIR/docs"

echo "Creating documentation files..."

# 1. DEPLOYMENT.md (Main deployment guide)
cat > "$DOCS_DIR/DEPLOYMENT.md" << 'EOF'
# MCP Frontdoor - Deployment Guide

**Version:** 1.0.0  
**Last Updated:** 2026-01-28  

## Overview

This is the main deployment guide. Follow documents in order:

1. [Prerequisites](DEPLOYMENT-01-PREREQUISITES.md) - Requirements and preparation
2. [Server Setup](DEPLOYMENT-02-SERVER-SETUP.md) - Ubuntu server installation
3. [Application Code](DEPLOYMENT-03-APPLICATION-CODE.md) - Node.js application files
4. [Nginx & SSL](DEPLOYMENT-04-NGINX-SSL.md) - Reverse proxy and certificates
5. [Windows Client](DEPLOYMENT-05-WINDOWS-CLIENT.md) - Claude Desktop setup
6. [Testing](DEPLOYMENT-06-TESTING.md) - Verification and testing
7. [Troubleshooting](DEPLOYMENT-07-TROUBLESHOOTING.md) - Common issues and solutions
8. [Maintenance](DEPLOYMENT-08-MAINTENANCE.md) - Ongoing operations

## Quick Reference

**Estimated Time:** 60-90 minutes  
**Skill Level:** Intermediate  
**Prerequisites:** Basic Linux, Node.js knowledge  

## Variables

Replace these throughout the guides:
```bash
DOMAIN="mcp.yourdomain.com"
SERVER_IP="123.456.789.012"
GITHUB_TOKEN="ghp_xxxxx"
MCP_AUTH_TOKEN="generate_with_openssl_rand"
```

## Support

- Report issues on GitHub
- Check troubleshooting guide
- Review architecture docs
EOF

# 2-8. Ayrı deployment dokümanları oluşturulacak (çok uzun olacağı için script içinde)
# Her biri 200-300 satır, indirilebilir

# 9. ARCHITECTURE.md
cat > "$DOCS_DIR/ARCHITECTURE.md" << 'EOF'
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
EOF

# 10. CONTINUE-PROMPT.md (güncellenmiş)
cat > "$DOCS_DIR/CONTINUE-PROMPT.md" << 'EOF'
# MCP Frontdoor - Continue Prompt (Updated: 2026-01-28)

Use this prompt to resume work on MCP Frontdoor with full context.

## Current System State

### Infrastructure (Ubuntu Server)
- **Location:** Oracle Cloud Free Tier (1GB RAM, 1 vCPU)
- **Domain:** mcp.seeinside.me → 129.151.229.128
- **OS:** Ubuntu 24.04 LTS
- **Services:** Nginx (443→9100), Node.js (9100), systemd
- **SSL:** Let's Encrypt (auto-renew)
- **Firewall:** UFW (22, 80, 443 open)

### Application Structure
```
remote-mcp-server/
├── index.js              - Entry point
├── src/
│   ├── server.js         - Express app
│   ├── gateway/          - REST API layer
│   │   ├── routes/       - health, github, mcp
│   │   └── middleware/   - auth, logger
│   ├── mcp/              - MCP protocol (handler.js)
│   └── tools/            - Business logic
│       ├── github-mcp/   - 7 GitHub operations
│       └── filesystem-mcp/ - 4 filesystem operations
├── api/                  - OpenAPI specs (future)
├── docs/                 - Documentation
└── scripts/              - Utility scripts
```

### Tools Registered (11 total)
**GitHub (7):** list_repositories, get_repository, list_issues, create_issue, get_file_content, search_code, list_branches  
**Filesystem (4):** read_file, write_file, list_directory, create_directory

### Security
- Bearer token auth (MCP_AUTH_TOKEN)
- Filesystem: restricted to /home/ubuntu/projects
- HTTPS/TLS enforced
- Path validation (directory traversal prevention)

### Windows Client
- Claude Desktop config: %APPDATA%\Claude\claude_desktop_config.json
- Wrapper: %USERPROFILE%\mcp-frontdoor\mcp-remote.cmd
- Transport: mcp-remote package (stdio→HTTP bridge)

## Completed Work
✅ Modular refactoring (Gateway/MCP/Tools layers)
✅ 15 README files
✅ Filesystem tool (with parent dir creation)
✅ Systemd service (auto-start)
✅ Production deployment
✅ Claude Desktop integration
✅ Full documentation

## Next Steps (Options)

### Option A: ChatGPT Integration
1. Create api/openapi.json
2. Test with ChatGPT Actions
3. Document setup

### Option B: Monitoring & Observability
1. Add Prometheus metrics
2. Implement rate limiting
3. Enhanced logging

### Option C: Supabase Tool
1. Design Supabase tool interface
2. Implement CRUD operations
3. Test integration

## Key Commands

### Ubuntu
```bash
# Service management
sudo systemctl restart remote-mcp-server
sudo journalctl -u remote-mcp-server -f

# Health check
curl -sS https://mcp.seeinside.me/health | jq .

# Logs
tail -f ~/projects/remote-mcp-server/logs/remote-mcp-server-access.log
```

### Windows
```powershell
# Restart Claude Desktop
Get-Process -Name "Claude" | Stop-Process -Force
Start-Process "$env:LOCALAPPDATA\Programs\Claude\Claude.exe"

# View config
Get-Content "$env:APPDATA\Claude\claude_desktop_config.json"
```

## Important Notes
- Token stored in .env (chmod 600)
- Nginx config: /etc/nginx/sites-enabled/mcp
- Systemd service: /etc/systemd/system/remote-mcp-server.service
- Backups: ~/projects/remote-mcp-server-backup-*

## Communication Style
- Step-by-step approach
- Ask for approval before risky changes
- Provide rollback plans
- Test incrementally
EOF

# 11. CHATGPT-SETUP.md (placeholder)
cat > "$DOCS_DIR/CHATGPT-SETUP.md" << 'EOF'
# ChatGPT Actions Setup Guide

## Status: Not Yet Implemented

This guide will cover:
1. Creating OpenAPI specification
2. Configuring ChatGPT Actions
3. Testing integration
4. Troubleshooting

## Prerequisites
- MCP Frontdoor deployed and running
- ChatGPT Plus or Team account
- Bearer token from server

## Coming Soon
Check back after ChatGPT integration is implemented.
EOF

echo "✅ Core documentation files created!"
ls -lh "$DOCS_DIR"/*.md
