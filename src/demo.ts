import { KnowledgeEngine } from './services/knowledgeEngine.js';

async function main() {
  const engine = new KnowledgeEngine();

  const client = await engine.remember({
    intent: 'Create client',
    entity: { type: 'Client', name: 'Asha' },
    action: 'create',
    payload: { city: 'Bengaluru' }
  });

  const booking = await engine.remember({
    intent: 'Create booking',
    entity: { type: 'Booking', name: 'Wedding Reception' },
    action: 'create',
    payload: { venue: 'Mumbai', amount: 25000 }
  });

  await engine.remember({
    intent: 'Record advance payment',
    entity: { type: 'Payment', name: 'Advance Payment' },
    action: 'create',
    payload: { amount: 10000, bookingId: booking.entity.id }
  });

  await engine.link(client.entity.id, booking.entity.id, 'booked_for');

  const timeline = await engine.timeline(booking.entity.id);
  const answer = await engine.ask('Show outstanding payments for Wedding Reception');

  console.log(JSON.stringify({ client, booking, timeline, answer }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
