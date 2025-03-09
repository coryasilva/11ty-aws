import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...classNames) {
  return twMerge(clsx(classNames));
}
