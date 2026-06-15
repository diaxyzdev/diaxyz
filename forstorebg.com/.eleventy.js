module.exports = function(eleventyConfig) {
  // Passthrough copy for top-level asset directories
  eleventyConfig.addPassthroughCopy("_next");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("icons");
  eleventyConfig.addPassthroughCopy("partners");
  eleventyConfig.addPassthroughCopy("app.js");

  // Passthrough copy for brand files and favicons
  eleventyConfig.addPassthroughCopy("forstore_dark_new.svg");
  eleventyConfig.addPassthroughCopy("forstore_lite_new.svg");
  eleventyConfig.addPassthroughCopy("forstore_ico.svg");
  eleventyConfig.addPassthroughCopy("favicon-16x16.png");
  eleventyConfig.addPassthroughCopy("favicon-32x32.png");
  eleventyConfig.addPassthroughCopy("apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("site.webmanifest.html");

  return {
    dir: {
      input: "src",
      output: "build",
      includes: "_includes"
    },
    // Set default preprocessor for markdown files to EJS (so they can use EJS layout and tags)
    markdownTemplateEngine: "ejs",
    htmlTemplateEngine: "ejs"
  };
};
