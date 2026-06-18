/*
  This script implements the text extraction stage of the translation sequence
  specified in ARCHITECTURE.md.

  It is designed to be used either:

  - As a standalone script including as part of a pipe
  - As a module through the exported function
*/
import { createReadStream } from 'fs';
import { WritableStream } from 'htmlparser2/WritableStream';
import { fileURLToPath } from 'url';

const TRANSLATABLE_ATTRIBUTE = 'translate';

/*
  If this script is being executed in a command line environment the 1st
  argument would reference its path.
 */
const isImported = process.argv[1] !== fileURLToPath(import.meta.url);

if (!isImported) {
  const input = process.argv[2] ? createReadStream(process.argv[2]) : process.stdin;
  extractText(input, process.stdout);
}

export function extractText(inputStream, outputStream) {
  const stack = [];
  inputStream.pipe(
    new WritableStream({
      onopentag(name, attribs) {
        if (Object.hasOwn(attribs, TRANSLATABLE_ATTRIBUTE)) {
          stack.push(name);
        } else if (stack.length) {
          stack.push(name);
        }
      },
      ontext(text) {
        if (!stack.length) return;
        outputStream.write(text);
      },
      onclosetag(name) {
        if (!stack.length) return;
        stack.pop();
        if (stack.length) return;
        outputStream.write('\n');
      }
    })
  );
}
