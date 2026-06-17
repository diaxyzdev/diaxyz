# Architecture Critique

While the current architecture is an inventive and functional prototype, it has severe scalability, linguistic, and operational flaws if it were to be deployed for a massive, enterprise-level application.

### 1. The "Immovable Liquid Tag" Fallacy (Linguistic Failure)
Our `translate="pre"` directive splits text using a regex to preserve Liquid tags (e.g., `Hello {{ user.name }}, welcome to {{ place }}!`). It translates the static text *around* the tags. 
**The fatal flaw:** This assumes the grammatical structure of the target language is identical to English. What if Spanish grammar requires `{{ place }}` to appear *before* `{{ user.name }}`? Because our architecture treats Liquid tags as immovable boundaries, the translator is physically incapable of reordering the variables. The translation will be grammatically butchered.

### 2. Context Collision (The Hash Key Problem)
By converting normalized English strings into SHA-256 hashes, we lose context. If the English word "Book" appears twice on your site—once as a noun (a reading book) and once as a verb (to book a flight)—it generates the exact same hash.
**The fatal flaw:** Because both instances share the same key in `translations.json`, you are forced to translate it the exact same way everywhere. You cannot translate it as "Libro" in one place and "Reservar" in another.

### 3. Jamming CMS Data into a JSON File (`translate="post"`)
Our dynamic extraction captures fully evaluated data (like blog posts) and writes it into `translations.json`. 
**The fatal flaw:** A JSON file is a UI dictionary, not a database. If your site scales to 5,000 blog posts, `translations.json` will swell to dozens of megabytes, crashing your text editor and causing Git merge conflicts from hell. Content (like blog posts) should be translated at the CMS/Database level, while UI elements (buttons, headers) should be translated in `translations.json`. Mixing them is an architectural anti-pattern.

### 4. Severe Build-Time Performance Penalties
Eleventy is famous for being incredibly fast. 
**The fatal flaw:** We are passing *every single file* through Cheerio's HTML parser up to twice per build (once in the preprocessor, once in the transform). Parsing and serializing ASTs (Abstract Syntax Trees) in JavaScript is expensive. For a site with 10,000 pages, this will bottleneck Eleventy and increase build times exponentially. 

### 5. The "Fail-Fast" Deployment Nightmare
Failing the build when a translation is missing ensures 100% coverage, which sounds great in theory.
**The fatal flaw:** Imagine a content editor publishes a new blog post via a headless CMS on a Friday evening. The CI/CD pipeline triggers an Eleventy build. Because the post hasn't been manually translated to Spanish in `translations.json` yet, the *entire build fails*. The new English post never goes live, and the site deployment is paralyzed until a developer intervenes. Graceful fallbacks (showing English text if Spanish is missing) are usually preferred for dynamic content.

### 6. Hijacking Standard HTML Attributes
We used `translate="pre"` and `translate="post"`, and then we stripped them from the final HTML.
**The fatal flaw:** `translate` is an actual, standard HTML5 global attribute used to tell automated translation tools (like Chrome's built-in Google Translate) whether they should translate a node. By hijacking it for our build process and stripping it, we are removing standard semantic accessibility markers. We should have used a data attribute like `data-i18n="pre"`.

***

### Summary for Future Refactoring
To make it production-ready for an enterprise environment, you would need to:
1. Use `data-i18n` attributes instead of `translate`.
2. Implement ICU Message Format (e.g., `Hello {user}, welcome to {place}!`) inside the translation strings so translators can control variable placement.
3. Decouple CMS content translations (fetch them pre-translated from the API) from UI dictionary translations.
4. Replace Cheerio parsing with a custom Liquid tag/shortcode (e.g., `{% t "Hello World" %}`) which executes infinitely faster during the build.
