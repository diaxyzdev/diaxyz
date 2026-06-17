import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import i18nPlugin from './plugins/i18n.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */

export default function(eleventyConfig) {
  eleventyConfig.addPlugin(i18nPlugin);

  /*
    Directory where 11ty will look for input source files
  */
  eleventyConfig.setInputDirectory('src');

  /*
    Directory where 11ty will look for layouts, includes, extends, partials, and
    macros input source files. It is interpreted as relative to the input source
    directory
  */
  eleventyConfig.setIncludesDirectory('includes');

  /*
    Directory where 11ty will write its output
   */
  const locale = process.env.LOCALE || 'en';
  eleventyConfig.setOutputDirectory(`build/${locale}`);
}
