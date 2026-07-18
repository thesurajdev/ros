import { describe, expect, it } from 'vitest';
import { AmbiguousEntityError, DuplicateEntityError, EntityNotFoundError, ValidationFailedError } from '../src/lib/errors.js';
import { KnowledgeEngine } from '../src/services/knowledgeEngine.js';

describe('stabilization behaviors', () => {
  it('rebuilds projections from persisted events', async () => {
    const engine = new KnowledgeEngine();
    const created = await engine.remember({
      intent: 'Create client',
      entity: { type: 'Client', name: 'Mina' },
      action: 'create',
      payload: { city: 'Mumbai' }
    });

    (engine as any).entities.splice(0, (engine as any).entities.length);
    (engine as any).relationships.splice(0, (engine as any).relationships.length);

    await engine.rebuildProjectionsFromEvents();

    const rebuilt = await engine.search('Mina');
    expect(rebuilt[0]?.id).toBe(created.entity.id);
    expect(rebuilt[0]?.name).toBe('Mina');
  });

  it('rolls back state when a relationship write fails', async () => {
    const engine = new KnowledgeEngine();
    const client = await engine.remember({
      intent: 'Create client',
      entity: { type: 'Client', name: 'Ravi' },
      action: 'create',
      payload: {}
    });

    await expect(engine.link(client.entity.id, 'missing-entity', 'booked_for')).rejects.toThrow(EntityNotFoundError);

    const summary = await engine.describe();
    expect(summary.relationships).toHaveLength(0);
  });

  it('prevents duplicate entities', async () => {
    const engine = new KnowledgeEngine();

    await engine.remember({
      intent: 'Create client',
      entity: { type: 'Client', name: 'Nina' },
      action: 'create',
      payload: {}
    });

    await expect(engine.remember({
      intent: 'Create client',
      entity: { type: 'Client', name: 'Nina' },
      action: 'create',
      payload: {}
    })).rejects.toThrow(DuplicateEntityError);
  });

  it('raises an ambiguity error when resolving a duplicated entity reference by name', async () => {
    const engine = new KnowledgeEngine();
    await engine.remember({
      intent: 'Create client 1',
      entity: { type: 'Client', name: 'Same Name' },
      action: 'create',
      payload: {}
    });
    await engine.remember({
      intent: 'Create company',
      entity: { type: 'Company', name: 'Same Name' },
      action: 'create',
      payload: {}
    });

    await expect(engine.link('Same Name', 'missing-entity', 'booked_for')).rejects.toThrow(AmbiguousEntityError);
  });

  it('validates relationships before creating them', async () => {
    const engine = new KnowledgeEngine();
    const client = await engine.remember({
      intent: 'Create client',
      entity: { type: 'Client', name: 'Asha' },
      action: 'create',
      payload: {}
    });

    await expect(engine.link(client.entity.id, 'missing-entity', 'booked_for')).rejects.toThrow(EntityNotFoundError);
  });

  it('serializes concurrent writes to avoid state corruption', async () => {
    const engine = new KnowledgeEngine();

    await expect(Promise.all([
      engine.remember({ intent: 'Create client', entity: { type: 'Client', name: 'Tara' }, action: 'create', payload: {} }),
      engine.remember({ intent: 'Create client', entity: { type: 'Client', name: 'Tara' }, action: 'create', payload: {} })
    ])).rejects.toThrow(DuplicateEntityError);
  });
});
