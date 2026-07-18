import type { EntityRecord } from '../types/index.js';

export class SearchService {
  constructor(private readonly entities: EntityRecord[]) {}

  search(query: string): EntityRecord[] {
    const needle = query.toLowerCase();
    return this.entities.filter((entity) => {
      return [entity.name, entity.type, entity.summary].some((value) => String(value).toLowerCase().includes(needle));
    });
  }
}
