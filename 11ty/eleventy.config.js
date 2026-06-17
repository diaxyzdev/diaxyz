import "tsx/esm";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */


export default function(eleventyConfig) {

  // Disable automatic JS dependency tracking to prevent parser errors on JSX files
  eleventyConfig.setWatchJavaScriptDependencies(false);

  // Copy JS folder to build output without 11ty processing
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });

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
  eleventyConfig.setOutputDirectory('build');

  /*
    Markdown template engine (by default its liquid)
   */
  eleventyConfig.markdownTemplateEngine = 'mdx';
  // Available on unreleased v4: eleventyConfig.setMarkdownTemplateEngine('mdx');

  /*
    Specify template engine
   */
  // eleventyConfig.templateEngineOverride = '11ty.js';

}
