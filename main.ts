// Leonida Trophy Guide — the program that hands the guide in.
//
// The guide itself is plain static files in app/ (index.html, CSS, ES modules
// and JSON data) plus 3 or 4 screenshots of it running. This program copies
// those files to the output directory and writes dossier.json there with the
// vendored make.fun library, which is the summary the judge reads.
//
// Node 22 standard library only. No network, no clock, no randomness: the
// same repository always produces the same bytes, so the grader's two runs
// agree byte for byte.
//
// Run it the way the grader does, from the repository root:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Without MAKEFUN_OUTPUT_DIR it writes to /output, the grader's directory.)

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The caps the scorer's gate.json sets for this bounty: the dossier text is
// capped at 160 KiB, at most 4 screenshots of 256 KiB each, app/ at most 993
// files and directories totalling 48 MiB, and no app/ path over 1,000 bytes.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

const REQUIRED_APP_FILES = ['index.html', 'data/trophies.json'];

function fail(message) {
  throw new Error('main.ts: ' + message);
}

// Copy one directory tree, but only if the source really is a directory.
// cpSync would happily copy a file; the explicit check makes a broken
// repository fail loudly here instead of producing a half-empty /output.
function copyTree(source, target) {
  if (!existsSync(source) || !statSync(source).isDirectory()) {
    fail('missing directory: ' + source);
  }
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

function checkRequiredFiles(appDir) {
  for (const name of REQUIRED_APP_FILES) {
    const path = join(appDir, name);
    if (!existsSync(path) || !statSync(path).isFile()) {
      fail('missing required file: app/' + name);
    }
  }
  // The trophy file must be valid JSON with 55 trophies, or the guide the
  // judge sees would be short. The check is cheap and catches a broken edit.
  const trophies = JSON.parse(readFileSync(join(appDir, 'data/trophies.json'), 'utf8'));
  const list = Array.isArray(trophies) ? trophies : trophies.trophies;
  if (!Array.isArray(list) || list.length !== 55) {
    fail('app/data/trophies.json must hold exactly 55 trophies');
  }
  for (const trophy of list) {
    if (typeof trophy.name !== 'string' || !trophy.name.trim()) fail('a trophy has no name');
    if (typeof trophy.guide !== 'string' || !trophy.guide.trim()) fail('trophy "' + trophy.name + '" has no guide');
  }
}

function main() {
  const here = fileURLToPath(new URL('.', import.meta.url));
  const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const appDir = join(here, 'app');
  const shotsDir = join(here, 'screenshots');

  checkRequiredFiles(appDir);
  mkdirSync(output, { recursive: true });
  // Clear the previous run's output first, so a re-run into a used directory
  // never leaves stale screenshots or app files behind.
  rmSync(join(output, 'app'), { recursive: true, force: true });
  rmSync(join(output, 'screenshots'), { recursive: true, force: true });
  copyTree(appDir, join(output, 'app'));
  mkdirSync(join(output, 'screenshots'), { recursive: true });
  if (existsSync(shotsDir)) copyTree(shotsDir, join(output, 'screenshots'));

  const dossier = buildDossier(output, DOSSIER_CAPS);
  writeFileSync(join(output, 'dossier.json'), dossier);
  console.log('wrote dossier.json (' + dossier.length + ' bytes) to ' + output);
}

main();
