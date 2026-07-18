import type { StructuredIntent } from '../types/index.js';
import { KnowledgeEngine } from './knowledgeEngine.js';
import { AppError, ValidationFailedError } from '../lib/errors.js';
import { intentSchema } from '../lib/schema.js';

export class TransactionManager {
  constructor(private readonly knowledgeEngine: KnowledgeEngine) {}

  async execute(intent: StructuredIntent): Promise<unknown> {
    const validatedIntent = intentSchema.parse(intent);

    if (!validatedIntent.entity?.type) {
      throw new ValidationFailedError('Entity type is required', { intent: validatedIntent.intent });
    }

    try {
      switch (validatedIntent.action) {
        case 'create':
          return this.knowledgeEngine.remember(validatedIntent);
        case 'query':
          return this.knowledgeEngine.ask(validatedIntent.intent);
        case 'link':
          return this.knowledgeEngine.link(validatedIntent.entity.name ?? '', validatedIntent.payload?.to as string, validatedIntent.payload?.relationshipType as string);
        case 'unlink':
          return this.knowledgeEngine.unlink(validatedIntent.entity.name ?? '', validatedIntent.payload?.to as string, validatedIntent.payload?.relationshipType as string);
        default:
          throw new ValidationFailedError('Action not supported', { action: validatedIntent.action });
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new ValidationFailedError('Transaction failed', { cause: error instanceof Error ? error.message : String(error) });
    }
  }
}
