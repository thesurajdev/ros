import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { KnowledgeEngine } from './services/knowledgeEngine.js';
import { TransactionManager } from './services/transactionManager.js';
import { JsonFileKnowledgeStore } from './repositories/jsonFileKnowledgeStore.js';
import { seedData } from './seed.js';

export async function createServer() {
  const storagePath = process.env.ROS_DATA_PATH ?? './data/knowledge.json';
  const store = new JsonFileKnowledgeStore(storagePath);
  const knowledgeEngine = new KnowledgeEngine(store);
  const transactionManager = new TransactionManager(knowledgeEngine);

  await seedData(knowledgeEngine);

  const server = createHttpServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/describe') {
      const payload = await knowledgeEngine.describe();
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(payload));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/remember') {
      const body = await readJson(req);
      const result = await transactionManager.execute({
        intent: body.intent ?? 'remember',
        entity: body.entity,
        action: 'create',
        payload: body.payload ?? {}
      });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/ask') {
      const body = await readJson(req);
      const result = await knowledgeEngine.ask(body.query ?? '');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/search') {
      const query = url.searchParams.get('q') ?? '';
      const result = await knowledgeEngine.search(query);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });

  return server;
}

async function readJson(req: IncomingMessage): Promise<Record<string, any>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) {
    return {};
  }
  return JSON.parse(raw);
}

export async function startServer(port = Number(process.env.PORT ?? 3000)) {
  const server = await createServer();
  await new Promise<void>((resolve) => server.listen(port, '0.0.0.0', resolve));
  console.log(`Relationship OS listening on port ${port}`);
  return server;
}

if (process.env.CLOUDWAYS_RUN === 'true') {
  startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
