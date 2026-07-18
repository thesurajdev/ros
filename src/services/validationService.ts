import { z } from 'zod';
import { AmbiguousEntityError, DuplicateEntityError, EntityNotFoundError, ValidationFailedError } from '../lib/errors.js';
import { entitySchema, eventSchema, intentSchema, relationshipSchema } from '../lib/schema.js';
import type { EntityRecord, EventRecord, RelationshipRecord, StructuredIntent } from '../types/index.js';
import type { EntityService } from './entityService.js';

export class ValidationService {
  constructor(private readonly entityService: EntityService) {}

  validateIntent(intent: StructuredIntent): StructuredIntent {
    return intentSchema.parse(intent);
  }

  validateEntityCreate(intent: StructuredIntent): void {
    entitySchema.parse({
      type: intent.entity?.type,
      name: intent.entity?.name ?? intent.intent,
      state: intent.payload ?? {},
      summary: '',
      status: 'active'
    });
  }

  validateEvent(event: Partial<EventRecord>): void {
    eventSchema.parse(event);
  }

  validateRelationship(from: string, to: string, relationshipType: string): void {
    relationshipSchema.parse({ from_entity: from, to_entity: to, relationship_type: relationshipType, metadata: {} });
  }

  validateRelationshipTargets(from: string, to: string, relationshipType: string): void {
    this.validateRelationship(from, to, relationshipType);

    const fromEntity = this.resolveEntityReference(from);
    const toEntity = this.resolveEntityReference(to);

    if (!fromEntity || !toEntity) {
      throw new EntityNotFoundError('Related entity not found', { from, to, relationshipType });
    }
  }

  resolveEntityReference(reference: string): EntityRecord | undefined {
    if (!reference) {
      return undefined;
    }

    const directMatch = this.entityService.findById(reference);
    if (directMatch) {
      return directMatch;
    }

    const byName = this.entityService.list().filter((entity) => entity.name === reference);
    if (byName.length === 1) {
      return byName[0];
    }

    if (byName.length > 1) {
      throw new AmbiguousEntityError('Multiple entities match the provided reference', { reference });
    }

    return undefined;
  }

  ensureNoDuplicateEntity(intent: StructuredIntent): void {
    if (!intent.entity?.type) {
      throw new ValidationFailedError('Entity type is required', { intent: intent.intent });
    }

    const matches = this.entityService.findByName(intent.entity.type, intent.entity.name ?? intent.intent);
    if (matches.length > 0) {
      throw new DuplicateEntityError('Entity already exists', { type: intent.entity.type, name: intent.entity.name ?? intent.intent });
    }
  }
}
