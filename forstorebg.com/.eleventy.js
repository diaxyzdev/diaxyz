export default function(eleventyConfig) {
  // Passthrough copy for next chunks and assets
  eleventyConfig.addPassthroughCopy("_next");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("app.js");
  eleventyConfig.addPassthroughCopy("site.webmanifest.html");
  eleventyConfig.addPassthroughCopy("src/**/*.css");

  return {
    dir: {
      input: "src",
      output: "build",
      includes: "_includes"
    },
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid"
  };
};
