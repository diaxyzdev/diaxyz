import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translatePlugin } from './translate/plugin.11ty.js';
import { TRANSLATE } from './translate/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */

export default function(eleventyConfig) {

  if (TRANSLATE) eleventyConfig.addPlugin(
    translatePlugin,
    { dataSourceJSON: "./src/_data/translations.json" }
  );

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
