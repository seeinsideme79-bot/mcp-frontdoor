require('dotenv').config();
const express = require('express');
const githubTool = require('./tools/github-mcp');
const mcpHandler = require('./mcp-handler');

const app = express();
const PORT = process.env.PORT || 9100;

// Create MCP Server instance (stateless mode)
const mcpServer = mcpHandler.createMcpServer();

// JSON body parser
app.use(express.json());

// Auth middleware (health check hariç)
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = process.env.MCP_AUTH_TOKEN;

  if (!token) {
    console.error('[AUTH] MCP_AUTH_TOKEN not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  if (authHeader.substring(7) !== token) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'remote-mcp-server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    tools: ['github', 'filesystem'],
    mode: 'stateless'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'remote-mcp-server',
    version: '1.0.0',
    mode: 'stateless',
    endpoints: {
      health: 'GET /health',
      mcp: 'POST /mcp (Stateless Streamable HTTP)',
      mcp_sse: 'GET /mcp (Server-Sent Events)',
      mcp_delete: 'DELETE /mcp (Session termination)',
      github_tools: 'GET /github/tools',
      github_repos: 'GET /github/repos',
      github_repo_detail: 'GET /github/repos/:owner/:repo',
      github_issues: 'GET /github/repos/:owner/:repo/issues',
      github_create_issue: 'POST /github/repos/:owner/:repo/issues',
      github_file_content: 'GET /github/repos/:owner/:repo/contents?path=...'
    }
  });
});

// MCP protocol endpoint (Stateless Streamable HTTP)
app.post('/mcp', async (req, res) => {
  try {
    await mcpHandler.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('[MCP] POST Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null
      });
    }
  }
});

// MCP SSE endpoint (for real-time notifications)
app.get('/mcp', async (req, res) => {
  try {
    await mcpHandler.handleRequest(req, res);
  } catch (error) {
    console.error('[MCP] GET Error:', error.message);
    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  }
});

// MCP DELETE endpoint (session termination)
app.delete('/mcp', async (req, res) => {
  try {
    await mcpHandler.handleRequest(req, res);
  } catch (error) {
    console.error('[MCP] DELETE Error:', error.message);
    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  }
});

// ============================================
// GitHub Tool Endpoints
// ============================================

// Get available GitHub tools
app.get('/github/tools', (req, res) => {
  try {
    const tools = githubTool.getAvailableTools();
    res.json({
      success: true,
      tools: tools
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List repositories
app.get('/github/repos', async (req, res) => {
  try {
    const repos = await githubTool.listRepositories();
    res.json({
      success: true,
      count: repos.length,
      repositories: repos
    });
  } catch (error) {
    console.error('Error listing repos:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get repository details
app.get('/github/repos/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repoData = await githubTool.getRepository(owner, repo);
    res.json({
      success: true,
      repository: repoData
    });
  } catch (error) {
    console.error('Error getting repo:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List issues
app.get('/github/repos/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'open' } = req.query;
    const issues = await githubTool.listIssues(owner, repo, state);
    res.json({
      success: true,
      count: issues.length,
      issues: issues
    });
  } catch (error) {
    console.error('Error listing issues:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create issue
app.post('/github/repos/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { title, body, labels } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const issue = await githubTool.createIssue(owner, repo, title, body, labels);
    res.json({
      success: true,
      issue: issue
    });
  } catch (error) {
    console.error('Error creating issue:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get file content
app.get('/github/repos/:owner/:repo/contents', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { path: filePath, branch } = req.query;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required as query parameter (?path=...)'
      });
    }

    const fileData = await githubTool.getFileContent(owner, repo, filePath, branch);
    res.json({
      success: true,
      file: fileData
    });
  } catch (error) {
    console.error('Error getting file:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List branches
app.get('/github/repos/:owner/:repo/branches', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const branches = await githubTool.listBranches(owner, repo);
    res.json({
      success: true,
      count: branches.length,
      branches: branches
    });
  } catch (error) {
    console.error('Error listing branches:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search code
app.get('/github/search/code', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const results = await githubTool.searchCode(q, parseInt(limit));
    res.json({
      success: true,
      count: results.length,
      results: results
    });
  } catch (error) {
    console.error('Error searching code:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Remote MCP Server listening on http://127.0.0.1:${PORT}`);
  console.log(`Mode: Stateless (multi-client support)`);
  console.log(`Health check: http://127.0.0.1:${PORT}/health`);
  console.log(`MCP endpoint: POST/GET/DELETE http://127.0.0.1:${PORT}/mcp`);
  console.log(`Available tools: GitHub`);
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
