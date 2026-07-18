import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { KnowledgeEngine } from '../services/knowledgeEngine.js';
import { TransactionManager } from '../services/transactionManager.js';
import { AppError } from '../lib/errors.js';

export function createMcpServer() {
  const knowledgeEngine = new KnowledgeEngine();
  const transactionManager = new TransactionManager(knowledgeEngine);

  const server = new Server(
    {
      name: 'relationship-os',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      { name: 'remember', description: 'Store new information as an entity and event', inputSchema: { type: 'object', properties: { intent: { type: 'string' }, entity: { type: 'object' }, action: { type: 'string' }, payload: { type: 'object' } } } },
      { name: 'ask', description: 'Answer questions or produce summaries', inputSchema: { type: 'object', properties: { query: { type: 'string' } } } },
      { name: 'search', description: 'Search entities', inputSchema: { type: 'object', properties: { query: { type: 'string' } } } },
      { name: 'timeline', description: 'Retrieve entity history', inputSchema: { type: 'object', properties: { entityId: { type: 'string' } } } },
      { name: 'report', description: 'Generate reports', inputSchema: { type: 'object', properties: { type: { type: 'string' } } } },
      { name: 'link', description: 'Create a relationship between entities', inputSchema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, relationshipType: { type: 'string' } } } },
      { name: 'unlink', description: 'Remove a relationship', inputSchema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, relationshipType: { type: 'string' } } } },
      { name: 'describe', description: 'Describe the in-memory database structure', inputSchema: { type: 'object', properties: {} } }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'remember': {
          const result = await transactionManager.execute({ intent: 'remember', entity: args?.entity as any, action: 'create', payload: args?.payload as Record<string, unknown> });
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        }
        case 'ask': {
          const result = await knowledgeEngine.ask(args?.query as string);
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        }
        case 'search': {
          const result = await knowledgeEngine.search(args?.query as string);
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        }
        case 'timeline': {
          const result = await knowledgeEngine.timeline(args?.entityId as string);
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        }
        case 'report': {
          const result = await knowledgeEngine.report(args?.type as string);
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        }
        case 'link': {
          const result = await knowledgeEngine.link(args?.from as string, args?.to as string, args?.relationshipType as string);
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        }
        case 'unlink': {
          await knowledgeEngine.unlink(args?.from as string, args?.to as string, args?.relationshipType as string);
          return { content: [{ type: 'text', text: 'Relationship removed' }] };
        }
        case 'describe': {
          const result = await knowledgeEngine.describe();
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        }
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const message = error instanceof AppError ? error.message : error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text', text: JSON.stringify({ ok: false, error: { code: error instanceof AppError ? error.code : 'UnknownError', message } }) }]
      };
    }
  });

  return server;
}

export async function runServer() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
