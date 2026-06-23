import translate from "google-translate-api-x";

/**
 * Translates a given piece of text using Google Translate API.
 *
 * @param {string} text - The text to translate.
 * @param {string} toLocale - The target language code (e.g., 'es', 'fr', 'de').
 * @param {string} fromLocale - The source language code
 * @returns {Promise<string>} The translated text.
 */
export function googleTranslate(text, toLocale, fromLocale) {
  return translate(text, { from: fromLocale, to: toLocale }).then(
    (res) => res.text,
  );
}
