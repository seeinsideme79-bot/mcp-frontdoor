const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

/**
 * GitHub MCP Tool
 * Provides GitHub operations for MCP protocol
 */
class GitHubMCPTool {
  constructor() {
    this.name = 'github';
    this.description = 'GitHub repository and issue management tool';
  }

  /**
   * List repositories for authenticated user
   * @returns {Promise<Array>} List of repositories
   */
  async listRepositories() {
    try {
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 30
      });

      return data.map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        private: repo.private,
        updated_at: repo.updated_at,
        stars: repo.stargazers_count,
        language: repo.language
      }));
    } catch (error) {
      throw new Error(`Failed to list repositories: ${error.message}`);
    }
  }

  /**
   * Get repository information
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Repository details
   */
  async getRepository(owner, repo) {
    try {
      const { data } = await octokit.rest.repos.get({
        owner,
        repo
      });

      return {
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        url: data.html_url,
        private: data.private,
        created_at: data.created_at,
        updated_at: data.updated_at,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        topics: data.topics,
        default_branch: data.default_branch
      };
    } catch (error) {
      throw new Error(`Failed to get repository: ${error.message}`);
    }
  }

  /**
   * List issues for a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} state - Issue state (open, closed, all)
   * @returns {Promise<Array>} List of issues
   */
  async listIssues(owner, repo, state = 'open') {
    try {
      const { data } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state,
        per_page: 30
      });

      return data.map(issue => ({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        url: issue.html_url,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        labels: issue.labels.map(l => l.name),
        assignees: issue.assignees.map(a => a.login)
      }));
    } catch (error) {
      throw new Error(`Failed to list issues: ${error.message}`);
    }
  }

  /**
   * Create a new issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} title - Issue title
   * @param {string} body - Issue body
   * @param {Array} labels - Issue labels
   * @returns {Promise<Object>} Created issue
   */
  async createIssue(owner, repo, title, body, labels = []) {
    try {
      const { data } = await octokit.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels
      });

      return {
        number: data.number,
        title: data.title,
        url: data.html_url,
        created_at: data.created_at
      };
    } catch (error) {
      throw new Error(`Failed to create issue: ${error.message}`);
    }
  }

  /**
   * Get file content from repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - File path
   * @param {string} branch - Branch name (optional)
   * @returns {Promise<Object>} File content
   */
  async getFileContent(owner, repo, path, branch = null) {
    try {
      const params = {
        owner,
        repo,
        path
      };
      
      if (branch) {
        params.ref = branch;
      }

      const { data } = await octokit.rest.repos.getContent(params);

      if (data.type !== 'file') {
        throw new Error('Path is not a file');
      }

      const content = Buffer.from(data.content, 'base64').toString('utf8');

      return {
        name: data.name,
        path: data.path,
        size: data.size,
        content: content,
        sha: data.sha,
        url: data.html_url
      };
    } catch (error) {
      throw new Error(`Failed to get file content: ${error.message}`);
    }
  }

  /**
   * Search code in repositories
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} Search results
   */
  async searchCode(query, limit = 10) {
    try {
      const { data } = await octokit.rest.search.code({
        q: query,
        per_page: limit
      });

      return data.items.map(item => ({
        name: item.name,
        path: item.path,
        repository: item.repository.full_name,
        url: item.html_url,
        score: item.score
      }));
    } catch (error) {
      throw new Error(`Failed to search code: ${error.message}`);
    }
  }

  /**
   * List branches for a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Array>} List of branches
   */
  async listBranches(owner, repo) {
    try {
      const { data } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 50
      });

      return data.map(branch => ({
        name: branch.name,
        protected: branch.protected,
        commit_sha: branch.commit.sha
      }));
    } catch (error) {
      throw new Error(`Failed to list branches: ${error.message}`);
    }
  }

  /**
   * Update or create a file in repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - File path
   * @param {string} content - File content
   * @param {string} message - Commit message
   * @param {string} branch - Branch name (optional, defaults to default branch)
   * @param {string} sha - File SHA for updates (optional, omit for new files)
   * @returns {Promise<Object>} Commit result
   */
  async updateFile(owner, repo, path, content, message, branch = null, sha = null) {
    try {
      // Get current file SHA if not provided (for updates)
      if (!sha) {
        try {
          const currentFile = await this.getFileContent(owner, repo, path, branch);
          sha = currentFile.sha;
        } catch (error) {
          // File doesn't exist, will create new file
          sha = null;
        }
      }

      const params = {
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64')
      };

      if (branch) {
        params.branch = branch;
      }

      if (sha) {
        params.sha = sha;
      }

      const { data } = await octokit.rest.repos.createOrUpdateFileContents(params);

      return {
        commit: {
          sha: data.commit.sha,
          message: data.commit.message,
          url: data.commit.html_url
        },
        content: {
          path: data.content.path,
          sha: data.content.sha,
          url: data.content.html_url
        }
      };
    } catch (error) {
      throw new Error(`Failed to update file: ${error.message}`);
    }
  }

  /**
   * Create or update multiple files in a single commit
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   * @param {string} message - Commit message
   * @param {Array} files - Array of {path, content} objects
   * @returns {Promise<Object>} Commit result
   */
  async createOrUpdateFiles(owner, repo, branch, message, files) {
    try {
      // Get the latest commit SHA on the branch
      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`
      });
      const latestCommitSha = refData.object.sha;

      // Get the tree SHA of the latest commit
      const { data: commitData } = await octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: latestCommitSha
      });
      const baseTreeSha = commitData.tree.sha;

      // Create blobs for each file
      const tree = [];
      for (const file of files) {
        const { data: blobData } = await octokit.rest.git.createBlob({
          owner,
          repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64'
        });

        tree.push({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        });
      }

      // Create a new tree
      const { data: treeData } = await octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: baseTreeSha,
        tree
      });

      // Create a new commit
      const { data: newCommit } = await octokit.rest.git.createCommit({
        owner,
        repo,
        message,
        tree: treeData.sha,
        parents: [latestCommitSha]
      });

      // Update the reference
      await octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha
      });

      return {
        commit: {
          sha: newCommit.sha,
          message: newCommit.message,
          url: newCommit.html_url
        },
        files: files.map(f => f.path)
      };
    } catch (error) {
      throw new Error(`Failed to create/update files: ${error.message}`);
    }
  }

  /**
   * Create a pull request
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} title - PR title
   * @param {string} head - Head branch (source)
   * @param {string} base - Base branch (target)
   * @param {string} body - PR body (optional)
   * @returns {Promise<Object>} Created pull request
   */
  async createPullRequest(owner, repo, title, head, base, body = '') {
    try {
      const { data } = await octokit.rest.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body
      });

      return {
        number: data.number,
        title: data.title,
        state: data.state,
        url: data.html_url,
        created_at: data.created_at,
        head: data.head.ref,
        base: data.base.ref
      };
    } catch (error) {
      throw new Error(`Failed to create pull request: ${error.message}`);
    }
  }

  /**
   * Get available tools/methods for MCP
   * @returns {Array} List of available tools
   */
  getAvailableTools() {
    return [
      {
        name: 'list_repositories',
        description: 'List repositories for authenticated user',
        parameters: {}
      },
      {
        name: 'get_repository',
        description: 'Get detailed information about a repository',
        parameters: {
          owner: 'Repository owner',
          repo: 'Repository name'
        }
      },
      {
        name: 'list_issues',
        description: 'List issues for a repository',
        parameters: {
          owner: 'Repository owner',
          repo: 'Repository name',
          state: 'Issue state (open/closed/all)'
        }
      },
      {
        name: 'create_issue',
        description: 'Create a new issue in a repository',
        parameters: {
          owner: 'Repository owner',
          repo: 'Repository name',
          title: 'Issue title',
          body: 'Issue body',
          labels: 'Issue labels (optional)'
        }
      },
      {
        name: 'get_file_content',
        description: 'Get content of a file from repository',
        parameters: {
          owner: 'Repository owner',
          repo: 'Repository name',
          path: 'File path',
          branch: 'Branch name (optional)'
        }
      },
      {
        name: 'search_code',
        description: 'Search code across repositories',
        parameters: {
          query: 'Search query',
          limit: 'Result limit (optional)'
        }
      },
      {
        name: 'list_branches',
        description: 'List branches for a repository',
        parameters: {
          owner: 'Repository owner',
          repo: 'Repository name'
        }
      },
      {
        name: 'update_file',
        description: 'Update or create a single file in repository',
        parameters: {
          owner: 'Repository owner',
          repo: 'Repository name',
          path: 'File path',
          content: 'File content',
          message: 'Commit message',
          branch: 'Branch name (optional)',
          sha: 'File SHA for updates (optional)'
        }
      },
      {
        name: 'create_or_update_files',
        description: 'Create or update multiple files in a single commit',
        parameters: {
          owner: 'Repository owner',
          repo: 'Repository name',
          branch: 'Branch name',
          message: 'Commit message',
          files: 'Array of {path, content} objects'
        }
      },
      {
        name: 'create_pull_request',
        description: 'Create a pull request',
        parameters: {
          owner: 'Repository owner',
          repo: 'Repository name',
          title: 'PR title',
          head: 'Head branch (source)',
          base: 'Base branch (target)',
          body: 'PR body (optional)'
        }
      }
    ];
  }

  /**
   * Execute a tool by name
   * @param {string} toolName - Tool name
   * @param {Object} params - Tool parameters
   * @returns {Promise<any>} Tool result
   */
  async executeTool(toolName, params) {
    switch (toolName) {
      case 'list_repositories':
        return await this.listRepositories();
      
      case 'get_repository':
        return await this.getRepository(params.owner, params.repo);
      
      case 'list_issues':
        return await this.listIssues(params.owner, params.repo, params.state);
      
      case 'create_issue':
        return await this.createIssue(
          params.owner,
          params.repo,
          params.title,
          params.body,
          params.labels
        );
      
      case 'get_file_content':
        return await this.getFileContent(
          params.owner,
          params.repo,
          params.path,
          params.branch
        );
      
      case 'search_code':
        return await this.searchCode(params.query, params.limit);
      
      case 'list_branches':
        return await this.listBranches(params.owner, params.repo);
      
      case 'update_file':
        return await this.updateFile(
          params.owner,
          params.repo,
          params.path,
          params.content,
          params.message,
          params.branch,
          params.sha
        );
      
      case 'create_or_update_files':
        return await this.createOrUpdateFiles(
          params.owner,
          params.repo,
          params.branch,
          params.message,
          params.files
        );
      
      case 'create_pull_request':
        return await this.createPullRequest(
          params.owner,
          params.repo,
          params.title,
          params.head,
          params.base,
          params.body
        );
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

// Export singleton instance
module.exports = new GitHubMCPTool();
