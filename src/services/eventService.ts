import type { EventRecord } from '../types/index.js';
import { createId } from '../lib/uuid.js';

export class EventService {
  constructor(private readonly events: EventRecord[]) {}

  append(entityId: string, eventType: string, payload: Record<string, unknown> = {}): EventRecord {
    const event: EventRecord = {
      id: createId('event'),
      entity_id: entityId,
      event_type: eventType,
      payload,
      created_at: new Date().toISOString()
    };

    this.events.push(event);
    return event;
  }

  listForEntity(entityId: string): EventRecord[] {
    return this.events.filter((event) => event.entity_id === entityId).sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  list(): EventRecord[] {
    return this.events;
  }
}
