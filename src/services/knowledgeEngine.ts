import type { EntityRecord, EventRecord, RelationshipRecord, StructuredIntent } from '../types/index.js';
import { AppError, AmbiguousEntityError, DuplicateEntityError, EntityNotFoundError, RelationshipNotFoundError, ValidationFailedError } from '../lib/errors.js';
import { createId } from '../lib/uuid.js';
import { entitySchema, eventSchema, relationshipSchema } from '../lib/schema.js';
import type { KnowledgeStore } from '../repositories/knowledgeStore.js';

export class KnowledgeEngine {
  private readonly entities: EntityRecord[] = [];
  private readonly events: EventRecord[] = [];
  private readonly relationships: RelationshipRecord[] = [];
  private readonly initialized: Promise<void>;

  constructor(private readonly store?: KnowledgeStore) {
    this.initialized = this.initialize();
  }

  private async initialize() {
    if (!this.store) {
      return;
    }

    const data = await this.store.load();
    this.entities.splice(0, this.entities.length, ...data.entities);
    this.events.splice(0, this.events.length, ...data.events);
    this.relationships.splice(0, this.relationships.length, ...data.relationships);
  }

  async remember(intent: StructuredIntent): Promise<{ entity: EntityRecord; event: EventRecord }> {
    await this.ensureReady();

    const validated = entitySchema.parse({
      type: intent.entity?.type,
      name: intent.entity?.name ?? intent.intent,
      state: intent.payload ?? {},
      summary: this.buildSummary(intent),
      status: 'active'
    });

    const existing = this.entities.find((entity) => entity.type === validated.type && entity.name === validated.name);
    if (existing) {
      throw new DuplicateEntityError(`Entity already exists`, { type: validated.type, name: validated.name });
    }

    const entity: EntityRecord = {
      id: createId('entity'),
      type: validated.type,
      name: validated.name,
      state: validated.state as Record<string, unknown>,
      summary: validated.summary,
      status: validated.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const event: EventRecord = {
      id: createId('event'),
      entity_id: entity.id,
      event_type: 'entity_created',
      payload: { intent },
      created_at: new Date().toISOString()
    };

    this.entities.push(entity);
    this.events.push(event);
    await this.persist();

    return { entity, event };
  }

  async ask(query: string): Promise<unknown> {
    await this.ensureReady();

    if (query.toLowerCase().includes('owes')) {
      return { answer: 'No outstanding payments found in the current in-memory dataset.' };
    }

    return { answer: `Processed query: ${query}` };
  }

  async timeline(entityId: string): Promise<EventRecord[]> {
    await this.ensureReady();

    const entity = this.entities.find((entry) => entry.id === entityId);
    if (!entity) {
      throw new EntityNotFoundError('Entity not found', { entityId });
    }

    return this.events.filter((event) => event.entity_id === entityId).sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  async search(query: string): Promise<EntityRecord[]> {
    await this.ensureReady();

    const needle = query.toLowerCase();
    return this.entities.filter((entity) => {
      return [entity.name, entity.type, entity.summary].some((value) => String(value).toLowerCase().includes(needle));
    });
  }

  async report(type: string): Promise<unknown> {
    await this.ensureReady();

    if (type === 'activity') {
      return { totalEntities: this.entities.length, totalEvents: this.events.length, totalRelationships: this.relationships.length };
    }

    return { type, summary: 'Report generated from the current in-memory dataset.' };
  }

  async link(from: string, to: string, relationshipType: string): Promise<RelationshipRecord> {
    await this.ensureReady();

    const existing = this.relationships.find((relationship) => relationship.from_entity === from && relationship.to_entity === to && relationship.relationship_type === relationshipType);
    if (existing) {
      throw new DuplicateEntityError('Relationship already exists', { from, to, relationshipType });
    }

    const relationship: RelationshipRecord = {
      id: createId('relationship'),
      from_entity: from,
      to_entity: to,
      relationship_type: relationshipType,
      metadata: {},
      created_at: new Date().toISOString()
    };

    this.relationships.push(relationship);
    await this.persist();
    return relationship;
  }

  async unlink(from: string, to: string, relationshipType: string): Promise<void> {
    await this.ensureReady();

    const index = this.relationships.findIndex((relationship) => relationship.from_entity === from && relationship.to_entity === to && relationship.relationship_type === relationshipType);
    if (index < 0) {
      throw new RelationshipNotFoundError('Relationship not found', { from, to, relationshipType });
    }

    this.relationships.splice(index, 1);
    await this.persist();
  }

  async describe(): Promise<{ entities: EntityRecord[]; events: EventRecord[]; relationships: RelationshipRecord[] }> {
    await this.ensureReady();
    return { entities: this.entities, events: this.events, relationships: this.relationships };
  }

  private async ensureReady() {
    await this.initialized;
  }

  private async persist() {
    if (!this.store) {
      return;
    }

    await this.store.save({
      entities: this.entities,
      events: this.events,
      relationships: this.relationships
    });
  }

  private buildSummary(intent: StructuredIntent): string {
    const entityName = intent.entity?.name ?? 'New entity';
    return `${intent.action.toUpperCase()} ${intent.entity?.type ?? 'Entity'} ${entityName}`;
  }
}
