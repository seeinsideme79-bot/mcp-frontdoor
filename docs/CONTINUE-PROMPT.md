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
