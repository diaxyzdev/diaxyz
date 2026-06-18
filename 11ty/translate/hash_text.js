/*
  This script implements the 3rd stage of the translation sequence specified in
  ARCHITECTURE.md.

  It is designed to be used either:

  - As a standalone script including as part of a pipe
  - As a module through the exported function
*/

import crypto from 'crypto';
import readline from 'readline';
import { fileURLToPath } from 'url';

/*
  If this script is being executed in a command line environment the 1st
  argument would reference its path.
*/
const isImported = process.argv[1] !== fileURLToPath(import.meta.url);

if (!isImported) {
  hashText(process.stdin, process.stdout);
}

export function hashText(inputStream, outputStream) {
  const rl = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const normalized = trimmed.replace(/\s+/g, ' ');
    const hash = crypto.createHash('sha256').update(normalized).digest('base64');
    outputStream.write(`${hash}\n`);
  });
}


