const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const githubTool = require('../tools/github-mcp');
const filesystemTool = require('../tools/filesystem-mcp');

// Shared MCP Server instance (stateless - no per-session state)
let mcpServer = null;

/**
 * Create and configure MCP Server instance
 */
function createMcpServer() {
  if (mcpServer) return mcpServer;

  mcpServer = new McpServer(
    {
      name: 'remote-mcp-server',
      version: '1.0.0',
      description: 'GitHub + Filesystem MCP Server for Claude & ChatGPT'
    },
    {
      capabilities: {
        logging: {},
        tools: {}
      }
    }
  );

  // Register GitHub tools
  registerGitHubTools(mcpServer);
  
  // Register Filesystem tools
  registerFilesystemTools(mcpServer);

  console.log('[MCP] Server instance created (stateless mode)');
  return mcpServer;
}

/**
 * Register all GitHub tools with MCP Server
 */
function registerGitHubTools(server) {
  const tools = githubTool.getAvailableTools();

  tools.forEach(tool => {
    const { name, description, parameters } = tool;

    // Convert parameters to inputSchema format
    const inputSchema = {};
    if (parameters && Object.keys(parameters).length > 0) {
      Object.entries(parameters).forEach(([key, desc]) => {
        inputSchema[key] = {
          type: 'string',
          description: desc
        };
      });
    }

    server.registerTool(
      name,
      {
        description,
        inputSchema: inputSchema
      },
      async (args) => {
        try {
          const result = await githubTool.executeTool(name, args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error.message}`
              }
            ],
            isError: true
          };
        }
      }
    );
  });

  console.log(`[MCP] Registered ${tools.length} GitHub tools`);
}

/**
 * Register all Filesystem tools with MCP Server
 */
function registerFilesystemTools(server) {
  const tools = filesystemTool.getAvailableTools();

  tools.forEach(tool => {
    const { name, description, parameters } = tool;

    // Convert parameters to inputSchema format
    const inputSchema = {};
    if (parameters && Object.keys(parameters).length > 0) {
      Object.entries(parameters).forEach(([key, desc]) => {
        inputSchema[key] = {
          type: 'string',
          description: desc
        };
      });
    }

    server.registerTool(
      name,
      {
        description,
        inputSchema: inputSchema
      },
      async (args) => {
        try {
          const result = await filesystemTool.executeTool(name, args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error.message}`
              }
            ],
            isError: true
          };
        }
      }
    );
  });

  console.log(`[MCP] Registered ${tools.length} Filesystem tools`);
}

/**
 * Create transport for each request (stateless mode)
 */
async function createTransportForRequest(server) {
  // Create stateless transport (sessionIdGenerator: undefined)
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined  // Stateless mode
  });

  // Connect server to transport
  await server.connect(transport);

  return transport;
}

/**
 * Handle incoming MCP request (creates new transport per request)
 */
async function handleRequest(req, res, body) {
  if (!mcpServer) {
    throw new Error('MCP Server not initialized');
  }

  // Create new transport for this request
  const transport = await createTransportForRequest(mcpServer);

  try {
    await transport.handleRequest(req, res, body);
  } finally {
    // Clean up transport after request
    await transport.close();
  }
}

/**
 * Cleanup (no-op in stateless mode)
 */
async function cleanup() {
  console.log('[MCP] Cleanup (stateless mode - no resources to clean)');
}

module.exports = {
  createMcpServer,
  handleRequest,
  cleanup
};
