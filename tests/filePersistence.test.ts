import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { JsonFileKnowledgeStore } from '../src/repositories/jsonFileKnowledgeStore.js';
import { KnowledgeEngine } from '../src/services/knowledgeEngine.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('file persistence', () => {
  it('persists entities and reloads them from disk', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'ros-'));
    tempDirs.push(dir);
    const filePath = path.join(dir, 'knowledge.json');
    const store = new JsonFileKnowledgeStore(filePath);
    const engine = new KnowledgeEngine(store);

    await engine.remember({
      intent: 'Create persisted client',
      entity: { type: 'Client', name: 'Mina' },
      action: 'create',
      payload: { city: 'Mumbai' }
    });

    const reloadedEngine = new KnowledgeEngine(store);
    const results = await reloadedEngine.search('Mina');

    expect(results[0]?.name).toBe('Mina');
  });
});
