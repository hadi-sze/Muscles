import { mkdirSync, existsSync, chmodSync, mkdtempSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = fileURLToPath(new URL('../.certs/', import.meta.url));
const cert = path.join(dir, 'localhost.pem');
const key = path.join(dir, 'localhost-key.pem');
mkdirSync(dir, { recursive: true, mode: 0o700 });

const existing = existsSync(key) && existsSync(cert);
if (existing && spawnSync('openssl', ['x509', '-checkend', '86400', '-noout', '-in', cert], { stdio: 'ignore' }).status === 0) {
  chmodSync(key, 0o600);
  console.log('Using the existing local HTTPS certificate.');
  process.exit(0);
}

const temporary = mkdtempSync(path.join(dir, 'setup-'));
try {
  const config = path.join(temporary, 'openssl.cnf');
  writeFileSync(config, `[req]
prompt = no
distinguished_name = subject
x509_extensions = extensions
[subject]
CN = localhost
O = MuscleWiki Local Development
[extensions]
subjectAltName = DNS:localhost,IP:127.0.0.1,IP:::1
basicConstraints = critical,CA:FALSE
keyUsage = critical,digitalSignature,keyEncipherment
extendedKeyUsage = serverAuth
`, { mode: 0o600 });
  const result = spawnSync('openssl', ['req', '-x509', '-nodes', '-newkey', 'rsa:2048', '-sha256', '-days', '90', '-config', config,
    '-keyout', path.join(temporary, 'key.pem'), '-out', path.join(temporary, 'cert.pem')], { encoding: 'utf8' });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || 'Certificate generation failed.');
  chmodSync(path.join(temporary, 'key.pem'), 0o600);
  renameSync(path.join(temporary, 'key.pem'), key);
  renameSync(path.join(temporary, 'cert.pem'), cert);
  console.log('Created a localhost certificate valid for 90 days in .certs/.');
  console.log('Browser trust is a separate step. Only import localhost.pem; keep localhost-key.pem private.');
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
