import type { EventRecord } from '../types/index.js';

export class TimelineService {
  constructor(private readonly events: EventRecord[]) {}

  timeline(entityId: string): EventRecord[] {
    return this.events.filter((event) => event.entity_id === entityId).sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
}
