/**
 * MCP Protocol Route
 * Handles MCP JSON-RPC requests for Claude Desktop
 */

const express = require('express');
const mcpHandler = require('../../mcp/handler');

const router = express.Router();

// MCP protocol endpoint (Stateless Streamable HTTP)
router.post('/', async (req, res) => {
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
router.get('/', async (req, res) => {
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
router.delete('/', async (req, res) => {
  try {
    await mcpHandler.handleRequest(req, res);
  } catch (error) {
    console.error('[MCP] DELETE Error:', error.message);
    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  }
});

module.exports = router;
