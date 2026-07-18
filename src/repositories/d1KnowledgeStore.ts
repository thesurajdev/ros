import type { D1Database } from '@cloudflare/workers-types';
import type { EntityRecord, EventRecord, RelationshipRecord } from '../types/index.js';
import type { KnowledgeStore } from './knowledgeStore.js';

export class D1KnowledgeStore implements KnowledgeStore {
  constructor(private readonly db: D1Database) {}

  async load() {
    const entitiesResult = await this.db.prepare('SELECT * FROM entities').all();
    const eventsResult = await this.db.prepare('SELECT * FROM events').all();
    const relationshipsResult = await this.db.prepare('SELECT * FROM relationships').all();

    const entities = (entitiesResult.results ?? []).map((row: any) => ({
      ...row,
      state: typeof row.state === 'string' ? JSON.parse(row.state) : row.state
    })) as EntityRecord[];

    const events = (eventsResult.results ?? []).map((row: any) => ({
      ...row,
      payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload
    })) as EventRecord[];

    const relationships = (relationshipsResult.results ?? []).map((row: any) => ({
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    })) as RelationshipRecord[];

    return { entities, events, relationships };
  }

  async save(data: { entities: EntityRecord[]; events: EventRecord[]; relationships: RelationshipRecord[] }) {
    await this.db.prepare('DELETE FROM entities').run();
    await this.db.prepare('DELETE FROM events').run();
    await this.db.prepare('DELETE FROM relationships').run();

    for (const entity of data.entities) {
      await this.db
        .prepare('INSERT INTO entities (id, type, name, state, summary, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(entity.id, entity.type, entity.name, JSON.stringify(entity.state), entity.summary, entity.status, entity.created_at, entity.updated_at)
        .run();
    }

    for (const event of data.events) {
      await this.db
        .prepare('INSERT INTO events (id, entity_id, event_type, payload, created_at) VALUES (?, ?, ?, ?, ?)')
        .bind(event.id, event.entity_id, event.event_type, JSON.stringify(event.payload), event.created_at)
        .run();
    }

    for (const relationship of data.relationships) {
      await this.db
        .prepare('INSERT INTO relationships (id, from_entity, to_entity, relationship_type, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(relationship.id, relationship.from_entity, relationship.to_entity, relationship.relationship_type, JSON.stringify(relationship.metadata), relationship.created_at)
        .run();
    }
  }
}
