import { html } from 'common-tags'
import { Container } from './_components/container.js'
import { PageTitle } from './_components/page-title.js'

class Index {
  data () {
    return {
      layout: 'base.11ty.js',
      title: '11ty on AWS',
      description: 'Because some of us just can\'t use netlify.',
      permalink: '/',
    }
  }

  render (data) {
    const { title, description } = data
    return html`
      ${PageTitle({ title, subtitle: description, align: 'center' })}
      ${Container({
        children: html`
          <div class="flex flex-row justify-center">
            <div>
              <h2 class="text-3xl text-right font-bold">11ty</h2>
              <ul class="text-right">
                <li>Tailwind CSS</li>
                <li>Alpine JS</li>
                <li>Template literals</li>
                <li>clsx + twmerge</li>
              </ul>
            </div>
            <div class="text-4xl shrink px-5 font-light">+</div>
            <div>
              <h2 class="text-3xl font-bold">AWS</h2>
              <ul>
                <li>AWS CDK</li>
                <li>Route53</li>
                <li>Certificate Manager</li>
                <li>Cloudfront</li>
                <li>S3</li>
                <li>API Gateway</li>
                <li>Lambda</li>
              </ul>
            </div>
          </div>
        `,
      })}
    `
  }
}

export default Index
