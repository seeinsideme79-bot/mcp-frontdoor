const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');

// zod v3/v4 uyumlu import
const zod = require('zod');
const z = zod.z ?? zod;

const githubTool = require('../tools/github-mcp');
const filesystemTool = require('../tools/filesystem-mcp');

// Shared MCP Server instance (stateless - no per-session state)
let mcpServer = null;

/**
 * Tool input schemas (Zod)
 * These schemas will be exposed via tools/list and used for validation.
 */
const TOOL_SCHEMAS = {
  // --- GitHub tools ---
  list_repositories: z.object({}),

  get_repository: z.object({
    owner: z.string(),
    repo: z.string()
  }),

  list_branches: z.object({
    owner: z.string(),
    repo: z.string()
  }),

  list_issues: z.object({
    owner: z.string(),
    repo: z.string(),
    // list_issues() default = 'open' -> optional
    state: z.enum(['open', 'closed', 'all']).optional()
  }),

  create_issue: z.object({
    owner: z.string(),
    repo: z.string(),
    title: z.string(),
    body: z.string(),
    // allow either ["bug","prio"] or "bug, prio"
    labels: z.union([z.array(z.string()), z.string()]).optional()
  }),

  get_file_content: z.object({
    owner: z.string(),
    repo: z.string(),
    path: z.string(),
    branch: z.string().optional()
  }),

  search_code: z.object({
    query: z.string(),
    // accept number or string -> coerce
    limit: z.coerce.number().int().positive().optional()
  }),

  // --- Filesystem tools ---
  read_file: z.object({
    path: z.string()
  }),

  write_file: z.object({
    path: z.string(),
    content: z.string()
  }),

  list_directory: z.object({
    path: z.string().optional()
  }),

  create_directory: z.object({
    path: z.string(),
    recursive: z.coerce.boolean().optional()
  })
};

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
  registerTools(mcpServer, githubTool, 'github');

  // Register Filesystem tools
  registerTools(mcpServer, filesystemTool, 'filesystem');

  console.log('[MCP] Server instance created (stateless mode)');
  return mcpServer;
}

/**
 * Register tools from a tool provider (github/filesystem)
 */
function registerTools(server, toolProvider, providerName) {
  const tools = toolProvider.getAvailableTools();

  tools.forEach((tool) => {
    const { name, description } = tool;

    // Prefer explicit schema map; fallback to empty object schema
    const inputSchema = TOOL_SCHEMAS[name] || z.object({});

    server.registerTool(
      name,
      {
        description,
        inputSchema
      },
      async (args) => {
        try {
          // Normalize a couple of params for robustness
          const normalizedArgs = { ...(args || {}) };

          // labels: allow "a,b" -> ["a","b"]
          if (name === 'create_issue' && typeof normalizedArgs.labels === 'string') {
            normalizedArgs.labels = normalizedArgs.labels
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
          }

          const result = await toolProvider.executeTool(name, normalizedArgs);

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

  console.log(`[MCP] Registered ${tools.length} tools (${providerName})`);
}

/**
 * Create transport for each request (stateless mode)
 */
async function createTransportForRequest(server) {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined // Stateless mode
  });

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

  const transport = await createTransportForRequest(mcpServer);

  try {
    await transport.handleRequest(req, res, body);
  } finally {
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
