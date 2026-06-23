import crypto from "node:crypto";
import fs from "node:fs";
import * as cheerio from "cheerio";
import { TARGET_SELECTOR, TARGET_LOCALE } from "./config.js";
import {
  WARNING_MISSING_KEY,
  WARNING_MALFORMED_TRANSLATION_TARGET,
  WARNING_MISSING_TRANSLATION,
  normalizeText,
  hashText,
} from "./common.js";
import { initializeJSONDataSource } from "./dataSource.json.js";

let dataSource;

export function translatePlugin(eleventyConfig, pluginOptions) {
  dataSource = initializeJSONDataSource(pluginOptions.dataSourceJSON);

  // Translate static content
  eleventyConfig.addPreprocessor(
    "translatePre",
    "html,liquid",
    function (context, inputFileRaw) {
      if (!context.page.inputPath.endsWith(".html")) return inputFileRaw;
      return translate(context.page, inputFileRaw, `[${TARGET_SELECTOR}=pre]`);
    },
  );

  // Translate dynamic content
  eleventyConfig.addTransform("translatePost", function (inputFileRaw) {
    if (!this.page.inputPath.endsWith(".html")) return inputFileRaw;
    return translate(this.page, inputFileRaw, `[${TARGET_SELECTOR}=post]`);
  });
}

function translate(inputFileMetadata, inputFileRaw, selector) {
  // Cheerio parses the html string into an abstract syntax tree. This is
  // computationally very expensive and could potentially crash the process if
  // the html file is too big to fit in the allocated nodejs memory space.
  const ast = cheerio.load(inputFileRaw, null, true);

  // Remove the attribute from all matched elements
  const translationTargets = ast(selector).removeAttr(TARGET_SELECTOR);

  // Return early if there are no translations targets
  if (!translationTargets.length) return inputFileRaw;

  // Iterate and replace the HTML internally
  translationTargets.each(function () {
    const element = ast(this);
    const translationTarget = {
      file: inputFileMetadata.inputPath,
      name: this.name || this.tagName,
      attribs: this.attribs || {},
      innerHTML: element.html(),
    };

    translationTarget.text = normalizeText(translationTarget.innerHTML);

    if (!translationTarget.text) {
      console.error(WARNING_MALFORMED_TRANSLATION_TARGET(translationTarget));
      return;
    }

    translationTarget.key = hashText(translationTarget.text);

    if (!dataSource.hasKey(translationTarget.key)) {
      console.error(WARNING_MISSING_KEY(translationTarget));
      return;
    }

    const translation = dataSource.lookup(translationTarget.key, TARGET_LOCALE);

    if (translation) {
      // If translation is found, update the DOM
      element.html(translation);
    } else {
      // Graceful fallback: log the error, do not modify original HTML
      console.error(WARNING_MISSING_TRANSLATION(translationTarget));
    }
  });

  // Return the modified html
  return ast.html();
}
