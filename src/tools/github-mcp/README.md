# GitHub MCP Tool

GitHub API integration for MCP protocol with read and write operations.

## Available Operations

### Read Operations (7 tools)
- **list_repositories** - List repositories for authenticated user
- **get_repository** - Get detailed repository information
- **list_branches** - List branches in a repository
- **list_issues** - List issues with filtering
- **get_file_content** - Get content of a file
- **search_code** - Search code across repositories

### Write Operations (3 tools - NEW)
- **update_file** - Create or update a single file
- **create_or_update_files** - Create or update multiple files in a single commit
- **create_pull_request** - Create a pull request
- **create_issue** - Create a new issue

## OAuth Scopes

### git:read
Required for:
- list_repositories
- get_repository
- list_branches
- search_code
- get_file_content

### git:write
Required for:
- update_file
- create_or_update_files
- create_pull_request

### issues:read
Required for:
- list_issues

### issues:write
Required for:
- create_issue

## Usage Examples

### Update Single File
```javascript
await updateFile(
  'owner',
  'repo',
  'path/to/file.txt',
  'file content',
  'commit message',
  'main',  // branch (optional)
  null     // sha (optional, auto-detected)
);
```

### Update Multiple Files in One Commit
```javascript
await createOrUpdateFiles(
  'owner',
  'repo',
  'main',
  'Update documentation',
  [
    { path: 'README.md', content: 'new readme' },
    { path: 'docs/API.md', content: 'new api docs' }
  ]
);
```

### Create Pull Request
```javascript
await createPullRequest(
  'owner',
  'repo',
  'Feature: Add new functionality',
  'feature-branch',  // head (source)
  'main',            // base (target)
  'PR description'   // body (optional)
);
```

## Implementation Notes

- Uses @octokit/rest for GitHub API
- Requires GITHUB_TOKEN environment variable
- Token needs repo scope for write operations
- Auto-detects file SHA for updates
- Supports creating new files (omit SHA)
- Multiple file commits use Git Tree API for atomicity

## Recent Updates (Feb 2026)

- ✅ Added update_file for single file operations
- ✅ Added create_or_update_files for atomic multi-file commits
- ✅ Added create_pull_request for PR creation
- ✅ Enhanced error handling and validation
- ✅ Added OAuth scope mappings
