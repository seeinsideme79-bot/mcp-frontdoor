# Filesystem Tool

Secure filesystem operations with path validation.

## Security

**CRITICAL:** All operations are restricted to:
```
ALLOWED_BASE = '/home/ubuntu/projects'
```

**Path Validation:**
- All paths resolved to absolute paths
- Validated against base directory
- Directory traversal attacks prevented
- Access outside base directory denied

## Operations (4)

1. **read_file** - Read file content
2. **write_file** - Write content to file (creates parent directories)
3. **list_directory** - List directory contents
4. **create_directory** - Create new directory

## Security Examples

**Allowed:**
- `remote-mcp-server/package.json` ✅
- `./project/file.txt` ✅

**Denied:**
- `/etc/passwd` ❌
- `../../../etc/passwd` ❌
