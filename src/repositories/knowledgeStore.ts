import type { EntityRecord, EventRecord, RelationshipRecord } from '../types/index.js';

export interface KnowledgeStore {
  load(): Promise<{ entities: EntityRecord[]; events: EventRecord[]; relationships: RelationshipRecord[] }>;
  save(data: { entities: EntityRecord[]; events: EventRecord[]; relationships: RelationshipRecord[] }): Promise<void>;
}
