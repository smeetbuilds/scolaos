import { buildApp } from './app.js';
import { loadServerConfig } from './config.js';

const config = loadServerConfig();
const app = await buildApp({ logger: true });
let closing = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (closing) {
    return;
  }

  closing = true;
  app.log.info({ signal }, 'Shutting down ScolaOS server');
  await app.close();
}

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error({ err: error }, 'Failed to start ScolaOS server');
  process.exitCode = 1;
  await app.close();
}
