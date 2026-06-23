import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { WritableStream } from "htmlparser2/WritableStream";
import { TARGET_SELECTOR } from "./config.js";

export function extractHTMLTranslationTargets(filename) {
  const htmlStream = createReadStream(filename, "utf-8");

  const readStream = new Readable({
    objectMode: true,
    read() {}, // htmlparser2 pushes data to us, so read is a no-op
  });

  extractHtmlParser2(htmlStream, (element) => {
    readStream.push({ file: filename, ...element });
  });

  // When the html file stream finishes reading, close our readable stream
  htmlStream.on("end", () => {
    readStream.push(null);
  });

  return readStream;
}

function extractHtmlParser2(inputStream, onTranslationTarget) {
  const stack = [];
  let innerHTML = "";

  inputStream.pipe(
    new WritableStream({
      onopentag(name, attribs) {
        if (Object.hasOwn(attribs, TARGET_SELECTOR)) {
          stack.push({ name, attribs });
        } else if (stack.length) {
          stack.push(name);
        }
      },
      ontext(text) {
        if (!stack.length) return;
        innerHTML += text;
      },
      onclosetag(name) {
        if (!stack.length) return;
        if (stack.length === 1) {
          onTranslationTarget({ ...stack[0], innerHTML });
          innerHTML = "";
        }
        stack.pop();
      },
    }),
  );
}
