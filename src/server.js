/**
 * MCP Frontdoor Server
 * Multi-protocol gateway for AI tool access
 */

require('dotenv').config();
const express = require('express');
const authMiddleware = require('./gateway/middleware/auth');
const loggerMiddleware = require('./gateway/middleware/logger');
const healthRoute = require('./gateway/routes/health');
const githubRoute = require('./gateway/routes/github');
const mcpRoute = require('./gateway/routes/mcp');
const wellKnownRoute = require('./gateway/routes/wellKnown');
const mcpHandler = require('./mcp/handler');

const app = express();
const PORT = process.env.PORT || 9100;
app.set('trust proxy', true);

// Create MCP Server instance (stateless mode)
const mcpServer = mcpHandler.createMcpServer();

// Middleware
app.use(express.json());
app.use(loggerMiddleware);
// Public OAuth metadata (must be accessible without auth)
app.use('/.well-known', wellKnownRoute);
app.use(authMiddleware);

// Routes
app.use('/health', healthRoute);
app.use('/github', githubRoute);
app.use('/mcp', mcpRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'remote-mcp-server',
    version: '1.0.0',
    mode: 'stateless',
    endpoints: {
      health: 'GET /health',
      mcp: 'POST/GET/DELETE /mcp',
      github_repos: 'GET /github/repos',
      github_repo_detail: 'GET /github/repos/:owner/:repo',
      github_issues: 'GET /github/repos/:owner/:repo/issues',
      github_create_issue: 'POST /github/repos/:owner/:repo/issues',
      github_file_content: 'GET /github/repos/:owner/:repo/contents?path=...',
      github_branches: 'GET /github/repos/:owner/:repo/branches',
      github_search_code: 'GET /github/search/code?q=...'
    }
  });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Remote MCP Server listening on http://127.0.0.1:${PORT}`);
  console.log(`Mode: Stateless (multi-client support)`);
  console.log(`Health check: http://127.0.0.1:${PORT}/health`);
  console.log(`MCP endpoint: POST/GET/DELETE http://127.0.0.1:${PORT}/mcp`);
  console.log(`Available tools: GitHub, Filesystem`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await mcpHandler.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await mcpHandler.cleanup();
  process.exit(0);
});

module.exports = app;
