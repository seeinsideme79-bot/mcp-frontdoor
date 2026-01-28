# GitHub Tool

GitHub repository and issue management operations.

## Operations (7)

1. **list_repositories** - List user's repositories
2. **get_repository** - Get repository details
3. **list_issues** - List repository issues
4. **create_issue** - Create new issue
5. **get_file_content** - Read file from repository
6. **search_code** - Search code across repositories
7. **list_branches** - List repository branches

## Configuration

Set `GITHUB_TOKEN` in `.env`:
```bash
GITHUB_TOKEN=ghp_your_token_here
```

**Token Requirements:**
- Scope: `repo` (full control of private repositories)
- Generate at: https://github.com/settings/tokens

## Error Handling

All methods throw descriptive errors.
