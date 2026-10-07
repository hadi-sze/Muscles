import { defineConfig } from 'vite';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ command, mode }) => {
  if (command !== 'serve' || mode !== 'https') return {};

  const key = fileURLToPath(new URL('./.certs/localhost-key.pem', import.meta.url));
  const cert = fileURLToPath(new URL('./.certs/localhost.pem', import.meta.url));
  if (!existsSync(key) || !existsSync(cert)) {
    throw new Error('Run npm run setup:https to generate the local HTTPS certificate.');
  }
  const https = { key: readFileSync(key), cert: readFileSync(cert), minVersion: 'TLSv1.2' };
  return { server: { https }, preview: { https } };
});
