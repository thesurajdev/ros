# Roadmap

## Current status snapshot

- ✅ D1 schema and SQL definition
- ✅ Repository layer abstraction
- ✅ Event-backed in-memory flow
- ✅ Entity projections
- ✅ Transaction manager
- ✅ Validation layer
- ✅ MCP server entrypoint
- ✅ HTTP API entrypoint
- ✅ Unit tests for engine, persistence, and server
- ⏳ Search refinement
- ⏳ Timeline refinement
- ⏳ Reports and analytics

## Milestones

### Milestone 1 — Core knowledge primitives (completed)

Focus: establish the base model of entities, events, and relationships.

- Implement entity creation and persistence
- Record immutable events
- Support simple relationship linking
- Expose MCP and HTTP interfaces

Estimated effort: 1-2 days

### Milestone 2 — Robust validation and transaction safety (in progress)

Focus: make writes safer and less ambiguous.

- Improve validation for entity identity and relationship rules
- Prevent duplicate or conflicting writes
- Add idempotency-style safeguards for AI-driven writes
- Add integration tests for the full create/read flow

Estimated effort: 2-3 days

### Milestone 3 — Search, timeline, and reporting (planned)

Focus: make the knowledge graph usable for real queries.

- Improve search ranking and filtering
- Build richer timeline views from event history
- Add basic reporting summaries

Estimated effort: 3-5 days

### Milestone 4 — Production readiness (planned)

Focus: prepare for deployment and long-term maintenance.

- Add migrations and schema versioning
- Harden the D1 storage path
- Add deployment validation and operational docs
- Introduce more integration coverage

Estimated effort: 3-7 days

## Suggested next actions

1. Split KnowledgeEngine into smaller domain services.
2. Add explicit event-sourcing semantics for create/update/delete operations.
3. Add a richer validation layer for entity-relationship consistency.
4. Expand tests to cover relationship creation, timeline generation, and reports.
5. Prepare a demo flow for client + booking + payment + timeline.
