import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Writable, Transform } from 'node:stream';
import { extractHTMLTranslationTargets } from './extract.html.js';
import { WARNING_MISSING_KEY, ERR_FAILED_TRANSLATION, WARNING_MALFORMED_TRANSLATION_TARGET, WARNING_MISSING_TRANSLATION, normalizeText, hashText } from './common.js';
import { VERBOSE, SAVE_KEYS, SAVE_TRANSLATIONS, DATA_SOURCE_JSON, SOURCE_LOCALE, TARGET_LOCALE, TRY_TRANSLATE } from './config.js';
import { initializeJSONDataSource } from './dataSource.json.js';
import { googleTranslate } from './translate.google.js';

if (!process.argv[2]) throw new Error(`[ERROR] Missing argument: source directory`);

const SRC_DIR = path.resolve(process.argv[2]);

const dataSource = initializeJSONDataSource(DATA_SOURCE_JSON);
const pendingTranslations = new Set();

async function translate() {
  let extractionStream;

  for (const filename of readDir(SRC_DIR)) {
    switch (path.extname(filename)) {
    case '.html':
      extractionStream = extractHTMLTranslationTargets(filename);
      break;
    default:
      continue;
    }
    await pipeline(extractionStream, processorStream, { end: false });
  }

  processorStream.end();
};

async function processTranslationTarget(translationTarget) {
  translationTarget.text = normalizeText(translationTarget.innerHTML);

  if (!translationTarget.text) {
    console.error(WARNING_MALFORMED_TRANSLATION_TARGET(translationTarget));
    return;
  }

  translationTarget.key = hashText(translationTarget.text);

  if (!dataSource.hasKey(translationTarget.key)) {
    console.error(WARNING_MISSING_KEY(translationTarget));

    if (SAVE_KEYS) {
      dataSource.update(translationTarget.key, SOURCE_LOCALE, translationTarget.text);
    }
  }

  let translation = dataSource.lookup(translationTarget.key, TARGET_LOCALE);

  if (!translation) {
    if (!TRY_TRANSLATE || pendingTranslations.has(translationTarget.key)) return;

    console.error(WARNING_MISSING_TRANSLATION(translationTarget));

    pendingTranslations.add(translationTarget.key);

    try {
      translation = await googleTranslate(translationTarget.text, TARGET_LOCALE, 'en');

      pendingTranslations.delete(translationTarget.key);

      if (SAVE_TRANSLATIONS) {
        dataSource.update(translationTarget.key, TARGET_LOCALE, translation);
      }

    } catch (err) {
      console.error(err);
      console.error(ERR_FAILED_TRANSLATION(translationTarget));
      return;
    }
  }

  translationTarget[TARGET_LOCALE] = translation;
}

const processorStream = new Transform({
  objectMode: true,
  async transform(translationTarget, encoding, callback) {
    try {
      await processTranslationTarget(translationTarget);
      // Push the processed target down the pipeline
      this.push(translationTarget);
      callback();
    } catch (err) {
      callback(err);
    }
  },
  flush(callback) { // In a Transform stream, 'final' is called 'flush'
    try {
      if (SAVE_KEYS || SAVE_TRANSLATIONS) {
        dataSource.save();
      }
      callback();
    } catch (err) {
      callback(err);
    }
  }
});

const verboseStream = new Writable({
  objectMode: true,
  write(translationTarget, encoding, callback) {
    if (VERBOSE) {
      console.log(translationTarget);
    }
    callback();
  }
});

// Permanently pipe our processor into our verbose logger
processorStream.pipe(verboseStream);

function* readDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* readDir(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

translate();
