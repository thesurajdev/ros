import type { EntityRecord, EventRecord, RelationshipRecord } from '../types/index.js';

export class ReportService {
  constructor(
    private readonly entities: EntityRecord[],
    private readonly events: EventRecord[],
    private readonly relationships: RelationshipRecord[]
  ) {}

  activity(): { totalEntities: number; totalEvents: number; totalRelationships: number } {
    return {
      totalEntities: this.entities.length,
      totalEvents: this.events.length,
      totalRelationships: this.relationships.length
    };
  }
}
