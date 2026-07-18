import { describe, expect, it } from 'vitest';
import { KnowledgeEngine } from '../src/services/knowledgeEngine.js';

describe('integration flow', () => {
  it('supports remember -> event -> projection -> ask flow', async () => {
    const engine = new KnowledgeEngine();

    const rememberResult = await engine.remember({
      intent: 'Create client',
      entity: { type: 'Client', name: 'Mina' },
      action: 'create',
      payload: { city: 'Mumbai' }
    });

    const timeline = await engine.timeline(rememberResult.entity.id);
    const searchResults = await engine.search('Mina');
    const answer = await engine.ask('Tell me about Mina');

    expect(rememberResult.entity.name).toBe('Mina');
    expect(timeline[0]?.event_type).toBe('entity_created');
    expect(searchResults[0]?.name).toBe('Mina');
    expect(answer).toEqual({ answer: 'Processed query: Tell me about Mina' });
  });
});
