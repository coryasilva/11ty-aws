const { string, node } = require('prop-types')
const { html } = require('common-tags')
const { withPropTypeChecks } = require('../_utils')

Container.propTypes = {
  classes: string,
  element: string,
  content: node,
}

function Container (props) {
  const { classes = '', element = 'div', content = '' } = props
  return html`
    <${element} class="container mx-auto max-w-5xl px-5 ${classes}">
      ${content}
    </${element}>
  `
}

module.exports = withPropTypeChecks(Container)
