(() => {
  const FILTER_KEYS = ["minecraftVersion", "loader", "environment"];
  const filterState = {
    minecraftVersion: "",
    loader: "",
    environment: ""
  };
  const MODS_PER_PAGE = 21;
  const ANNOUNCEMENTS_PER_PAGE = 21;
  let currentModPage = 1;
  let currentAnnouncementPage = 1;

  let allMods = [];
  let allAnnouncements = [];

  const TEXT = {
  "announcements.empty": "\u307e\u3060\u5229\u7528\u53ef\u80fd\u306a\u304a\u77e5\u3089\u305b\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
  "announcements.card.link": "\u8a73\u7d30\u3092\u8aad\u3080",
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
    initializeMobileNav();
    initializeAnnouncements();
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

  function initializeMobileNav() {
    const nav = document.querySelector(".top-nav");
    if (!nav) return;

    const toggle = nav.querySelector("[data-nav-toggle]");
    const menu = nav.querySelector("[data-nav-menu]");
    if (!toggle || !menu) return;

    const closeMenu = () => {
      nav.classList.remove("top-nav--open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "メニューを開く");
    };

    toggle.addEventListener("click", () => {
      const willOpen = !nav.classList.contains("top-nav--open");
      nav.classList.toggle("top-nav--open", willOpen);
      toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
      toggle.setAttribute("aria-label", willOpen ? "メニューを閉じる" : "メニューを開く");
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 900px)").matches) {
          closeMenu();
        }
      });
    });

    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 900px)").matches) {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("top-nav--open")) return;
      if (!nav.contains(event.target)) {
        closeMenu();
      }
    });
  }

  function initializeAnnouncements() {
    if (!Array.isArray(window.announcementsData)) return;
    allAnnouncements = [...window.announcementsData].sort((a, b) => safeDate(b.date) - safeDate(a.date));
    currentAnnouncementPage = 1;
    setupAnnouncementPaginationControls();
    renderAnnouncementsPreview();
    renderAnnouncementsList();
  }

  function renderAnnouncementsPreview() {
    const container = document.getElementById("announcements-preview");
    if (!container) return;

    container.textContent = "";
    const limit = parseInt(container.dataset.limit ?? "", 10);
    const announcements = Number.isFinite(limit) && limit > 0 ? allAnnouncements.slice(0, limit) : allAnnouncements;

    if (!announcements.length) {
      container.appendChild(createAnnouncementEmpty(t("announcements.empty")));
      return;
    }

    announcements.forEach((announcement) => {
      container.appendChild(createAnnouncementCard(announcement, true));
    });
  }

  function renderAnnouncementsList() {
    const container = document.getElementById("announcements-list");
    const pagination = document.getElementById("announcements-pagination");
    if (!container) return;

    container.textContent = "";
    if (pagination) {
      pagination.hidden = true;
    }

    if (!allAnnouncements.length) {
      container.appendChild(createAnnouncementEmpty(t("announcements.empty")));
      return;
    }

    const totalPages = Math.max(1, Math.ceil(allAnnouncements.length / ANNOUNCEMENTS_PER_PAGE));
    if (currentAnnouncementPage > totalPages) {
      currentAnnouncementPage = totalPages;
    }
    if (currentAnnouncementPage < 1) {
      currentAnnouncementPage = 1;
    }

    const startIndex = (currentAnnouncementPage - 1) * ANNOUNCEMENTS_PER_PAGE;
    const endIndex = startIndex + ANNOUNCEMENTS_PER_PAGE;
    const announcementsToRender = allAnnouncements.slice(startIndex, endIndex);

    announcementsToRender.forEach((announcement) => {
      container.appendChild(createAnnouncementCard(announcement, false));
    });

    updatePagination(pagination, totalPages, currentAnnouncementPage);
  }

  function createAnnouncementCard(announcement, isPreview) {
    const article = document.createElement("article");
    article.className = "update-card";
    if (isPreview) {
      article.classList.add("update-card--preview");
    }

    const date = document.createElement("p");
    date.className = "update-card__date";
    date.textContent = formatDate(announcement.date);
    article.appendChild(date);

    const title = document.createElement("h3");
    title.className = "update-card__title";
    title.textContent = localizeText(announcement.title);
    article.appendChild(title);

    if (announcement.body) {
      const body = document.createElement("p");
      body.className = "update-card__body";
      body.textContent = localizeText(announcement.body);
      article.appendChild(body);
    }

    if (announcement.link) {
      const actions = document.createElement("div");
      actions.className = "update-card__actions";

      const link = document.createElement("a");
      link.className = "button button--secondary";
      link.href = announcement.link;
      link.textContent = t("announcements.card.link");
      actions.appendChild(link);

      article.appendChild(actions);
    }

    return article;
  }

  function createAnnouncementEmpty(message) {
    const empty = document.createElement("p");
    empty.className = "updates__empty";
    empty.textContent = message;
    return empty;
  }

  function initializeModListing() {
    allMods = Array.isArray(window.modData) ? [...window.modData] : [];
    currentModPage = 1;
    setupModPaginationControls();
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
        currentModPage = 1;
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
        currentModPage = 1;
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
    const pagination = document.getElementById("mod-pagination");
    if (!grid) return;

    grid.textContent = "";
    if (pagination) {
      pagination.hidden = true;
    }

    if (!mods.length) {
      grid.appendChild(createEmptyNotice(t("mods.empty")));
      return;
    }

    const filtered = applyFilters(mods).sort((a, b) => safeDate(b.releaseDate) - safeDate(a.releaseDate));

    if (!filtered.length) {
      grid.appendChild(createEmptyNotice(t("mods.emptyFiltered")));
      return;
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / MODS_PER_PAGE));
    if (currentModPage > totalPages) {
      currentModPage = totalPages;
    }
    if (currentModPage < 1) {
      currentModPage = 1;
    }

    const startIndex = (currentModPage - 1) * MODS_PER_PAGE;
    const endIndex = startIndex + MODS_PER_PAGE;
    const modsToRender = filtered.slice(startIndex, endIndex);

    modsToRender.forEach((mod) => {
      grid.appendChild(createModCard(mod));
    });

    updatePagination(pagination, totalPages, currentModPage);
  }

  function setupModPaginationControls() {
    const pagination = document.getElementById("mod-pagination");
    if (!pagination || pagination.dataset.bound === "true") return;

    pagination.addEventListener("click", (event) => {
      const pageButton = event.target.closest("[data-page-number]");
      if (pageButton) {
        const nextPage = parseInt(pageButton.dataset.pageNumber ?? "", 10);
        if (Number.isFinite(nextPage) && nextPage !== currentModPage) {
          currentModPage = nextPage;
          renderModCards();
        }
        return;
      }

      const control = event.target.closest("[data-page-action]");
      if (!control) return;

      const action = control.dataset.pageAction;
      if (action === "prev" && currentModPage > 1) {
        currentModPage -= 1;
        renderModCards();
      } else if (action === "next") {
        currentModPage += 1;
        renderModCards();
      }
    });

    pagination.dataset.bound = "true";
  }

  function setupAnnouncementPaginationControls() {
    const pagination = document.getElementById("announcements-pagination");
    if (!pagination || pagination.dataset.bound === "true") return;

    pagination.addEventListener("click", (event) => {
      const pageButton = event.target.closest("[data-page-number]");
      if (pageButton) {
        const nextPage = parseInt(pageButton.dataset.pageNumber ?? "", 10);
        if (Number.isFinite(nextPage) && nextPage !== currentAnnouncementPage) {
          currentAnnouncementPage = nextPage;
          renderAnnouncementsList();
        }
        return;
      }

      const control = event.target.closest("[data-announcement-page-action]");
      if (!control) return;

      const action = control.dataset.announcementPageAction;
      if (action === "prev" && currentAnnouncementPage > 1) {
        currentAnnouncementPage -= 1;
        renderAnnouncementsList();
      } else if (action === "next") {
        currentAnnouncementPage += 1;
        renderAnnouncementsList();
      }
    });

    pagination.dataset.bound = "true";
  }

  function updatePagination(pagination, totalPages, currentPage) {
    if (!pagination) return;

    if (totalPages < 1) {
      pagination.hidden = true;
      return;
    }

    pagination.hidden = false;

    const pageContainer = pagination.querySelector("[data-pagination-pages]");
    if (pageContainer) {
      pageContainer.textContent = "";

      for (let page = 1; page <= totalPages; page += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mod-pagination__page";
        button.dataset.pageNumber = String(page);
        button.textContent = String(page);
        button.setAttribute("aria-label", `${page}ページ目`);
        if (page === currentPage) {
          button.classList.add("mod-pagination__page--current");
          button.disabled = true;
          button.setAttribute("aria-current", "page");
        }
        pageContainer.appendChild(button);
      }
    }

    const prev = pagination.querySelector('[data-page-action="prev"]');
    const next = pagination.querySelector('[data-page-action="next"]');
    const announcementPrev = pagination.querySelector('[data-announcement-page-action="prev"]');
    const announcementNext = pagination.querySelector('[data-announcement-page-action="next"]');

    if (prev) {
      prev.disabled = currentPage <= 1;
    }
    if (next) {
      next.disabled = currentPage >= totalPages;
    }
    if (announcementPrev) {
      announcementPrev.disabled = currentPage <= 1;
    }
    if (announcementNext) {
      announcementNext.disabled = currentPage >= totalPages;
    }
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
