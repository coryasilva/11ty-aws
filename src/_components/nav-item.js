const { string } = require('prop-types')
const { html } = require('common-tags')
const { withPropTypeChecks } = require('../_utils')

NavItem.propTypes = {
  url: string.isRequired,
  text: string.isRequired,
  currentUrl: string,
}

function NavItem (props) {
  const { url, text, currentUrl = '' } = props
  const active = currentUrl.includes(url)

  return html`
    <a href="${url}"
      ${active && 'aria-current="page"'}
      class="group inline-block text-sm sm:text-base text-gray-700 hover:text-gray-900 focus-visible:text-gray-900 font-medium cursor-pointer transition-colors focus:outline-none">
      <span>${text}</span>
    </a>
  `
}

module.exports = withPropTypeChecks(NavItem)
