# Multilingual Architecture

This document outlines the architecture used to offer the static website in any
desired language using **Eleventy (11ty)**, the **Liquid** templating engine,
and a custom **Node.js** translation plugin.

## 1. Overview

The core philosophy of this architecture is **"Build once per language."**

Instead of relying on client-side JavaScript or complex runtime routing to
handle translations, the website is generated independently for each supported
locale.

This approach ensures:
- **Maximum Performance:** The final output is pure, pre-translated static HTML.
- **Perfect SEO:** Each language has its own dedicated, crawlable pages without
  relying on client-side rendering.
- **Graceful Fallbacks:** The build logs missing translations but falls back to
  the original text, preventing unlocalized dynamic content from breaking production builds.

## 2. Core Mechanisms

The translation system avoids cluttering template code with complex `t()`
function calls. Instead, it relies on simple custom data attributes
(`data-tt="pre"` and `data-tt="post"`) and uses **Cheerio** to parse and
swap text at build time.

### A. The Translation Dictionary (`translations.json`)

The source of truth for all localizations is `src/_data/translations.json`.
Eleventy's Global Data capability automatically loads this file.

- Keys are generated dynamically based on the default English text.
- To prevent excessively long keys (especially for entire blog posts), the
  system normalizes the text and generates a **44-character base64-encoded SHA-256 hash** using Node's
  native `crypto` module.

### B. Dual-Phase Translation Plugin

To handle both static UI text and user-generated dynamic content, the
architecture splits the translation logic into two distinct lifecycle phases
within an Eleventy Plugin (`11ty/translate/translate.js`):

#### Phase 1: The Preprocessor (`data-tt="pre"`)

- **When it runs:** *Before* the Liquid templating engine evaluates the file.
- **Use case:** Static layouts, headers, buttons, and UI elements.
- **How it works:** It intercepts raw template code. If it finds text with
  Liquid variables (e.g., `Hello {{ user.name }}!`), the entire block including the
  variables is hashed and translated. This allows translators to reorder variables
  according to the grammatical rules of the target language. When the Liquid engine
  runs next, the translated text and properly positioned variables are evaluated.

#### Phase 2: The Post-processor / Transform (`data-tt="post"`)

- **When it runs:** *After* the Liquid templating engine has fully evaluated the
  file into final HTML.
- **Use case:** User-generated content, database-injected blog posts, or CMS data.
- **How it works:** Because Liquid has already injected the dynamic data, the
  `data-tt="post"` transform parses the fully evaluated text (e.g., `Hello
  John!`). It generates a hash for the final rendered string and looks it up in
  the dictionary.

## 3. Implementation

The translation stage employs a modular architecture split into discreet scripts.

1. Extract
2. Parse / Transform
3. Hash
4. Lookup translations
5. Translate

The sequence can purposefully be run as a stand alone program from the command
line which lends itself beautifully to translating static text (data-tt=pre).

However, when we need to translate static text mixed with dynamic content
(data-tt=post), the sequence is initiated by 11ty at build time.

## 4. Automated Extraction & Build Workflow

The architecture completely automates the extraction of new translatable strings.

### Extraction (`npm run extract`)

Developers do not manually create keys. Running `npm run extract` triggers a
dry-run build for the default locale (`en`). During this build, the plugin's
preprocessor and transform intercept every `data-tt` directive. If a string
does not yet exist in `translations.json`, the plugin automatically hashes it,
assigns the English value, and uses the `eleventy.after` event hook to save the
updated JSON file.

### Multi-Locale Building (`npm run build:all`)

The `Makefile` controls the production build. It iterates over a predefined list
of `LOCALES` (e.g., `en es`).
- For each language, it injects the `LOCALE` environment variable into the
  Eleventy process.
- `eleventy.config.js` reads `process.env.LOCALE` and dynamically routes the
  output to language-specific directories (`build/en/`, `build/es/`).
- **Graceful Fallback:** If the plugin encounters a missing translation while
  building for a non-default language, it reports an error in the console but
  returns the original text. This ensures the build completes successfully even if
  some new content hasn't been translated yet.

## 5. Development builds

One major negative consequence of the translation architecture is the time
consuming build process. Long build times hinder a fast development loop
ultimately affecting developer productivity.

Therefore, translations are **disabled by default** during development. The
`Makefile` sets `export TRANSLATE ?= 0`, and `eleventy.config.js` will entirely
skip loading the `translatePlugin` unless `process.env.TRANSLATE == 1`.

To run a production-like build with the translation stage enabled, you must
explicitly pass the `TRANSLATE=1` flag:

```bash
TRANSLATE=1 make all
```

## 6. Developer Usage

1. **Tag Content:** Mark elements with `data-tt="pre"` or `data-tt="post"`.
2. **Extract:** Run `npm run extract` to automatically populate the dictionary
   with new SHA-256 hashes.
3. **Translate:** Open `translations.json` and provide the target language
   equivalents for the newly extracted keys.
4. **Deploy:** Run `npm run build:all` to generate the highly optimized, fully
   localized static sites.
