# MCP Frontdoor - Deployment Guide

**Version:** 1.0.0  
**Last Updated:** 2026-01-28  

## Overview

This is the main deployment guide. Follow documents in order:

1. [Prerequisites](DEPLOYMENT-01-PREREQUISITES.md) - Requirements and preparation
2. [Server Setup](DEPLOYMENT-02-SERVER-SETUP.md) - Ubuntu server installation
3. [Application Code](DEPLOYMENT-03-APPLICATION-CODE.md) - Node.js application files
4. [Nginx & SSL](DEPLOYMENT-04-NGINX-SSL.md) - Reverse proxy and certificates
5. [Windows Client](DEPLOYMENT-05-WINDOWS-CLIENT.md) - Claude Desktop setup
6. [Testing](DEPLOYMENT-06-TESTING.md) - Verification and testing
7. [Troubleshooting](DEPLOYMENT-07-TROUBLESHOOTING.md) - Common issues and solutions
8. [Maintenance](DEPLOYMENT-08-MAINTENANCE.md) - Ongoing operations

## Quick Reference

**Estimated Time:** 60-90 minutes  
**Skill Level:** Intermediate  
**Prerequisites:** Basic Linux, Node.js knowledge  

## Variables

Replace these throughout the guides:
```bash
DOMAIN="mcp.yourdomain.com"
SERVER_IP="123.456.789.012"
GITHUB_TOKEN="ghp_xxxxx"
MCP_AUTH_TOKEN="generate_with_openssl_rand"
```

## Support

- Report issues on GitHub
- Check troubleshooting guide
- Review architecture docs
