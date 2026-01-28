# API Specifications

This directory contains API specifications for different client protocols.

## Files

### `openapi.json`
**Purpose:** REST API specification for ChatGPT Actions  
**Format:** OpenAPI 3.0  
**Protocol:** HTTP/REST  
**Authentication:** Bearer token  

**Endpoints:**
- GitHub operations (7 endpoints)
- Health check

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://mcp.seeinside.me/github/repos
```

## Future Additions

### `gemini-functions.json` (Planned)
**Purpose:** Function calling specification for Google Gemini  
**Format:** Gemini Function Calling JSON  

## Notes

- All specifications point to the same tool implementations in `src/tools/`
- Different formats, same functionality
- Update both files when adding new tools
