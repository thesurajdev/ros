# MCP Tool Reference

## Overview

The MCP server exposes a small, stable tool surface for storing and querying knowledge.

## Tool: remember

### Purpose
Create a new entity and record an immutable creation event.

### Request schema
```json
{
  "intent": "string",
  "entity": {
    "type": "Booking | Client | Company | Artist | Invoice | Employee | Task | ContactPerson | Payment",
    "name": "string",
    "id": "string"
  },
  "action": "create",
  "payload": {}
}
```

### Response schema
```json
{
  "entity": {
    "id": "string",
    "type": "string",
    "name": "string",
    "state": {},
    "summary": "string",
    "status": "active|archived|completed|pending|cancelled",
    "created_at": "string",
    "updated_at": "string"
  },
  "event": {
    "id": "string",
    "entity_id": "string",
    "event_type": "string",
    "payload": {},
    "created_at": "string"
  }
}
```

### Example request
```json
{
  "intent": "Create client",
  "entity": { "type": "Client", "name": "Asha" },
  "action": "create",
  "payload": { "city": "Bengaluru" }
}
```

### Example response
```json
{
  "entity": {
    "id": "entity-123",
    "type": "Client",
    "name": "Asha",
    "state": { "city": "Bengaluru" },
    "summary": "CREATE Client Asha",
    "status": "active",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  },
  "event": {
    "id": "event-123",
    "entity_id": "entity-123",
    "event_type": "entity_created",
    "payload": { "intent": "Create client" },
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

### Possible errors
- ValidationFailed
- DuplicateEntity
- AmbiguousEntity

## Tool: ask

### Purpose
Answer a simple question or process a query string.

### Request schema
```json
{
  "query": "string"
}
```

### Response schema
```json
{
  "answer": "string"
}
```

### Example request
```json
{
  "query": "Tell me about Asha"
}
```

### Example response
```json
{
  "answer": "Processed query: Tell me about Asha"
}
```

### Possible errors
- None currently beyond generic runtime errors

## Tool: search

### Purpose
Search entities by name, type, or summary.

### Request schema
```json
{
  "query": "string"
}
```

### Response schema
```json
[
  {
    "id": "string",
    "type": "string",
    "name": "string",
    "state": {},
    "summary": "string",
    "status": "string",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

### Example request
```json
{
  "query": "Asha"
}
```

### Example response
```json
[
  {
    "id": "entity-123",
    "type": "Client",
    "name": "Asha",
    "state": { "city": "Bengaluru" },
    "summary": "CREATE Client Asha",
    "status": "active"
  }
]
```

### Possible errors
- None currently beyond generic runtime errors

## Tool: timeline

### Purpose
Return the event history for a specific entity.

### Request schema
```json
{
  "entityId": "string"
}
```

### Response schema
```json
[
  {
    "id": "string",
    "entity_id": "string",
    "event_type": "string",
    "payload": {},
    "created_at": "string"
  }
]
```

### Example request
```json
{
  "entityId": "entity-123"
}
```

### Example response
```json
[
  {
    "id": "event-123",
    "entity_id": "entity-123",
    "event_type": "entity_created",
    "payload": { "intent": "Create client" },
    "created_at": "2026-01-01T00:00:00.000Z"
  }
]
```

### Possible errors
- EntityNotFound

## Tool: report

### Purpose
Generate a simple report view.

### Request schema
```json
{
  "type": "string"
}
```

### Response schema
```json
{
  "totalEntities": 0,
  "totalEvents": 0,
  "totalRelationships": 0
}
```

### Example request
```json
{
  "type": "activity"
}
```

### Example response
```json
{
  "totalEntities": 3,
  "totalEvents": 5,
  "totalRelationships": 1
}
```

### Possible errors
- None currently beyond generic runtime errors

## Tool: link

### Purpose
Create a relationship between two entities.

### Request schema
```json
{
  "from": "string",
  "to": "string",
  "relationshipType": "string"
}
```

### Response schema
```json
{
  "id": "string",
  "from_entity": "string",
  "to_entity": "string",
  "relationship_type": "string",
  "metadata": {},
  "created_at": "string"
}
```

### Example request
```json
{
  "from": "entity-1",
  "to": "entity-2",
  "relationshipType": "booked_for"
}
```

### Example response
```json
{
  "id": "relationship-1",
  "from_entity": "entity-1",
  "to_entity": "entity-2",
  "relationship_type": "booked_for",
  "metadata": {},
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

### Possible errors
- EntityNotFound
- DuplicateEntity
- ValidationFailed

## Tool: unlink

### Purpose
Remove a relationship between two entities.

### Request schema
```json
{
  "from": "string",
  "to": "string",
  "relationshipType": "string"
}
```

### Response schema
```json
"Relationship removed"
```

### Example request
```json
{
  "from": "entity-1",
  "to": "entity-2",
  "relationshipType": "booked_for"
}
```

### Example response
```json
"Relationship removed"
```

### Possible errors
- RelationshipNotFound
- ValidationFailed

## Tool: describe

### Purpose
Return the full in-memory or persisted knowledge graph snapshot.

### Request schema
```json
{}
```

### Response schema
```json
{
  "entities": [],
  "events": [],
  "relationships": []
}
```

### Example request
```json
{}
```

### Example response
```json
{
  "entities": [],
  "events": [],
  "relationships": []
}
```

### Possible errors
- None currently beyond generic runtime errors
