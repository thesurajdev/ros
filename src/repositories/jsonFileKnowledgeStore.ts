import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { EntityRecord, EventRecord, RelationshipRecord } from '../types/index.js';
import type { KnowledgeStore } from './knowledgeStore.js';

export class JsonFileKnowledgeStore implements KnowledgeStore {
  constructor(private readonly filePath: string) {}

  async load() {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      return JSON.parse(raw) as { entities: EntityRecord[]; events: EventRecord[]; relationships: RelationshipRecord[] };
    } catch {
      return { entities: [], events: [], relationships: [] };
    }
  }

  async save(data: { entities: EntityRecord[]; events: EventRecord[]; relationships: RelationshipRecord[] }) {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(data, null, 2));
  }
}
