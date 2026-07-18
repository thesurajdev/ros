import { type RelationshipRecord } from '../types/index.js';
import { createId } from '../lib/uuid.js';
import { DuplicateEntityError, EntityNotFoundError, RelationshipNotFoundError } from '../lib/errors.js';
import { relationshipSchema } from '../lib/schema.js';
import type { EntityService } from './entityService.js';

export class RelationshipService {
  constructor(
    private readonly relationships: RelationshipRecord[],
    private readonly entityService: EntityService
  ) {}

  create(from: string, to: string, relationshipType: string): RelationshipRecord {
    const validated = relationshipSchema.parse({
      from_entity: from,
      to_entity: to,
      relationship_type: relationshipType,
      metadata: {}
    });

    const fromEntity = this.entityService.findById(validated.from_entity);
    const toEntity = this.entityService.findById(validated.to_entity);

    if (!fromEntity || !toEntity) {
      throw new EntityNotFoundError('Related entity not found', { from, to, relationshipType });
    }

    const existing = this.relationships.find((relationship) => relationship.from_entity === validated.from_entity && relationship.to_entity === validated.to_entity && relationship.relationship_type === validated.relationship_type);
    if (existing) {
      throw new DuplicateEntityError('Relationship already exists', { from, to, relationshipType });
    }

    const relationship: RelationshipRecord = {
      id: createId('relationship'),
      from_entity: validated.from_entity,
      to_entity: validated.to_entity,
      relationship_type: validated.relationship_type,
      metadata: {},
      created_at: new Date().toISOString()
    };

    this.relationships.push(relationship);
    return relationship;
  }

  remove(from: string, to: string, relationshipType: string): void {
    const index = this.relationships.findIndex((relationship) => relationship.from_entity === from && relationship.to_entity === to && relationship.relationship_type === relationshipType);
    if (index < 0) {
      throw new RelationshipNotFoundError('Relationship not found', { from, to, relationshipType });
    }

    this.relationships.splice(index, 1);
  }

  list(): RelationshipRecord[] {
    return this.relationships;
  }
}
