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
