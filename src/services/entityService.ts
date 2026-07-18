import type { EntityRecord, StructuredIntent } from '../types/index.js';
import { createId } from '../lib/uuid.js';
import { entitySchema } from '../lib/schema.js';
import { DuplicateEntityError } from '../lib/errors.js';

export class EntityService {
  constructor(private readonly entities: EntityRecord[]) {}

  createFromIntent(intent: StructuredIntent): EntityRecord {
    const validated = entitySchema.parse({
      type: intent.entity?.type,
      name: intent.entity?.name ?? intent.intent,
      state: intent.payload ?? {},
      summary: this.buildSummary(intent),
      status: 'active'
    });

    const existing = this.entities.find((entity) => entity.type === validated.type && entity.name === validated.name);
    if (existing) {
      throw new DuplicateEntityError('Entity already exists', { type: validated.type, name: validated.name });
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

    this.entities.push(entity);
    return entity;
  }

  findById(id: string): EntityRecord | undefined {
    return this.entities.find((entity) => entity.id === id);
  }

  findByName(type: string, name: string): EntityRecord[] {
    return this.entities.filter((entity) => entity.type === type && entity.name === name);
  }

  list(): EntityRecord[] {
    return this.entities;
  }

  private buildSummary(intent: StructuredIntent): string {
    const entityName = intent.entity?.name ?? 'New entity';
    return `${intent.action.toUpperCase()} ${intent.entity?.type ?? 'Entity'} ${entityName}`;
  }
}
