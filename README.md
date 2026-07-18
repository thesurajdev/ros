# Relationship OS (RO)

Relationship OS is an AI-native knowledge repository for storing business knowledge through MCP tools and HTTP APIs.

## What is included

- TypeScript + Node.js backend
- MCP server exposing remember, ask, search, timeline, report, link, unlink, and describe
- HTTP service for deployment platforms such as Cloudways
- In-memory knowledge engine with validation, events, relationships, and audit trail
- D1 schema definition for future Cloudflare deployment
- Seed data for a starter knowledge graph

## Project structure

- src/types – shared domain types
- src/lib – validation, UUID helpers, and errors
- src/repositories – repository abstractions and in-memory implementation
- src/services – knowledge engine and transaction manager
- src/mcp – MCP server entrypoint
- src/server.ts – HTTP server for Cloudways-style hosting
- src/schema.sql – D1 schema
- src/seed.ts – starter data

## Development

```bash
npm install
npm run dev
```

The server runs as an MCP stdio server and can also be started as an HTTP service for Cloudways.

## Cloudflare Workers deployment

This repository includes a Cloudflare Workers entrypoint at `src/worker.ts` and D1 database support via `src/repositories/d1KnowledgeStore.ts`.

1. Install dependencies: `npm install`
2. Start local Worker development: `npm run dev:worker`
3. Build the Worker: `npm run build:worker`
4. Deploy with Wrangler: `npm run deploy:worker`
5. Bind a D1 database named `relationship_os` to the `ROS_KNOWLEDGE_DB` environment in `wrangler.toml`.
6. For CI/CD, set `CF_API_TOKEN` and `CF_ACCOUNT_ID` in GitHub repository secrets, then push to `main`.
7. After deployment, confirm the worker URL in the Cloudflare dashboard or by checking the `wrangler deploy` output.
8. Use the worker endpoints:
   - `/health`
   - `/api/describe`
   - `/api/remember`
   - `/api/ask`
   - `/api/search`

## Cloudways deployment

1. Build the app with `npm run build`.
2. Start it with `node dist/server.js` or use the provided `cloudways-start.sh` script.
3. Set the `PORT` environment variable to the port provided by Cloudways.
4. Health endpoint: `/health`
5. API endpoints: `/api/remember`, `/api/ask`, `/api/search`, `/api/describe`

## Deployment notes

- The Worker path is the recommended production deployment for the current architecture.
- Apply the SQL in `src/schema.sql` to the D1 database.
- The Node HTTP server remains available for local development and Cloudways-style hosting.

## Testing

```bash
npm test
```
