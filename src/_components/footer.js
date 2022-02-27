const { node } = require('prop-types')
const { html } = require('common-tags')
const { withPropTypeChecks } = require('../_utils')
const Container = require('./container.js')

Footer.propTypes = {
  content: node,
}

function Footer (props) {
  return Container({
    classes: 'py-5 mt-16',
    element: 'footer',
    content: html`
      <p class="block text-center text-sm text-gray-700">
        ${props.content}
      </p>
    `
  })
}

module.exports = withPropTypeChecks(Footer)
