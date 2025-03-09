import Alpine from "alpinejs";
// import dropdown from './dropdown'

window.Alpine = Alpine;

// Start Alpine when the page is ready.
window.addEventListener("DOMContentLoaded", () => {
  Alpine.start();
});

window.addEventListener("alpine:init", () => {
  // Alpine.data('dropdown', dropdown)
});
