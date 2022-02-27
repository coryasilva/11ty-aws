const htmlmin = require('html-minifier')

module.exports = function (config) {
  config.setBrowserSyncConfig({
    files: ['dist/**/*'],
    open: true,
  })
  config.addPassthroughCopy({ 'public': './' })

  config.addTransform('htmlmin', function (content, outputPath) {
    if (
      process.env.ELEVENTY_PRODUCTION &&
      outputPath &&
      outputPath.endsWith('.html')
    ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      })
      return minified
    }
    return content
  })

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
}
