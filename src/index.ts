import { runServer } from './mcp/server.js';

async function main() {
  await runServer();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
