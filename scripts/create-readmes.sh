#!/bin/bash
# Create all README.md files for directory structure

set -e

BASE_DIR="/home/ubuntu/projects/remote-mcp-server"

echo "Creating README files..."

# 1. api/README.md
cat > "$BASE_DIR/api/README.md" << 'EOF'
# API Specifications

This directory contains API specifications for different client protocols.

## Files

### `openapi.json`
**Purpose:** REST API specification for ChatGPT Actions  
**Format:** OpenAPI 3.0  
**Protocol:** HTTP/REST  
**Authentication:** Bearer token  

**Endpoints:**
- GitHub operations (7 endpoints)
- Health check

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://mcp.seeinside.me/github/repos
```

## Future Additions

### `gemini-functions.json` (Planned)
**Purpose:** Function calling specification for Google Gemini  
**Format:** Gemini Function Calling JSON  

## Notes

- All specifications point to the same tool implementations in `src/tools/`
- Different formats, same functionality
- Update both files when adding new tools
EOF

# 2. src/README.md
cat > "$BASE_DIR/src/README.md" << 'EOF'
# Source Code

Application source code organized by architectural layer.

## Structure
```
src/
├── server.js         - Main Express application setup
├── gateway/          - HTTP/REST API layer
├── mcp/              - MCP protocol layer
└── tools/            - Business logic (shared by all protocols)
```

## Layers

### Gateway Layer (`gateway/`)
**Purpose:** HTTP/REST API endpoints  
**Clients:** ChatGPT, Gemini (future)  
**Protocol:** HTTP/REST  

### MCP Layer (`mcp/`)
**Purpose:** MCP protocol implementation  
**Clients:** Claude Desktop  
**Protocol:** Streamable HTTP (MCP SDK)  

### Tools Layer (`tools/`)
**Purpose:** Business logic  
**Clients:** ALL (shared by Gateway and MCP)  
**Principle:** Protocol-agnostic tool implementations  

## Design Principles

1. **Separation of Concerns**: Protocol logic separate from business logic
2. **Reusability**: Tools used by multiple protocols
3. **Testability**: Each layer can be tested independently
4. **Modularity**: Easy to add new protocols or tools

## Adding New Tools

1. Create tool directory in `tools/`
2. Implement tool class with standard interface
3. Register in MCP handler (`mcp/handler.js`)
4. Add REST routes in Gateway (`gateway/routes/`)
5. Update API specs in `api/`
EOF

# 3. src/gateway/README.md
cat > "$BASE_DIR/src/gateway/README.md" << 'EOF'
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
EOF

# 4. src/gateway/routes/README.md
cat > "$BASE_DIR/src/gateway/routes/README.md" << 'EOF'
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
EOF

# 5. src/gateway/middleware/README.md
cat > "$BASE_DIR/src/gateway/middleware/README.md" << 'EOF'
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
EOF

# 6. src/mcp/README.md
cat > "$BASE_DIR/src/mcp/README.md" << 'EOF'
# MCP Protocol Layer

Model Context Protocol implementation for Claude Desktop.

## Purpose

Implements Anthropic's MCP protocol using the official SDK, enabling Claude Desktop to access tools through stdio/HTTP transport.

## Files

### `handler.js`
**Purpose:** MCP Server implementation  
**SDK:** `@modelcontextprotocol/sdk`  
**Transport:** Streamable HTTP (stateless mode)  

**Responsibilities:**
1. Create MCP Server instance
2. Register tools from `src/tools/`
3. Handle MCP JSON-RPC requests
4. Convert tool results to MCP format

## MCP Protocol

**Endpoint:** `POST /mcp`  
**Format:** JSON-RPC 2.0  
**Transport:** Streamable HTTP  
**Mode:** Stateless (multi-client support)  

## Design Notes

- **Stateless Mode**: No session persistence (new transport per request)
- **Tool Sharing**: Uses same tools as Gateway layer
- **Error Handling**: Converts tool errors to MCP error format
EOF

# 7. src/tools/README.md
cat > "$BASE_DIR/src/tools/README.md" << 'EOF'
# Tools Layer

Business logic implementations - protocol-agnostic tool operations.

## Purpose

Contains core functionality shared by all protocols (MCP, REST). Tools are protocol-agnostic and handle only business logic.

## Current Tools

### GitHub Tool (`github-mcp/`)
**Operations:** 7  
- list_repositories, get_repository, list_issues, create_issue
- get_file_content, search_code, list_branches

### Filesystem Tool (`filesystem-mcp/`)
**Operations:** 4  
- read_file, write_file, list_directory, create_directory
**Security:** Path restricted to `/home/ubuntu/projects`

## Tool Pattern

Every tool follows this interface:
- `getAvailableTools()` - Returns tool definitions
- `executeTool(name, params)` - Executes tool by name
- Singleton export

## Adding New Tools

1. Create tool directory: `tools/new-tool-mcp/`
2. Implement tool class with standard interface
3. Add README.md
4. Register in `src/mcp/handler.js`
5. Add routes in `src/gateway/routes/`
6. Update API specs in `api/`
EOF

# 8. src/tools/github-mcp/README.md
cat > "$BASE_DIR/src/tools/github-mcp/README.md" << 'EOF'
# GitHub Tool

GitHub repository and issue management operations.

## Operations (7)

1. **list_repositories** - List user's repositories
2. **get_repository** - Get repository details
3. **list_issues** - List repository issues
4. **create_issue** - Create new issue
5. **get_file_content** - Read file from repository
6. **search_code** - Search code across repositories
7. **list_branches** - List repository branches

## Configuration

Set `GITHUB_TOKEN` in `.env`:
```bash
GITHUB_TOKEN=ghp_your_token_here
```

**Token Requirements:**
- Scope: `repo` (full control of private repositories)
- Generate at: https://github.com/settings/tokens

## Error Handling

All methods throw descriptive errors.
EOF

# 9. src/tools/filesystem-mcp/README.md
cat > "$BASE_DIR/src/tools/filesystem-mcp/README.md" << 'EOF'
# Filesystem Tool

Secure filesystem operations with path validation.

## Security

**CRITICAL:** All operations are restricted to:
```
ALLOWED_BASE = '/home/ubuntu/projects'
```

**Path Validation:**
- All paths resolved to absolute paths
- Validated against base directory
- Directory traversal attacks prevented
- Access outside base directory denied

## Operations (4)

1. **read_file** - Read file content
2. **write_file** - Write content to file (creates parent directories)
3. **list_directory** - List directory contents
4. **create_directory** - Create new directory

## Security Examples

**Allowed:**
- `remote-mcp-server/package.json` ✅
- `./project/file.txt` ✅

**Denied:**
- `/etc/passwd` ❌
- `../../../etc/passwd` ❌
EOF

# 10. docs/README.md
cat > "$BASE_DIR/docs/README.md" << 'EOF'
# Documentation

Project documentation and setup guides.

## Files

### `ARCHITECTURE.md`
System architecture overview

### `DEPLOYMENT.md`
Complete deployment guide

### `CHATGPT-SETUP.md`
ChatGPT Actions integration guide

### `CONTINUE-PROMPT.md`
Context for new conversation sessions

## Documentation Standards

- Use Markdown format
- Include code examples
- Provide step-by-step instructions
- Keep updated with code changes
EOF

# 11. config/README.md
cat > "$BASE_DIR/config/README.md" << 'EOF'
# Configuration

Configuration files and templates.

## Current Status

Currently empty. Reserved for future configuration files.

## Environment Variables

Primary configuration is in `.env` file at project root.
EOF

# 12. logs/README.md
cat > "$BASE_DIR/logs/README.md" << 'EOF'
# Application Logs

Runtime logs for monitoring and debugging.

## Files

- `remote-mcp-server-access.log` - Access logs
- `remote-mcp-server-error.log` - Error logs

## Viewing Logs
```bash
tail -f logs/remote-mcp-server-access.log
tail -f logs/remote-mcp-server-error.log
sudo journalctl -u remote-mcp-server -f
```
EOF

# 13. scripts/README.md
cat > "$BASE_DIR/scripts/README.md" << 'EOF'
# Utility Scripts

Helper scripts for maintenance and operations.

## Files

### `create-readmes.sh`
Creates all README.md files in the project structure.

### `generate-token.sh` (Future)
Generate secure authentication token.

### `cleanup-backups.sh` (Future)
Clean old backup files.
EOF

# 14. backups/README.md
cat > "$BASE_DIR/backups/README.md" << 'EOF'
# Backup Files

Historical backup files from development and refactoring.

## Purpose

Stores backup copies of files before major changes.

## Retention Policy

- Keep during active development
- Clean up after successful refactor

## Restoring from Backup
```bash
ls -lh backups/
cp backups/filename.backup-timestamp destination/
sudo systemctl restart remote-mcp-server
```
EOF

echo "✅ All README files created!"
find "$BASE_DIR" -name "README.md" -type f | sort
