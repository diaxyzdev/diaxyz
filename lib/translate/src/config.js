// Sets the target language code for generating new translations (e.g., 'es', 'fr').
export const TARGET_LOCALE = process.env.TRANSLATE_TARGET_LOCALE || "en";

// Specifies the original language code of the source HTML files (e.g., 'en').
export const SOURCE_LOCALE = process.env.TRANSLATE_SOURCE_LOCALE || "en";

// The HTML data attribute used to mark elements for translation.
export const TARGET_SELECTOR = "data-tt";

// ============================================================================
// NOTE ON TEMPLATE INTERPOLATION (Liquid, Handlebars, Nunjucks, etc.):
// If your HTML contains interpolation tags (e.g., {{ variable }}), you must handle
// them carefully during extraction. The parentheses in the regex below ensure that
// String.prototype.split() includes the matches in its output array, which is crucial
// for reconstructing the translated string later without mangling the variables.
// The question mark (?) makes the asterisk non-greedy so multiple tags aren't merged.
// ============================================================================

// Regex to match Liquid's interpolation expressions.
// export const RE_LIQUID_INTERPOLATION = /(\{\{[\s\S]*?\}\}|\{\%[\s\S]*?\%\})/g;

// When enabled, automatically calls the Google Translate API (or chosen package)
// for any missing translations.
export const TRY_TRANSLATE = (process.env.TRANSLATE_TRY_TRANSLATE || 0) == 1;

// When enabled, new API translations are saved back to the JSON dictionary
// to prevent duplicate API requests on future builds.
export const SAVE_TRANSLATIONS =
  (process.env.TRANSLATE_SAVE_TRANSLATIONS || 0) == 1;

// When enabled, new keys are added to the data source dictionary and a record is created
// where the source locale is set to the canonical text found in the source files.
export const SAVE_KEYS = (process.env.TRANSLATE_SAVE_KEYS || 0) == 1;

// Toggles detailed console logs for monitoring or debugging the translation process.
export const VERBOSE = (process.env.TRANSLATE_VERBOSITY || 0) == 1;

console.error(`TARGET_LOCALE:${TARGET_LOCALE}`);
console.error(`SOURCE_LOCALE:${SOURCE_LOCALE}`);
console.error(`TARGET_SELECTOR:${TARGET_SELECTOR}`);
console.error(`TRY_TRANSLATE:${TRY_TRANSLATE}`);
console.error(`SAVE_TRANSLATIONS:${SAVE_TRANSLATIONS}`);
console.error(`SAVE_KEYS:${SAVE_KEYS}`);
console.error(`VERBOSE:${VERBOSE}`);
