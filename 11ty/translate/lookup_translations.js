/*
  This script implements the translations lookup stage of the translation
  sequence specified in ARCHITECTURE.md.

  It is designed to be used either:

  - Through a SHELL and part of the translation sequence
  - As a module through the exported function
*/
import fs from "node:fs";
import readline from 'node:readline';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

/*
  If the condition fails it means the script is being executed by a shell.
*/
const isImported = process.argv[1] !== fileURLToPath(import.meta.url);

if (!isImported) {
  lookupTranslations(process.stdin, process.stdout);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function lookupTranslations(inputStream, outputStream, locale, dataSourcePath) {
  const data = JSON.parse(fs.readFileSync(dataSourcePath, 'utf-8'));

  const rl = readline.createInterface({ 
    input: inputStream, 
    crlfDelay: Infinity 
  });

  rl.on('line', (line) => {
    const hash = line.trim();
    if (!hash) return;

    const translations = data[hash];
    if (translations && translations[locale]) {
      // URL encode the output to guarantee it stays safely on a single line in the pipe
      outputStream.write(encodeURIComponent(translations[locale]) + "\n");
    }
  });
}
