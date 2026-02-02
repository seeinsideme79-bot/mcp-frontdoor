const fs = require('fs').promises;
const path = require('path');

// Allowed base directory (security boundary)
const ALLOWED_BASE = '/home/ubuntu';

/**
 * Filesystem MCP Tool
 * Provides secure filesystem operations for MCP protocol
 * SECURITY: Only allows operations within /home/ubuntu/projects
 */
class FilesystemMCPTool {
  constructor() {
    this.name = 'filesystem';
    this.description = 'Filesystem operations tool (read, write, list, mkdir)';
  }

  /**
   * Validate and resolve path to ensure it's within allowed directory
   * @param {string} userPath - User-provided path
   * @returns {string} Resolved absolute path
   * @throws {Error} If path is outside allowed directory
   */
  _validatePath(userPath) {
    const resolvedPath = path.resolve(ALLOWED_BASE, userPath);

    // Strong boundary check using path.relative (prevents prefix bypass)
    const rel = path.relative(ALLOWED_BASE, resolvedPath);

    const escapesBase =
      rel === '..' ||
      rel.startsWith('..' + path.sep) ||
      path.isAbsolute(rel);

    if (escapesBase) {
      throw new Error(`Access denied: Path must be within ${ALLOWED_BASE}`);
    }

    return resolvedPath;
  }

  /**
   * Read file content
   * @param {string} filePath - Relative path from base directory
   * @returns {Promise<Object>} File content and metadata
   */
  async readFile(filePath) {
    try {
      const fullPath = this._validatePath(filePath);

      const stats = await fs.stat(fullPath);
      if (!stats.isFile()) {
        throw new Error('Path is not a file');
      }

      const content = await fs.readFile(fullPath, 'utf8');

      return {
        path: filePath,
        fullPath: fullPath,
        content: content,
        size: stats.size,
        modified: stats.mtime.toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Write content to file
   * @param {string} filePath - Relative path from base directory
   * @param {string} content - Content to write
   * @returns {Promise<Object>} Write result
   */
  async writeFile(filePath, content) {
    try {
      const fullPath = this._validatePath(filePath);

      // Ensure parent directory exists
      const parentDir = path.dirname(fullPath);
      await fs.mkdir(parentDir, { recursive: true });

      // Write file
      await fs.writeFile(fullPath, content, 'utf8');

      const stats = await fs.stat(fullPath);

      return {
        path: filePath,
        fullPath: fullPath,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        success: true
      };
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  /**
   * List directory contents
   * @param {string} dirPath - Relative path from base directory
   * @returns {Promise<Object>} Directory listing
   */
  async listDirectory(dirPath = '.') {
    try {
      const fullPath = this._validatePath(dirPath);

      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        throw new Error('Path is not a directory');
      }

      const entries = await fs.readdir(fullPath, { withFileTypes: true });

      const items = await Promise.all(
        entries.map(async (entry) => {
          const itemPath = path.join(fullPath, entry.name);
          const itemStats = await fs.stat(itemPath);

          return {
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: itemStats.size,
            modified: itemStats.mtime.toISOString()
          };
        })
      );

      return {
        path: dirPath,
        fullPath: fullPath,
        items: items,
        count: items.length
      };
    } catch (error) {
      throw new Error(`Failed to list directory: ${error.message}`);
    }
  }

  /**
   * Create directory
   * @param {string} dirPath - Relative path from base directory
   * @param {boolean} recursive - Create parent directories if needed
   * @returns {Promise<Object>} Create result
   */
  async createDirectory(dirPath, recursive = true) {
    try {
      const fullPath = this._validatePath(dirPath);

      await fs.mkdir(fullPath, { recursive });

      return {
        path: dirPath,
        fullPath: fullPath,
        success: true
      };
    } catch (error) {
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  }

  /**
   * Get available tools/methods for MCP
   * @returns {Array} List of available tools
   */
  getAvailableTools() {
    return [
      {
        name: 'read_file',
        description: `Read file content (base: ${ALLOWED_BASE})`,
        parameters: {
          path: 'Relative file path from base directory'
        }
      },
      {
        name: 'write_file',
        description: `Write content to file (base: ${ALLOWED_BASE})`,
        parameters: {
          path: 'Relative file path from base directory',
          content: 'Content to write'
        }
      },
      {
        name: 'list_directory',
        description: `List directory contents (base: ${ALLOWED_BASE})`,
        parameters: {
          path: 'Relative directory path from base directory (default: ".")'
        }
      },
      {
        name: 'create_directory',
        description: `Create directory (base: ${ALLOWED_BASE})`,
        parameters: {
          path: 'Relative directory path from base directory',
          recursive: 'Create parent directories if needed (default: true)'
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
      case 'read_file':
        return await this.readFile(params.path);

      case 'write_file':
        return await this.writeFile(params.path, params.content);

      case 'list_directory':
        return await this.listDirectory(params.path || '.');

      case 'create_directory':
        return await this.createDirectory(params.path, params.recursive !== false);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

// Export singleton instance
module.exports = new FilesystemMCPTool();
