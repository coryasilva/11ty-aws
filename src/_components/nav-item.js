import { html } from 'common-tags'

/**
 * @typedef {object} NavItemProps
 * @property {string} url
 * @property {string} text
 * @property {string} [currentUrl]
 */

/**
 * @param {NavItemProps} props
 */
export function NavItem (props) {
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

