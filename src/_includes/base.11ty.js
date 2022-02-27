const { html } = require('common-tags')
const Footer = require('../_components/footer')
const Header = require('../_components/header')

class BasePage {
  render (data) {
    const {
      seoTitle = '',
      title = '',
      seoDescription = '',
      description = '',
      site,
      page,
      menu,
      content,
    } = data
    const _title = `${seoTitle || title} | ${site.name}`
    const _description = `${seoDescription || description || site.description}`

    return html`<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">

      <title>${_title}</title>
      <meta name="description" content="${_description}"/>

      <link rel="canonical" href="${site.baseUrl}${page.url}">

      <!-- Google Schema -->
      <meta itemprop="name" content="${_title}">
      <meta itemprop="description" content="${_description}">

      <!-- Twitter -->
      <meta name="twitter:title" content="${_title}">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:description" content="${_description}">
      <meta name="twitter:site" content="${site.twitter.site}">
      <meta name="twitter:creator" content="${site.twitter.creator}">
      <meta name="twitter:image" content="${site.twitter.image}">

      <!-- Icons -->
      <link rel="icon" href="${site.logo}" type="image/svg+xml">
      <link rel="icon" href="${site.favicon}" sizes="any">

      <link rel="stylesheet" href="/assets/main.bundle.css">
      <script src="/assets/main.bundle.js" defer></script>
    </head>
    <body class="flex flex-col min-h-screen">
      ${Header({
        navItems: menu,
        currentUrl: page.url,
      })}
      <main class="flex-grow">
        ${content}
      </main>
      ${Footer({
          content: html`${site.name}`,
      })}
    </body>
  </html>`
  }
}

module.exports = BasePage
