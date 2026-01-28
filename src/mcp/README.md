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
