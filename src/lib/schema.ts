import { z } from 'zod';

export const entitySchema = z.object({
  type: z.enum(['Booking', 'Client', 'Company', 'Artist', 'Invoice', 'Employee', 'Task', 'ContactPerson', 'Payment']),
  name: z.string().min(1),
  state: z.record(z.unknown()).default({}),
  summary: z.string().default(''),
  status: z.enum(['active', 'archived', 'completed', 'pending', 'cancelled']).default('active')
});

export const eventSchema = z.object({
  entity_id: z.string().min(1),
  event_type: z.string().min(1),
  payload: z.record(z.unknown()).default({})
});

export const relationshipSchema = z.object({
  from_entity: z.string().min(1),
  to_entity: z.string().min(1),
  relationship_type: z.string().min(1),
  metadata: z.record(z.unknown()).default({})
});

export const intentSchema = z.object({
  intent: z.string().min(1),
  entity: z.object({
    type: z.enum(['Booking', 'Client', 'Company', 'Artist', 'Invoice', 'Employee', 'Task', 'ContactPerson', 'Payment']),
    name: z.string().optional(),
    id: z.string().optional()
  }).optional(),
  action: z.enum(['create', 'update', 'delete', 'query', 'link', 'unlink']),
  payload: z.record(z.unknown()).optional()
});
