import { KnowledgeEngine } from './services/knowledgeEngine.js';

export async function seedData(engine?: KnowledgeEngine) {
  const target = engine ?? new KnowledgeEngine();

  try {
    const existing = await target.search('ABC School');
    if (existing.length > 0) {
      return target.describe();
    }
  } catch {
    // fall through and seed the initial records
  }

  try {
      await target.remember({
      intent: 'Create initial company record',
      entity: { type: 'Company', name: 'ABC School' },
      action: 'create',
      payload: { industry: 'Education' }
    });

    await target.remember({
      intent: 'Create initial client record',
      entity: { type: 'Client', name: 'Rahul' },
      action: 'create',
      payload: { contact: 'rahul@example.com' }
    });

    await target.remember({
      intent: 'Create initial booking record',
      entity: { type: 'Booking', name: 'Caricature Artist Booking' },
      action: 'create',
      payload: { venue: 'Delhi', amount: 15000 }
    });
  } catch {
    // ignore duplicate seeding on subsequent startups
  }

  return target.describe();
}
