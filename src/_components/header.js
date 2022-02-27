const { arrayOf, shape, string } = require('prop-types')
const { html } = require('common-tags')
const { withPropTypeChecks } = require('../_utils')
const Container = require('./container.js')
const NavItem = require('./nav-item.js')

Header.propTypes = {
  navItems: arrayOf(
    shape({
      url: string.isRequired,
      text: string.isRequired,
    }).isRequired
  ).isRequired,
  currentUrl: string.isRequired
}

function Header (props) {
  const { navItems, currentUrl } = props
  const content = html`
  <div>
      <a href="/" alt="11ty-aws" class="text-gray-700 hover:text-gray-900 focus-visible:text-gray-900 inline-block transition-colors focus:outline-none">
      11ty-aws
      </a>
  </div>
  <ul class="flex flex-wrap w-28 sm:w-32 mt-0.5 sm:mt-2 justify-between">
    ${navItems.map((item) => {
      return html`
        <li>
          ${NavItem({
            url: item.url,
            text: item.text,
            currentUrl,
          })}
        </li>
      `
    })}
  </ul>
  `
  return html`
  <header>
    ${Container({
      classes: 'pt-4 pb-2 flex flex-wrap justify-between',
      element: 'nav',
      content,
    })}
  </header>
  `
}

module.exports = withPropTypeChecks(Header)
