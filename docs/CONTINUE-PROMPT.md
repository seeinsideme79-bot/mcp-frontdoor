# MCP Frontdoor - Continue Prompt
## Updated: 2026-02-03 | Session 4

Yeni sessiona başlamak için bu dosyayı oku ve içeriğini paste et.

---

## 🏗️ Infrastructure

- **Server:** Oracle Cloud Free Tier - Ubuntu 24.04
- **IP:** 129.151.229.128
- **SSH:** `ssh -i ssh-key-2026-01-01.key ubuntu@129.151.229.128`
- **Domain:** mcp.seeinside.me
- **Port:** 9100 (Node.js) → Nginx reverse proxy → 443
- **SSL:** Let's Encrypt (auto-renew)
- **Firewall:** UFW (22, 80, 443)
- **Service:** systemd → remote-mcp-server.service

---

## 📁 Uygulama Yapısı
```
remote-mcp-server/
├── index.js                  - Entry point
├── .env                      - Environment variables (chmod 600)
├── package.json
├── src/
│   ├── server.js             - Express app + keepAliveTimeout (25s)
│   ├── gateway/
│   │   ├── routes/
│   │   │   ├── mcp.js        - MCP endpoint (GET SSE + POST)
│   │   │   ├── health.js     - Health check
│   │   │   └── github.js     - GitHub REST routes
│   │   ├── middleware/
│   │   │   ├── auth.js       - PAT + OAuth JWT auth
│   │   │   └── logger.js     - Request logging
│   │   └── oauth/
│   │       ├── scopePolicy.js
│   │       └── wwwAuthenticate.js
│   ├── mcp/
│   │   ├── handler.js        - MCP protocol + Zod schemas
│   │   └── toolAuth.js       - Scope mapping per tool
│   └── tools/
│       ├── github-mcp/index.js      - 10 GitHub operations
│       └── filesystem-mcp/index.js  - 4 Filesystem operations
├── docs/
│   ├── CONTINUE-PROMPT.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
└── logs/
```

---

## 🛠️ Tools (14 Total)

**GitHub Read (7):** list_repositories, get_repository, list_issues, create_issue, get_file_content, search_code, list_branches
**GitHub Write (3):** update_file, create_or_update_files, create_pull_request
**Filesystem (4):** read_file, write_file, list_directory, create_directory (base: /home/ubuntu/projects)

---

## 🔐 Auth

- **PAT:** Claude Desktop/Web → MCP_AUTH_TOKEN → scope `*`
- **OAuth:** ChatGPT Desktop/Web → Descope JWT → scopes: files:read/write, git:read/write, issues:read/write

---

## 💻 Windows Client (Şirket Bilgisayarı)

- **Node:** `C:\Users\10015895\tools\node-v24.13.0-win-x64`
- **mcp-frontdoor:** `C:\Users\10015895\mcp-frontdoor`
- **Claude Desktop:** `C:\Users\10015895\AppData\Local\AnthropicClaude\app-1.1.1520\claude.exe`

### ⚠️ mcp-remote: npx -y KULLANIMAZ
Asıl dosya: `node_modules\mcp-remote\dist\proxy.js`
Reinstall: `npm.cmd install mcp-remote` (C:\Users\10015895\mcp-frontdoor'da)

---

## ⚙️ Timeout Fix (Session 4)

**Sorun:** Claude Desktop write → timeout (restart sonrası çalışıyordu)
**Root Cause:** mcp-remote stale connection + Nginx 3600s timeout
**Çözüm:**
- Nginx /mcp: proxy_read_timeout 30s, proxy_send_timeout 30s
- Node: keepAliveTimeout=25s, headersTimeout=26s
- /auth/ location: 3600s kaldı

---

## ✅ Tamamlanan (Session 1-4)
- Modular architecture (Gateway/MCP/Tools)
- 14 tools (10 GitHub + 4 Filesystem)
- OAuth 2.0 (Descope + JWT + scopes)
- Claude Desktop Read+Write ✅
- ChatGPT Desktop Read+Write ✅
- mcp-remote local install fix
- Keepalive timeout fix
- Production deployment

## 📋 Yapılacaklar
### 🔴 Yüksek
1. configs/ + setup.sh (yeni server automation)
2. Winston logging (console.log → structured)
3. Rate limiting (express-rate-limit)

### 🟡 Orta
4. Prometheus + Grafana
5. Redis caching

### 🟢 Düşük
6. Sentry, Swagger, GitHub Actions CI/CD
7. delete_file, create_repository tools
8. Supabase, Multi-tenancy

---

## 🔑 Commands

### SSH
```bash
ssh -i ssh-key-2026-01-01.key ubuntu@129.151.229.128
sudo systemctl restart remote-mcp-server.service
tail -f ~/projects/remote-mcp-server/logs/remote-mcp-server-access.log
curl -s https://mcp.seeinside.me/health | jq
# Debug toggle
sed -i 's/DEBUG_MODE=false/DEBUG_MODE=true/' .env && sudo systemctl restart remote-mcp-server.service
```

### PowerShell
```powershell
type $env:APPDATA\Claude\claude_desktop_config.json
Get-ChildItem "$env:APPDATA\Claude\logs" -Filter "mcp*"
cd C:\Users\10015895\mcp-frontdoor; npm.cmd install mcp-remote  # reinstall
```

---

## 📝 Rules
- Şirket PC → global install yapılamaz
- PowerShell'de /dev/null yok, Linux komutları yok
- Secrets chat'te paylaşılmaz
- Risky işler için approval al
- bash tool = root user, ubuntu home erişemez → SSH kullan
- MCP tools timeout olabilir → SSH fallback
