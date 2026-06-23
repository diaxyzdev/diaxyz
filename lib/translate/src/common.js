import crypto from "node:crypto";

export function normalizeText(text) {
  return text.trim().replace(/\s+/g, " ");
}

export function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("base64");
}

export function WARNING_MISSING_TRANSLATION(translationTarget) {
  return `[WARNING] Missing translation: ${JSON.stringify(translationTarget)}`;
}

export function WARNING_MALFORMED_TRANSLATION_TARGET(translationTarget) {
  return `[WARNING] Malformed translation target: ${JSON.stringify(translationTarget)}`;
}

export function ERR_FAILED_TRANSLATION(translationTarget) {
  return `[ERROR] Failed translation: ${JSON.stringify(translationTarget)}`;
}

export function WARNING_MISSING_KEY(translationTarget) {
  return `[WARNING] Missing key: ${JSON.stringify(translationTarget)}`;
}
