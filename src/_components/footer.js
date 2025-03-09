import { html } from "common-tags";
import { Container } from "./container.js";

/**
 * @typedef {object} FooterProps
 * @property {string} [children]
 */

/**
 * @param {FooterProps} props
 */
export function Footer(props) {
  return Container({
    classNames: "py-5 mt-16",
    tag: "footer",
    children: html`
      <p class="block text-center text-sm text-gray-700">
        ${props.children}
      </p>
    `,
  });
}
