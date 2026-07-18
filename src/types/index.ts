export type EntityType =
  | 'Booking'
  | 'Client'
  | 'Company'
  | 'Artist'
  | 'Invoice'
  | 'Employee'
  | 'Task'
  | 'ContactPerson'
  | 'Payment';

export type EntityStatus = 'active' | 'archived' | 'completed' | 'pending' | 'cancelled';

export interface EntityRecord {
  id: string;
  type: EntityType;
  name: string;
  state: Record<string, unknown>;
  summary: string;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface EventRecord {
  id: string;
  entity_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface RelationshipRecord {
  id: string;
  from_entity: string;
  to_entity: string;
  relationship_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SchemaRecord {
  id: string;
  entity_type: EntityType;
  definition: Record<string, unknown>;
  version: number;
}

export interface AttachmentRecord {
  id: string;
  entity_id: string;
  file_name: string;
  path: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ValidationErrorShape {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type IntentAction = 'create' | 'update' | 'delete' | 'query' | 'link' | 'unlink';

export interface StructuredIntent {
  intent: string;
  entity?: {
    type: EntityType;
    name?: string;
    id?: string;
  };
  action: IntentAction;
  payload?: Record<string, unknown>;
}
