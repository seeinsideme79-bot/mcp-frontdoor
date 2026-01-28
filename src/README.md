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
