const { stripIndent } = require('common-tags')
const site = require('./_data/site')

class RobotsTxt {
  data () {
    return {
      permalink: '/robots.txt',
      eleventyExcludeFromCollections: true,
    }
  }

  render (_data) {
    return stripIndent`
      Sitemap: ${site.baseUrl}/sitemap.xml

      User-agent: *
      Disallow:

    `
  }
}

module.exports = RobotsTxt
