// Copies the single-file web app (../index.html) into www/ for Capacitor.
// Keeps the root index.html as the single source of truth for the web build.
import { mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');        // repo root
const nativeDir = resolve(here, '..');         // native/

mkdirSync(resolve(nativeDir, 'www'), { recursive: true });
copyFileSync(resolve(root, 'index.html'), resolve(nativeDir, 'www', 'index.html'));
console.log('Copied index.html -> native/www/index.html');
