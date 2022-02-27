const Container = require('../_components/container')
const PageTitle = require('../_components/page-title')

class Page {
  data () {
    return {
      layout: 'base.11ty.js',
    }
  }

  render (data) {
    const { title, description, content } = data
    return `
      ${PageTitle({ title, subtitle: description })}
      ${Container({ content })}
    `
  }
}

module.exports = Page
