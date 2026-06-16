module.exports = function(eleventyConfig) {
  // Passthrough copy for next chunks and assets
  eleventyConfig.addPassthroughCopy("_next");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("app.js");
  eleventyConfig.addPassthroughCopy("site.webmanifest.html");

  return {
    dir: {
      input: "src",
      output: "build",
      includes: "_includes"
    },
    markdownTemplateEngine: "ejs",
    htmlTemplateEngine: "ejs"
  };
};
