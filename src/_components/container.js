import { html } from "common-tags";
import { cn } from "../_utils/cn.js";

/**
 * @typedef {object} ContainerProps
 * @property {string} [classNames]
 * @property {string} [tag]
 * @property {string} [children]
 */

/**
 * @param {ContainerProps} props
 */
export function Container(props) {
  const { classNames = "", tag = "div", children = "" } = props;
  return html`
    <${tag} class="${cn("container mx-auto max-w-5xl px-5", classNames)}">
      ${children}
    </${tag}>
  `;
}
