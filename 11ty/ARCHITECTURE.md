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
- **Absolute Coverage:** The build fails intentionally if translations are
  missing, preventing unlocalized text from reaching production.

## 2. Core Mechanisms

The translation system avoids cluttering template code with complex `t()`
function calls. Instead, it relies on simple custom HTML attributes
(`translate="pre"` and `translate="post"`) and uses **Cheerio** to parse and
swap text at build time.

### A. The Translation Dictionary (`translations.json`)

The source of truth for all localizations is `src/_data/translations.json`.
Eleventy's Global Data capability automatically loads this file.

- Keys are generated dynamically based on the default English text.
- To prevent excessively long keys (especially for entire blog posts), the
  system normalizes the text and generates a **44-character SHA-256 base64
  hash** using Node's native `crypto` module.

### B. Dual-Phase Translation Plugin

To handle both static UI text and user-generated dynamic content, the
architecture splits the translation logic into two distinct lifecycle phases
within an Eleventy Plugin (`11ty/plugins/i18n.js`):

#### Phase 1: The Preprocessor (`translate="pre"`)

- **When it runs:** *Before* the Liquid templating engine evaluates the file.
- **Use case:** Static layouts, headers, buttons, and UI elements.
- **How it works:** It intercepts raw template code. If it finds text with
  Liquid variables (e.g., `Hello {{ user.name }}!`), it uses regex to split the
  text. The static parts are translated, but the Liquid variables are preserved
  in their exact original positions. When the Liquid engine runs next, the
  translated text is already in place.

#### Phase 2: The Post-processor / Transform (`translate="post"`)

- **When it runs:** *After* the Liquid templating engine has fully evaluated the
  file into final HTML.
- **Use case:** User-generated content, database-injected blog posts, or CMS data.
- **How it works:** Because Liquid has already injected the dynamic data, the
  `translate="post"` transform parses the fully evaluated text (e.g., `Hello
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
line which lends itself beautifully to translating static text (translate=pre).

However, when we need to translate static text mixed with dynamic content
(translate=post), the sequence is initiated by 11ty at build time.

## 3. Automated Extraction & Build Workflow

The architecture completely automates the extraction of new translatable strings.

### Extraction (`npm run extract`)

Developers do not manually create keys. Running `npm run extract` triggers a
dry-run build for the default locale (`en`). During this build, the plugin's
preprocessor and transform intercept every `translate` directive. If a string
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
- **Fail-Fast Safety:** If the plugin encounters a missing translation while
  building for a non-default language, it throws a fatal error, guaranteeing
  100% translation completion before deployment.
## 4. Development builds

One major negative consequence of the translation architecture is the time
consuming build process. Long build times hinder a fast development loop
ultimately affecting developer productivity.

Therefore, the developer is allowed to opt out of the translation stage by
passing in the flag **TRANSLATE=0** to the build process.


```bash

TRANSLATE=0 make build

```

## 4. Developer Usage

1. **Tag Content:** Mark elements with `translate="pre"` or `translate="post"`.
2. **Extract:** Run `npm run extract` to automatically populate the dictionary
   with new SHA-256 hashes.
3. **Translate:** Open `translations.json` and provide the target language
   equivalents for the newly extracted keys.
4. **Deploy:** Run `npm run build:all` to generate the highly optimized, fully
   localized static sites.
