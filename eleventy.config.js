import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import htmlmin from "html-minifier";

export default function (config) {
  config.addPassthroughCopy({ public: "./" });

  config.addPlugin(eleventyImageTransformPlugin);

  config.addTransform("htmlmin", (content, outputPath) => {
    if (
      process.env.ELEVENTY_PRODUCTION &&
      outputPath &&
      outputPath.endsWith(".html")
    ) {
      const minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  return {
    dir: {
      input: "src",
      output: "dist",
    },
  };
}
