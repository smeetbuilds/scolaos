import { buildApp } from './app.js';
import { loadServerConfig } from './config.js';
import { safeErrorForLog } from './installation/redaction.js';
import { InstallationService } from './installation/service.js';

const config = loadServerConfig();
const installationService = new InstallationService(config.dataDirectory);
const app = await buildApp({
  logger: true,
  installationService,
  ...(config.trustedProxyCidrs.length === 0
    ? {}
    : { trustProxy: [...config.trustedProxyCidrs] }),
  ...(config.installerBootstrapToken === undefined
    ? {}
    : { installerBootstrapToken: config.installerBootstrapToken }),
});
let closing = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (closing) {
    return;
  }

  closing = true;
  app.log.info({ signal }, 'Shutting down server');
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
  app.log.error({ error: safeErrorForLog(error) }, 'Failed to start server');
  process.exitCode = 1;
  await app.close();
}
