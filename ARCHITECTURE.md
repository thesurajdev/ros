# Architecture

## Overview

Relationship OS is an AI-native knowledge repository built around a simple event-driven core.

The current implementation exposes:

- an MCP server for AI tool use
- an HTTP API for deployment platforms
- a knowledge engine that stores entities, events, and relationships
- a persistence layer that can target the in-memory store or a JSON file store
- a D1-compatible repository for Cloudflare Workers

## Core concepts

- Entity: a business object such as a client, booking, company, or payment.
- Event: an immutable record describing a state change.
- Relationship: a typed link between two entities.
- Projection: a materialized read model derived from events.

## Current implementation shape

### Runtime entrypoints

- MCP server: src/mcp/server.ts
- HTTP server: src/server.ts
- Worker entrypoint: src/worker.ts

### Core services

- KnowledgeEngine: orchestrates remember, ask, search, timeline, report, link, unlink, and describe
- TransactionManager: validates and coordinates write operations

### Storage

- In-memory repository for development
- JsonFileKnowledgeStore for file-based persistence
- D1KnowledgeStore for Cloudflare Workers / D1

## Design direction

The project should evolve toward an event-first architecture:

- events are the source of truth
- entities and relationships are projections of those events
- timelines and reports are derived views

This keeps the system explainable and easier to evolve as more business rules are added.
