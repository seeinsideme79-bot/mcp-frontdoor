# Application Logs

Runtime logs for monitoring and debugging.

## Files

- `remote-mcp-server-access.log` - Access logs
- `remote-mcp-server-error.log` - Error logs

## Viewing Logs
```bash
tail -f logs/remote-mcp-server-access.log
tail -f logs/remote-mcp-server-error.log
sudo journalctl -u remote-mcp-server -f
```
