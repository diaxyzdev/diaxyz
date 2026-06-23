import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import crypto from 'node:crypto';

const SRC_DIR = '/home/pnoulis/src/diaxyz/forstorebg.com/src';
const OUT_JSON_PATH = '/home/pnoulis/src/diaxyz/forstorebg.com/translate.json';

// Helper to normalize and hash text
function normalizeText(text) {
  return text.trim().replace(/\s+/g, ' ');
}

function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('base64');
}

const LAYOUT_TAGS = new Set([
  'div', 'section', 'main', 'form', 'header', 'footer', 'nav', 'article',
  'aside', 'html', 'body', 'table', 'tbody', 'thead', 'tfoot', 'tr', 'ul',
  'ol', 'dl', 'address', 'blockquote', 'details', 'summary', 'figure',
  'figcaption'
]);

const matchedPairs = new Map(); // enText -> bgText

function hasText(node) {
  let found = false;
  function check(n) {
    if (found) return;
    if (n.type === 'text') {
      if (n.data.trim()) {
        found = true;
      }
    } else if (n.type === 'tag') {
      if (n.name !== 'script' && n.name !== 'style' && n.name !== 'svg') {
        for (const child of n.children || []) {
          check(child);
        }
      }
    }
  }
  check(node);
  return found;
}

function hasDirectText(node) {
  for (const child of node.children || []) {
    if (child.type === 'text' && child.data.trim()) {
      return true;
    }
  }
  return false;
}

function traverse(bgEl, enEl, $bg, $en) {
  if (!bgEl || !enEl) return;

  if (bgEl.type === 'tag' && enEl.type === 'tag') {
    const name = bgEl.name;
    if (name === 'script' || name === 'style' || name === 'svg') return;

    const isLayout = LAYOUT_TAGS.has(name);
    let isTarget = false;

    if (isLayout) {
      if (hasDirectText(bgEl)) {
        isTarget = true;
      }
    } else {
      if (hasText(bgEl)) {
        isTarget = true;
      }
    }

    if (isTarget) {
      const bgInner = $bg(bgEl).html() || '';
      const enInner = $en(enEl).html() || '';

      const bgText = normalizeText(bgInner);
      const enText = normalizeText(enInner);

      if (bgText && enText) {
        matchedPairs.set(enText, bgText);
      }
      if (!isLayout) return; // Do not recurse for leaf-level text tags
    }

    const bgChildren = (bgEl.children || []).filter(c => c.type === 'tag');
    const enChildren = (enEl.children || []).filter(c => c.type === 'tag');

    const matchedEnIndices = new Set();
    for (const bgChild of bgChildren) {
      let matchedEnChild = null;

      for (let i = 0; i < enChildren.length; i++) {
        if (matchedEnIndices.has(i)) continue;
        const enChild = enChildren[i];
        if (enChild.name === bgChild.name) {
          const bgClass = bgChild.attribs ? bgChild.attribs.class : null;
          const enClass = enChild.attribs ? enChild.attribs.class : null;
          if (bgClass === enClass) {
            matchedEnChild = enChild;
            matchedEnIndices.add(i);
            break;
          }
        }
      }

      if (!matchedEnChild) {
        for (let i = 0; i < enChildren.length; i++) {
          if (matchedEnIndices.has(i)) continue;
          const enChild = enChildren[i];
          if (enChild.name === bgChild.name) {
            matchedEnChild = enChild;
            matchedEnIndices.add(i);
            break;
          }
        }
      }

      if (matchedEnChild) {
        traverse(bgChild, matchedEnChild, $bg, $en);
      }
    }
  }
}

function matchFiles(enFilePath, bgFilePath) {
  console.log(`Matching: \n  EN: ${path.basename(enFilePath)}\n  BG: ${path.basename(bgFilePath)}`);
  try {
    const bgContent = fs.readFileSync(bgFilePath, 'utf-8');
    const enContent = fs.readFileSync(enFilePath, 'utf-8');

    const $bg = cheerio.load(bgContent);
    const $en = cheerio.load(enContent);

    const bgBody = $bg('body').get(0);
    const enBody = $en('body').get(0);

    if (bgBody && enBody) {
      traverse(bgBody, enBody, $bg, $en);
    }
  } catch (err) {
    console.error(`Error matching files: ${err.message}`);
  }
}

function processDir(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const htmlFiles = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }

  if (htmlFiles.length > 0) {
    const bgFile = htmlFiles.find(f => /[\u0400-\u04FF]/.test(f));
    const enFile = htmlFiles.find(f => !/[\u0400-\u04FF]/.test(f));
    if (bgFile && enFile) {
      matchFiles(enFile, bgFile);
    }
  }
}

// 1. Process all HTML files in src/
processDir(SRC_DIR);

// 2. Also process the home page from mirrors/
const enHome = '/home/pnoulis/src/diaxyz/forstorebg.com/mirrors/en/index.html';
const bgHome = '/home/pnoulis/src/diaxyz/forstorebg.com/mirrors/bg/index.html';
if (fs.existsSync(enHome) && fs.existsSync(bgHome)) {
  matchFiles(enHome, bgHome);
}

console.log(`Matched total of ${matchedPairs.size} distinct text pairs.`);

const finalDict = {};
for (const [enText, bgText] of matchedPairs.entries()) {
  const enHash = hashText(enText);
  finalDict[enHash] = {
    en: enText,
    bg: bgText
  };
}

fs.writeFileSync(OUT_JSON_PATH, JSON.stringify(finalDict, null, 2), 'utf-8');
console.log(`Successfully saved ${Object.keys(finalDict).length} combined translation keys to ${OUT_JSON_PATH}`);
