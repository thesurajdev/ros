import type { EntityType, EntityStatus, EntityRecord, EventRecord, RelationshipRecord } from './index.js';

export interface WorkerIntentPayload {
  intent?: string;
  entity?: {
    type: EntityType;
    name?: string;
    id?: string;
  };
  action?: 'create' | 'update' | 'delete' | 'query' | 'link' | 'unlink';
  payload?: Record<string, unknown>;
}
