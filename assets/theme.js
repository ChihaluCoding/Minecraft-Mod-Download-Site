(() => {
  const STORAGE_KEY = "site-theme";
  const THEMES = ["light-blue", "light-pink", "dark"];
  const DEFAULT_THEME = "light-blue";

  let currentTheme = DEFAULT_THEME;

  document.addEventListener("DOMContentLoaded", () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.includes(stored)) {
      currentTheme = stored;
    }

    applyTheme(currentTheme);
    bindSelectors();
  });

  function bindSelectors() {
    const selectors = document.querySelectorAll("[data-theme-select]");
    selectors.forEach((select) => {
      if (!THEMES.includes(select.value)) {
        select.value = currentTheme;
      } else {
        select.value = currentTheme;
      }
      select.addEventListener("change", (event) => {
        const nextTheme = event.target.value;
        applyTheme(nextTheme);
      });
    });
  }

  function applyTheme(theme) {
    const nextTheme = THEMES.includes(theme) ? theme : DEFAULT_THEME;
    currentTheme = nextTheme;

    document.documentElement.dataset.theme = nextTheme;

    localStorage.setItem(STORAGE_KEY, nextTheme);
    syncSelectors(nextTheme);
  }

  function syncSelectors(theme) {
    document.querySelectorAll("[data-theme-select]").forEach((select) => {
      if (select.value !== theme) {
        select.value = theme;
      }
    });
  }
})();
