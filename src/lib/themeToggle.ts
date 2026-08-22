// Wires up every `.theme-toggle` button (desktop header + mobile menu) to
// flip `document.documentElement.dataset.theme`. A manual choice is saved to
// localStorage so it survives a hard reload; the no-FOUC script in
// Layout.astro reads it back first, before falling back to the OS
// preference. It does NOT survive a view-transition swap on its own —
// Astro resets every <html> attribute to match the freshly-fetched page,
// which never has data-theme — so within a tab it also persists because
// that same script snapshots it on astro:before-swap and restores it on
// astro:after-swap, before this button's click state or anything else
// re-reads it.
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

      try {
        localStorage.setItem("theme", next);
      } catch {}

      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "dark" ? "#0a0a0a" : "#fafafa");

      document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
    });
  });
}
