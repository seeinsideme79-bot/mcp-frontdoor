/**
 * GitHub Tool Routes
 * REST API endpoints for GitHub operations
 */

const express = require('express');
const githubTool = require('../../tools/github-mcp');

const router = express.Router();

// List repositories
router.get('/repos', async (req, res) => {
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
router.get('/repos/:owner/:repo', async (req, res) => {
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
router.get('/repos/:owner/:repo/issues', async (req, res) => {
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
router.post('/repos/:owner/:repo/issues', async (req, res) => {
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
router.get('/repos/:owner/:repo/contents', async (req, res) => {
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
router.get('/repos/:owner/:repo/branches', async (req, res) => {
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
router.get('/search/code', async (req, res) => {
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

module.exports = router;
