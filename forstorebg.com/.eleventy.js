import ejsPlugin from "@11ty/eleventy-plugin-ejs";

export default function(eleventyConfig) {
  eleventyConfig.addPlugin(ejsPlugin);

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
