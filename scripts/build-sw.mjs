import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root = path.resolve('dist');
async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
    return nested.flat();
}
const files = (await walk(root)).filter(f => !f.endsWith('/sw.js')).sort();
const hash = createHash('sha256');
for (const file of files) hash.update(await readFile(file));
const assets = files.filter(f => path.basename(f) !== 'health.json').map(f => '/' + path.relative(root, f).split(path.sep).join('/'));
const template = await readFile('scripts/sw-template.js', 'utf8');
const worker = template.replace('__CACHE_VERSION__', hash.digest('hex').slice(0, 16)).replace('__PRECACHE_ASSETS__', JSON.stringify(assets));
await writeFile(path.join(root, 'sw.js'), worker);
console.log(`Offline cache generated for ${assets.length} local assets.`);
