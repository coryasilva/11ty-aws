import { html } from 'common-tags'

class PageNotFound {
  data () {
    return {
      layout: 'page.11ty.js',
      title: 'Page not found',
      permalink: '/404.html',
      eleventyExcludeFromCollections: true,
    }
  }

  render (_data) {
    return html`
      <p class="mb-2">The page you've requested can't be found.</p>
      <a href="/" class="link-secondary">Go back to the homepage.</a>
    `
  }
}

export default PageNotFound
