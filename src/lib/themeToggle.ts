// Wires up every `.theme-toggle` button (desktop header + mobile menu) to
// flip `document.documentElement.dataset.theme`. Deliberately writes
// nothing to storage: the attribute lives in memory only, surviving
// Astro view-transition navigations for free (the <html> node itself is
// never torn down) and resetting to the OS preference on a hard reload,
// per the no-FOUC script in Layout.astro.
export function initThemeToggle(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".theme-toggle");

  buttons.forEach((button) => {
    // Header/MobileMenu are transition:persist'd, so this only needs to
    // bind once; re-running on every astro:page-load would double-fire.
    if (button.dataset.themeBound === "true") return;
    button.dataset.themeBound = "true";

    button.addEventListener("click", () => {
      const root = document.documentElement;
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;

      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "dark" ? "#0a0a0a" : "#fafafa");

      document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
    });
  });
}
