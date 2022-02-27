const { stripIndent } = require('common-tags')

class SitemapXml {
  data () {
    return {
      permalink: '/sitemap.xml',
      eleventyExcludeFromCollections: true,
    }
  }

  render (data) {
    return stripIndent`
      <?xml version="1.0" encoding="utf-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${data.collections.all.reduce((result, page) => {
          if (page.data.sitemapExclude === true) {
            return result
          }
          return `<url>
          <loc>${data.site.baseUrl}${page.url}</loc>
          <lastmod>${page.date.toISOString()}</lastmod>
        </url>`
        }, '')}
      </urlset>
    `
  }
}

module.exports = SitemapXml
