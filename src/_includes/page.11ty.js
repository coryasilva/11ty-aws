import { Container } from '../_components/container.js'
import { PageTitle } from '../_components/page-title.js'

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
      ${Container({ children: content })}
    `
  }
}

export default Page
