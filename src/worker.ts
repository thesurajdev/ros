import type { D1Database } from '@cloudflare/workers-types';
import { D1KnowledgeStore } from './repositories/d1KnowledgeStore.js';
import { KnowledgeEngine } from './services/knowledgeEngine.js';
import { TransactionManager } from './services/transactionManager.js';

export interface Env {
  ROS_KNOWLEDGE_DB: D1Database;
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function handleRequest(request: Request, env: Env) {
  const store = new D1KnowledgeStore(env.ROS_KNOWLEDGE_DB);
  const engine = new KnowledgeEngine(store);
  const transactionManager = new TransactionManager(engine);
  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname === '/health') {
    return new Response(JSON.stringify({ status: 'ok' }), { headers: { 'content-type': 'application/json' } });
  }

  if (request.method === 'GET' && url.pathname === '/api/describe') {
    const payload = await engine.describe();
    return new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json' } });
  }

  if (request.method === 'POST' && url.pathname === '/api/remember') {
    const body = (await readJson(request)) as { intent?: string; entity?: unknown; payload?: Record<string, unknown> };
    const result = await transactionManager.execute({
      intent: body.intent ?? 'remember',
      entity: body.entity as any,
      action: 'create',
      payload: body.payload ?? {}
    });
    return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } });
  }

  if (request.method === 'POST' && url.pathname === '/api/ask') {
    const body = (await readJson(request)) as { query?: string };
    const result = await engine.ask(body.query ?? '');
    return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } });
  }

  if (request.method === 'GET' && url.pathname === '/api/search') {
    const query = url.searchParams.get('q') ?? '';
    const result = await engine.search(query);
    return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } });
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: { 'content-type': 'application/json' } });
}

export default {
  async fetch(request: Request, env: Env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
};
