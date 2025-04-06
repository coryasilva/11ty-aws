import { html } from "common-tags";
import { Container } from "./container.js";
import { NavItem } from "./nav-item.js";

/**
 * @typedef {object} HeaderProps
 * @property {import('./nav-item.js').NavItemProps[]} navItems
 * @property {string} currentUrl
 */

/**
 * @param {HeaderProps} props
 */
export function Header(props) {
  const { navItems, currentUrl } = props;
  const children = html`
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
      `;
    })}
  </ul>
  `;
  return html`
  <header>
    ${Container({
      classNames: "pt-4 pb-2 flex flex-wrap justify-between",
      tag: "nav",
      children,
    })}
  </header>
  `;
}
