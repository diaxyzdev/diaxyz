/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */

export default function(eleventyConfig) {

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

}
