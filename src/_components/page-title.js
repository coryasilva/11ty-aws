import { html } from "common-tags";
import { cn } from "../_utils/cn.js";
import { Container } from "./container.js";

/**
 * @typedef {object} PageTitleProps
 * @property {string} title
 * @property {string} [subtitle]
 * @property {'left'|'center'|'right'} [align]
 */

/**
 * @param {PageTitleProps} props
 */
export function PageTitle(props) {
  const { title, subtitle, align = "left" } = props;
  const alignClass = cn({
    "text-left": align === "left",
    "text-center": align === "center",
    "text-right": align === "right",
  });
  const children = html`
    <h1 class="font-extrabold text-4xl md:text-5xl leading-tight ${alignClass}">
      ${title}
    </h1>
    ${
      subtitle &&
      html`
      <p class="mt-2 md:mt-3.5 font-normal text-base sm:text-lg leading-tight text-gray-600 ${alignClass}">
        ${subtitle}
      </p>
    `
    }
  `;
  return Container({
    classNames: "py-8 md:py-16",
    children,
  });
}
