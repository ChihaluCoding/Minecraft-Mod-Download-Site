(() => {
  const FILTER_KEYS = ["minecraftVersion", "loader", "environment"];
  const filterState = {
    minecraftVersion: "",
    loader: "",
    environment: ""
  };

  let allMods = [];
  let allUpdates = [];

  const TEXT = {
  "updates.empty": "\u307e\u3060\u5229\u7528\u53ef\u80fd\u306a\u30a2\u30c3\u30d7\u30c7\u30fc\u30c8\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
  "updates.card.link": "\u8a73\u7d30\u3092\u8aad\u3080",
  "mods.empty": "\u5229\u7528\u53ef\u80fd\u306aMOD\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
  "mods.emptyFiltered": "\u9078\u629e\u3057\u305f\u30d5\u30a3\u30eb\u30bf\u30fc\u306b\u4e00\u81f4\u3059\u308b MOD \u306f\u3042\u308a\u307e\u305b\u3093\u3002",
  "mods.card.untitled": "\u7121\u984c\u306eMOD",
  "mods.card.view": "\u8a73\u7d30\u3092\u898b\u308b",
  "mods.description.hide": "\u8aac\u660e\u3092\u96a0\u3059",
  "mods.description.show": "\u8aac\u660e\u3092\u8868\u793a",
  "meta.version": "\u30d0\u30fc\u30b8\u30e7\u30f3",
  "meta.environment": "\u74b0\u5883",
  "meta.minecraft": "\u30de\u30a4\u30f3\u30af\u30e9\u30d5\u30c8\u306e\u30d0\u30fc\u30b8\u30e7\u30f3",
  "meta.fileSize": "\u30d5\u30a1\u30a4\u30eb\u30b5\u30a4\u30ba",
  "meta.releaseDate": "\u767a\u58f2\u65e5",
  "filters.all": "\u5168\u3066",
  "environment.client": "\u30af\u30e9\u30a4\u30a2\u30f3\u30c8",
  "environment.server": "\u30b5\u30fc\u30d0",
  "environment.client_server": "\u30af\u30e9\u30a4\u30a2\u30f3\u30c8\u3068\u30b5\u30fc\u30d0\u30fc",
  "environment.unknown": "\u672a\u77e5"
};
  const TAG_LABELS = {
  "survival": "\u30b5\u30d0\u30a4\u30d0\u30eb",
  "quality_of_life": "\u751f\u6d3b\u306e\u8cea",
  "gameplay": "\u30b2\u30fc\u30e0\u30d7\u30ec\u30a4",
  "equipment": "\u88c5\u7f6e",
  "lightweight": "\u8efd\u91cf",
  "audio": "\u30aa\u30fc\u30c7\u30a3\u30aa",
  "atmosphere": "\u96f0\u56f2\u6c17",
  "building": "\u5efa\u7269",
  "utility": "\u30e6\u30fc\u30c6\u30a3\u30ea\u30c6\u30a3"
};
  const ENVIRONMENT_LABELS = {
  "client": "\u30af\u30e9\u30a4\u30a2\u30f3\u30c8",
  "server": "\u30b5\u30fc\u30d0",
  "client_server": "\u30af\u30e9\u30a4\u30a2\u30f3\u30c8\u3068\u30b5\u30fc\u30d0\u30fc",
  "unknown": "\u672a\u77e5"
};

  function t(key) {
    return TEXT[key] ?? key;
  }

  function tagLabel(key) {
    return TAG_LABELS[key] ?? key;
  }

  function environmentLabel(key) {
    return ENVIRONMENT_LABELS[key] ?? key;
  }

  function localizeText(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value.ja) return value.ja;
      if (value.en) return value.en;
      const first = Object.values(value).find((entry) => entry);
      return first ? String(first) : "";
    }
    return String(value);
  }

  function formatDate(value) {
    if (!value) return "";
    const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(String(value).trim());
    if (match) {
      const [, y, m, d] = match;
      return `${parseInt(y, 10)}\u5e74${parseInt(m, 10)}\u6708${parseInt(d, 10)}\u65e5`;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return `${date.getFullYear()}\u5e74${date.getMonth() + 1}\u6708${date.getDate()}\u65e5`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectCurrentYear();
    syncThemeSelectors();
    initializeUpdates();
    initializeModListing();

      });

  function injectCurrentYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  function syncThemeSelectors() {
    const select = document.querySelector("[data-theme-select]");
    if (!select) return;

    const currentTheme = document.documentElement.dataset.theme || localStorage.getItem("site-theme") || select.value || "light-blue";
    select.value = currentTheme;

    if (!select.dataset.themeBound) {
      select.addEventListener("change", (event) => {
        const next = event.target.value;
        document.documentElement.dataset.theme = next;
        localStorage.setItem("site-theme", next);
      });
      select.dataset.themeBound = "true";
    }
  }

  function initializeUpdates() {
    if (!Array.isArray(window.updatesData)) return;
    allUpdates = [...window.updatesData].sort((a, b) => safeDate(b.date) - safeDate(a.date));
    renderUpdatesPreview();
    renderUpdatesList();
  }

  function renderUpdatesPreview() {
    const container = document.getElementById("updates-preview");
    if (!container) return;

    container.textContent = "";
    const limit = parseInt(container.dataset.limit ?? "", 10);
    const updates = Number.isFinite(limit) && limit > 0 ? allUpdates.slice(0, limit) : allUpdates;

    if (!updates.length) {
      container.appendChild(createUpdateEmpty(t("updates.empty")));
      return;
    }

    updates.forEach((update) => {
      container.appendChild(createUpdateCard(update, true));
    });
  }

  function renderUpdatesList() {
    const container = document.getElementById("updates-list");
    if (!container) return;

    container.textContent = "";
    if (!allUpdates.length) {
      container.appendChild(createUpdateEmpty(t("updates.empty")));
      return;
    }

    allUpdates.forEach((update) => {
      container.appendChild(createUpdateCard(update, false));
    });
  }

  function createUpdateCard(update, isPreview) {
    const article = document.createElement("article");
    article.className = "update-card";
    if (isPreview) {
      article.classList.add("update-card--preview");
    }

    const date = document.createElement("p");
    date.className = "update-card__date";
    date.textContent = formatDate(update.date);
    article.appendChild(date);

    const title = document.createElement("h3");
    title.className = "update-card__title";
    title.textContent = localizeText(update.title);
    article.appendChild(title);

    if (update.body) {
      const body = document.createElement("p");
      body.className = "update-card__body";
      body.textContent = localizeText(update.body);
      article.appendChild(body);
    }

    if (update.link) {
      const actions = document.createElement("div");
      actions.className = "update-card__actions";

      const link = document.createElement("a");
      link.className = "button button--secondary";
      link.href = update.link;
      link.textContent = t("updates.card.link");
      actions.appendChild(link);

      article.appendChild(actions);
    }

    return article;
  }

  function createUpdateEmpty(message) {
    const empty = document.createElement("p");
    empty.className = "updates__empty";
    empty.textContent = message;
    return empty;
  }

  function initializeModListing() {
    allMods = Array.isArray(window.modData) ? [...window.modData] : [];
    populateFilters();
    renderModCards();
  }

  function populateFilters() {
    const panel = document.getElementById("mod-filter-panel");
    if (!panel) return;

    const controls = panel.querySelectorAll("[data-filter]");
    controls.forEach((control) => {
      const key = control.dataset.filter;
      const currentValue = filterState[key] ?? "";
      injectFilterOptions(control, key, currentValue);
      control.addEventListener("change", (event) => {
        filterState[key] = event.target.value;
        renderModCards();
      });
    });

    const clearButton = panel.querySelector("[data-filter-clear]");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        FILTER_KEYS.forEach((key) => {
          filterState[key] = "";
        });
        panel.querySelectorAll("[data-filter]").forEach((control) => {
          control.value = "";
        });
        renderModCards();
      });
    }

  }

  function injectFilterOptions(selectEl, key, currentValue) {
    if (!selectEl) return;

    selectEl.querySelectorAll("option[data-generated]").forEach((option) => option.remove());

    const values = collectUniqueValues(allMods, key);
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.dataset.generated = "true";
      option.textContent = translateFilterLabel(key, value);
      selectEl.appendChild(option);
    });

    selectEl.value = currentValue;
  }

  function collectUniqueValues(mods, key) {
    const bucket = new Set();

    mods.forEach((mod) => {
      const value = mod[key];
      if (!value) return;

      if (Array.isArray(value)) {
        value.forEach((entry) => {
          if (entry) bucket.add(entry);
        });
      } else {
        bucket.add(value);
      }
    });

    const values = [...bucket];
    return sortFilterValues(key, values);
  }

  function sortFilterValues(key, values) {
    if (key === "minecraftVersion") {
      return values.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }));
    }

    return values.sort((a, b) => a.localeCompare(b, "ja", { numeric: true, sensitivity: "base" }));
  }

  function renderModCards(mods = allMods) {
    const grid = document.getElementById("mod-grid");
    if (!grid) return;

    grid.textContent = "";

    if (!mods.length) {
      grid.appendChild(createEmptyNotice(t("mods.empty")));
      return;
    }

    const filtered = applyFilters(mods).sort((a, b) => safeDate(b.releaseDate) - safeDate(a.releaseDate));

    if (!filtered.length) {
      grid.appendChild(createEmptyNotice(t("mods.emptyFiltered")));
      return;
    }

    const limit = parseInt(grid.dataset.limit ?? "", 10);
    const modsToRender = Number.isFinite(limit) && limit > 0 ? filtered.slice(0, limit) : filtered;

    modsToRender.forEach((mod) => {
      grid.appendChild(createModCard(mod));
    });
  }

  function createEmptyNotice(message) {
    const empty = document.createElement("p");
    empty.className = "mod-grid__empty";
    empty.textContent = message;
    return empty;
  }

  function applyFilters(mods) {
    return mods.filter((mod) =>
      FILTER_KEYS.every((key) => {
        const filterValue = filterState[key];
        if (!filterValue) return true;

        const modValue = mod[key];
        if (Array.isArray(modValue)) {
          return modValue.some((value) => normalize(value) === normalize(filterValue));
        }

        if (typeof modValue === "string") {
          return normalize(modValue) === normalize(filterValue);
        }

        return modValue === filterValue;
      })
    );
  }

  function createModCard(mod) {
    const card = document.createElement("article");
    card.className = "mod-card";

    if (mod.image) {
      const figure = document.createElement("figure");
      figure.className = "mod-card__media";

      const img = document.createElement("img");
      img.src = mod.image;
      img.alt = `${localizeText(mod.name)} preview`;
      img.loading = "lazy";
      img.decoding = "async";
      img.className = "mod-card__image";
      figure.appendChild(img);

      card.appendChild(figure);
    }

    card.appendChild(buildHeader(mod));

    if (mod.summary) {
      const summary = document.createElement("p");
      summary.className = "mod-card__summary";
      summary.textContent = localizeText(mod.summary);
      card.appendChild(summary);
    }

    if (mod.description) {
      card.appendChild(buildDescriptionAccordion(mod.description));
    }

    const meta = buildMeta(mod);
    if (meta) {
      card.appendChild(meta);
    }

    if (Array.isArray(mod.tags) && mod.tags.length) {
      const tags = document.createElement("div");
      tags.className = "mod-card__tags";
      mod.tags.forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "mod-card__tag";
        chip.textContent = tagLabel(tag);
        tags.appendChild(chip);
      });
      card.appendChild(tags);
    }

    card.appendChild(buildActions(mod));
    return card;
  }

  function buildDescriptionAccordion(description) {
    const details = document.createElement("details");
    details.className = "mod-card__accordion";

    const summary = document.createElement("summary");
    summary.className = "mod-card__accordion-toggle";
    details.appendChild(summary);

    const body = document.createElement("div");
    body.className = "mod-card__description";
    appendParagraphs(body, description);
    details.appendChild(body);

    updateAccordionToggleText(details, summary);
    details.addEventListener("toggle", () => updateAccordionToggleText(details, summary));

    return details;
  }

  function updateAccordionToggleText(details, summary) {
    summary.textContent = details.open
      ? t("mods.description.hide")
      : t("mods.description.show");
  }

  function appendParagraphs(container, text) {
    const localizedText = localizeText(text);
    const lines = String(localizedText)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      const p = document.createElement("p");
      p.textContent = localizedText;
      container.appendChild(p);
      return;
    }

    lines.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      container.appendChild(p);
    });
  }

  function buildHeader(mod) {
    const header = document.createElement("div");
    header.className = "mod-card__header";

    const group = document.createElement("div");

    if (mod.loader) {
      const badge = document.createElement("span");
      badge.className = "mod-card__badge";
      badge.textContent = mod.loader;
      group.appendChild(badge);
    }

    const title = document.createElement("h3");
    title.className = "mod-card__title";
    title.textContent = localizeText(mod.name) || t("mods.card.untitled");
    group.appendChild(title);

    header.appendChild(group);
    return header;
  }

  function buildMeta(mod) {
    const entries = [];

    if (mod.version) {
      entries.push(`${t("meta.version")}: ${mod.version}`);
    }

    if (mod.environment) {
      entries.push(`${t("meta.environment")}: ${environmentLabel(mod.environment)}`);
    }

    if (mod.minecraftVersion) {
      entries.push(`${t("meta.minecraft")}: ${mod.minecraftVersion}`);
    }

    if (mod.fileSize) {
      entries.push(`${t("meta.fileSize")}: ${mod.fileSize}`);
    }

    if (mod.releaseDate) {
      entries.push(`${t("meta.releaseDate")}: ${formatDate(mod.releaseDate)}`);
    }

    if (!entries.length) {
      return null;
    }

    const meta = document.createElement("div");
    meta.className = "mod-card__meta";

    entries.forEach((text, index) => {
      const span = document.createElement("span");
      span.textContent = text;
      meta.appendChild(span);
      if (index < entries.length - 1) {
        const separator = document.createElement("span");
        separator.textContent = " | ";
        meta.appendChild(separator);
      }
    });

    return meta;
  }

  function buildActions(mod) {
    const actions = document.createElement("div");
    actions.className = "mod-card__actions";

    const detailLink = document.createElement("a");
    detailLink.className = "button button--primary";
    detailLink.href = buildDetailUrl(mod);
    detailLink.textContent = t("mods.card.view");
    actions.appendChild(detailLink);

    return actions;
  }

  function buildDetailUrl(mod) {
    const slug = mod.slug || slugify(localizeText(mod.name));
    return `mod.html?slug=${encodeURIComponent(slug)}`;
  }

  function translateFilterLabel(key, value) {
    if (!value) {
      return t("filters.all");
    }

    if (key === "environment") {
      return environmentLabel(value);
    }

    if (key === "minecraftVersion") {
      return value;
    }

    return value;
  }

  
  function safeDate(value) {
    if (!value) return new Date(0);
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  }

  function normalize(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function slugify(value) {
    return String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
})();


