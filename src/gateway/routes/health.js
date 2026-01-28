/**
 * Health Check Route
 * Public endpoint for server status monitoring
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'remote-mcp-server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    tools: ['github', 'filesystem'],
    mode: 'stateless'
  });
});

module.exports = router;
