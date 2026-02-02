function esc(v) {
  return String(v || '').replace(/"/g, '\\"');
}

function buildWwwAuthenticate({ resourceMetadataUrl, scope, error, errorDescription }) {
  const parts = ['Bearer'];
  if (resourceMetadataUrl) parts.push(`resource_metadata="${esc(resourceMetadataUrl)}"`);
  if (scope) parts.push(`scope="${esc(scope)}"`);
  if (error) parts.push(`error="${esc(error)}"`);
  if (errorDescription) parts.push(`error_description="${esc(errorDescription)}"`);
  return parts.join(' ');
}

module.exports = { buildWwwAuthenticate };
