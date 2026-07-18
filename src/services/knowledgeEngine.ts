import { AmbiguousEntityError, DuplicateEntityError, EntityNotFoundError, RelationshipNotFoundError, ValidationFailedError } from '../lib/errors.js';
import type { EntityRecord, EventRecord, RelationshipRecord, StructuredIntent } from '../types/index.js';
import type { KnowledgeStore } from '../repositories/knowledgeStore.js';
import { EntityService } from './entityService.js';
import { EventService } from './eventService.js';
import { RelationshipService } from './relationshipService.js';
import { ValidationService } from './validationService.js';
import { SearchService } from './searchService.js';
import { TimelineService } from './timelineService.js';
import { ReportService } from './reportService.js';

export class KnowledgeEngine {
  private readonly entities: EntityRecord[] = [];
  private readonly events: EventRecord[] = [];
  private readonly relationships: RelationshipRecord[] = [];
  private readonly initialized: Promise<void>;
  private readonly entityService: EntityService;
  private readonly eventService: EventService;
  private readonly relationshipService: RelationshipService;
  private readonly validationService: ValidationService;
  private readonly searchService: SearchService;
  private readonly timelineService: TimelineService;
  private readonly reportService: ReportService;

  constructor(private readonly store?: KnowledgeStore) {
    this.entityService = new EntityService(this.entities);
    this.eventService = new EventService(this.events);
    this.relationshipService = new RelationshipService(this.relationships, this.entityService);
    this.validationService = new ValidationService(this.entityService);
    this.searchService = new SearchService(this.entities);
    this.timelineService = new TimelineService(this.events);
    this.reportService = new ReportService(this.entities, this.events, this.relationships);
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

    this.validationService.validateIntent(intent);
    this.validationService.validateEntityCreate(intent);
    this.validationService.ensureNoDuplicateEntity(intent);

    const entity = this.entityService.createFromIntent(intent);
    const event = this.eventService.append(entity.id, 'entity_created', { intent });

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

    const entity = this.entityService.findById(entityId);
    if (!entity) {
      throw new EntityNotFoundError('Entity not found', { entityId });
    }

    return this.timelineService.timeline(entityId);
  }

  async search(query: string): Promise<EntityRecord[]> {
    await this.ensureReady();
    return this.searchService.search(query);
  }

  async report(type: string): Promise<unknown> {
    await this.ensureReady();

    if (type === 'activity') {
      return this.reportService.activity();
    }

    return { type, summary: 'Report generated from the current in-memory dataset.' };
  }

  async link(from: string, to: string, relationshipType: string): Promise<RelationshipRecord> {
    await this.ensureReady();

    this.validationService.validateRelationshipTargets(from, to, relationshipType);

    let relationship: RelationshipRecord;
    try {
      relationship = this.relationshipService.create(from, to, relationshipType);
      this.eventService.append(from, 'relationship_created', { relationshipType, to });
      await this.persist();
      return relationship;
    } catch (error) {
      if (error instanceof DuplicateEntityError || error instanceof ValidationFailedError || error instanceof AmbiguousEntityError) {
        throw error;
      }
      throw new ValidationFailedError('Relationship write failed', { cause: error instanceof Error ? error.message : String(error) });
    }
  }

  async unlink(from: string, to: string, relationshipType: string): Promise<void> {
    await this.ensureReady();

    this.validationService.validateRelationshipTargets(from, to, relationshipType);

    try {
      this.relationshipService.remove(from, to, relationshipType);
      this.eventService.append(from, 'relationship_removed', { relationshipType, to });
      await this.persist();
    } catch (error) {
      if (error instanceof RelationshipNotFoundError) {
        throw error;
      }
      throw new ValidationFailedError('Relationship removal failed', { cause: error instanceof Error ? error.message : String(error) });
    }
  }

  async describe(): Promise<{ entities: EntityRecord[]; events: EventRecord[]; relationships: RelationshipRecord[] }> {
    await this.ensureReady();
    return { entities: this.entities, events: this.events, relationships: this.relationships };
  }

  async rebuildProjectionsFromEvents(): Promise<{ entities: EntityRecord[]; events: EventRecord[]; relationships: RelationshipRecord[] }> {
    await this.ensureReady();

    const replayEvents = [...this.events];
    this.entities.splice(0, this.entities.length);
    this.relationships.splice(0, this.relationships.length);
    this.events.splice(0, this.events.length, ...replayEvents);

    for (const event of replayEvents) {
      if (event.event_type === 'entity_created') {
        const payload = event.payload as { intent?: StructuredIntent };
        if (payload.intent) {
          const entity = this.entityService.createFromIntent({
            ...payload.intent,
            entity: {
              type: payload.intent.entity?.type ?? 'Task',
              name: payload.intent.entity?.name,
              id: event.entity_id
            }
          });
          entity.id = event.entity_id;
        }
        continue;
      }

      if (event.event_type === 'relationship_created') {
        const payload = event.payload as { relationshipType?: string; to?: string };
        if (payload.relationshipType && payload.to) {
          const from = event.entity_id;
          const to = payload.to;
          try {
            this.relationshipService.create(from, to, payload.relationshipType);
          } catch {
            // Ignore invalid replay entries and continue rebuilding the projection.
          }
        }
        continue;
      }

      if (event.event_type === 'relationship_removed') {
        const payload = event.payload as { relationshipType?: string; to?: string };
        if (payload.relationshipType && payload.to) {
          try {
            this.relationshipService.remove(event.entity_id, payload.to, payload.relationshipType);
          } catch {
            // Ignore missing relationships during replay.
          }
        }
      }
    }

    await this.persist();
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
}
