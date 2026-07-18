import { KnowledgeEngine } from './services/knowledgeEngine.js';
import { JsonFileKnowledgeStore } from './repositories/jsonFileKnowledgeStore.js';

async function main() {
  const filePath = process.env.ROS_DATA_PATH ?? './data/knowledge.json';
  const store = new JsonFileKnowledgeStore(filePath);
  const engine = new KnowledgeEngine(store);
  const result = await engine.rebuildProjectionsFromEvents();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
