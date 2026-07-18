import { describe, expect, it } from 'vitest';
import { KnowledgeEngine } from '../src/services/knowledgeEngine.js';

describe('KnowledgeEngine', () => {
  it('creates an entity and records an event timeline', async () => {
    const engine = new KnowledgeEngine();

    const result = await engine.remember({
      intent: 'Create booking',
      entity: { type: 'Booking', name: 'ABC School Event' },
      action: 'create',
      payload: { venue: 'Noida', amount: 15000 }
    });

    expect(result.entity.name).toBe('ABC School Event');

    const timeline = await engine.timeline(result.entity.id);
    expect(timeline[0].event_type).toBe('entity_created');
  });

  it('returns search results for matching entities', async () => {
    const engine = new KnowledgeEngine();

    await engine.remember({
      intent: 'Create client',
      entity: { type: 'Client', name: 'Rahul' },
      action: 'create',
      payload: { city: 'Delhi' }
    });

    const results = await engine.search('Rahul');
    expect(results[0].name).toBe('Rahul');
  });
});
