import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function(eleventyConfig, pluginOptions = {}) {
  const defaultOptions = {
    translationsPath: path.resolve(__dirname, '../src/_data/translations.json')
  };
  const options = { ...defaultOptions, ...pluginOptions };
  
  let translations = {};
  if (fs.existsSync(options.translationsPath)) {
    translations = JSON.parse(fs.readFileSync(options.translationsPath, 'utf-8'));
  }

  let newTranslationsAdded = false;
  const liquidRegex = /(\{\{[\s\S]*?\}\}|\{\%[\s\S]*?\%\})/g;

  function translateContent(content, locale, isPre) {
    const isDocument = /<\!DOCTYPE/i.test(content) || /<html/i.test(content);
    const $ = cheerio.load(content, null, isDocument);
    let modified = false;

    const selector = isPre ? '[translate="pre"]' : '[translate="post"]';

    $(selector).each(function() {
      const el = $(this);
      const rawHtml = el.html();
      if (!rawHtml) return;

      let parts;
      if (isPre) {
        // Pre-processor: preserve Liquid tags
        parts = rawHtml.split(liquidRegex);
      } else {
        // Post-processor: treat the entire innerHTML as one unit
        parts = [rawHtml];
      }

      const translatedParts = parts.map(part => {
        if (isPre && part.match(/^\{\{[\s\S]*?\}\}$|^\{\%[\s\S]*?\%\}$/)) {
          return part;
        }
        if (!part.trim()) {
          return part;
        }

        const normalized = part.trim().replace(/\s+/g, ' ');
        const key = crypto.createHash('sha256').update(normalized).digest('base64');

        const translationObj = translations[key];
        const translation = translationObj ? translationObj[locale] : null;

        if (translation) {
          const leadingWhitespace = part.match(/^\s*/)[0];
          const trailingWhitespace = part.match(/\s*$/)[0];
          return leadingWhitespace + translation + trailingWhitespace;
        } else {
          // If we are extracting (locale is 'en') or default language, record it
          if (!translations[key]) {
            translations[key] = { en: normalized };
            newTranslationsAdded = true;
          }
          
          if (locale !== 'en') {
            throw new Error(`Missing translation for: "${normalized}" (key: ${key}) in locale: "${locale}"`);
          }
          return part;
        }
      });

      el.html(translatedParts.join(''));
      el.removeAttr('translate');
      modified = true;
    });

    return modified ? $.html() : content;
  }

  eleventyConfig.addPreprocessor('translatePre', 'html,liquid', function(data, content) {
    const locale = process.env.LOCALE || 'en';
    return translateContent(content, locale, true);
  });

  eleventyConfig.addTransform('translatePost', function(content) {
    if (this.page.outputPath && this.page.outputPath.endsWith('.html')) {
      const locale = process.env.LOCALE || 'en';
      return translateContent(content, locale, false);
    }
    return content;
  });

  eleventyConfig.on('eleventy.after', () => {
    if (newTranslationsAdded) {
      fs.writeFileSync(options.translationsPath, JSON.stringify(translations, null, 2), 'utf-8');
      console.log('Updated translations.json with new keys.');
    }
  });
}
