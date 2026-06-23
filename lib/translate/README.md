# Translate

A library for statically generating multi-language websites during the build
process.

## Features

Elements to be translated are identified by a custom attribute (which the user
may define):

default: `data-tt`
example: `<p data-tt>hello world</p>\*\*

The library will:

- **Look for translation targets**
- **Normalize innerHTML**
- **Hash the normalized text**
- **Lookup a target translation using the hash key**
- **Optionally translate**

## 1. CLI Usage

Run the translator script from the repository root to extract keys or translate
files in a target directory:

```bash
node lib/translate/src/translate.js <source-directory> [path/to/dictionary.json]
```

- **`<source-directory>`**: The directory containing the HTML source files to scan.
- **`[path/to/dictionary.json]`**: (Optional) Path to the translation dictionary
  JSON file. Defaults to `/tmp/translate.json`.

## 2. Eleventy Plugin Integration

To translate pages during your Eleventy build, import and register
`translatePlugin` in your `eleventy.config.js`:

```javascript
import { translatePlugin } from "./lib/translate/src/plugin.11ty.js"; // Or 'translate' if using local dependency

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(translatePlugin, {
    dataSourceJSON: "./path/to/translations.json",
  });
}
```

### Build-Time Preprocessor & Transform

The plugin registers:

- A **preprocessor** (`translatePre`): Runs on `html` and `liquid` templates to process elements marked with `data-tt="pre"`.
- A **post-transform** (`translatePost`): Runs on output `html` files to process elements marked with `data-tt="post"`.

## Configuration & Environment Variables

The utility reads configuration parameters from environment variables (defined
in [`config.js`](file:///home/pnoulis/src/diaxyz/lib/translate/src/config.js)):

| Environment Variable          | Default | Description                                                                   |
| :---------------------------- | :------ | :---------------------------------------------------------------------------- |
| `TRANSLATE_TARGET_LOCALE`     | `'en'`  | The target language code to generate translations for (e.g., `'es'`, `'fr'`). |
| `TRANSLATE_SOURCE_LOCALE`     | `'en'`  | The canonical language of the source text files.                              |
| `TRANSLATE_TRY_TRANSLATE`     | `0`     | Set to `1` to call the Google Translate API for missing keys (CLI only).      |
| `TRANSLATE_SAVE_TRANSLATIONS` | `0`     | Set to `1` to save newly retrieved translations back to the JSON dictionary.  |
| `TRANSLATE_SAVE_KEYS`         | `0`     | Set to `1` to add new translation keys/source text to the JSON dictionary.    |
| `TRANSLATE_VERBOSITY`         | `0`     | Set to `1` to print detailed processing logs to console.                      |
