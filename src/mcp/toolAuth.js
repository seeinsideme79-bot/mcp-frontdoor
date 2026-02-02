/**
 * Shared tool authorization mapping
 * Single source of truth for:
 *  - tool -> required OAuth scopes
 *  - tool -> securitySchemes metadata
 */

const TOOL_SCOPES = {
  // --- GitHub tools (read) ---
  list_repositories: ['git:read'],
  get_repository: ['git:read'],
  list_branches: ['git:read'],
  search_code: ['git:read'],
  get_file_content: ['git:read'],

  list_issues: ['issues:read'],
  create_issue: ['issues:write'],

  // --- GitHub tools (write) ---
  update_file: ['git:write'],
  create_or_update_files: ['git:write'],
  create_pull_request: ['git:write'],

  // --- Filesystem tools ---
  read_file: ['files:read'],
  list_directory: ['files:read'],

  write_file: ['files:write'],
  create_directory: ['files:write'],

  // (Later)
  // delete_file: ['files:delete']
};

function requiredScopesForTool(toolName) {
  return TOOL_SCOPES[String(toolName || '')] || [];
}

function securitySchemesForTool(toolName) {
  const scopes = requiredScopesForTool(toolName);
  if (!scopes.length) return [{ type: 'noauth' }];
  return [{ type: 'oauth2', scopes }];
}

function listAllScopesSupported() {
  const set = new Set();
  for (const scopes of Object.values(TOOL_SCOPES)) {
    for (const s of scopes) set.add(s);
  }
  return Array.from(set).sort();
}

module.exports = {
  TOOL_SCOPES,
  requiredScopesForTool,
  securitySchemesForTool,
  listAllScopesSupported
};
