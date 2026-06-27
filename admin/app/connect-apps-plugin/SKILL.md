---
name: connect-apps-plugin
description: Connect to and interact with external apps — Gmail, Google Drive, Canva, Shopify, Strava, and Microsoft 365. Trigger when the user says "connect to", "open", "check", "send", "upload", or asks about any of these services.
---

# connect-apps-plugin

Use this skill to help the user interact with connected external apps via MCP tools.

## Supported apps

- **Gmail** — search threads, create drafts, label messages
- **Google Drive** — read, search, create, and copy files
- **Canva** — generate or edit designs
- **Shopify** — manage products, orders, customers, and inventory
- **Strava** — view activities, athlete profile, training plans
- **Microsoft 365** — authenticate and access Microsoft services

## Steps

1. Identify which app the user wants to interact with.
2. Call the relevant MCP tool (e.g. `mcp__claude_ai_Gmail__search_threads`, `mcp__claude_ai_Google_Drive__read_file_content`, etc.).
3. Present results clearly and offer follow-up actions.
