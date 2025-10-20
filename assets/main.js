(() => {
  const FILTER_KEYS = ["minecraftVersion", "loader", "environment"];
  const filterState = {
    minecraftVersion: "",
    loader: "",
    environment: ""
  };

  let allMods = [];

  document.addEventListener("DOMContentLoaded", () => {
    injectCurrentYear();
    initializeModListing();
  });

  function initializeModListing() {
    allMods = Array.isArray(window.modData) ? [...window.modData] : [];

    if (!allMods.length) {
      renderModCards([]);
      return;
    }

    populateFilters();
    renderModCards();
  }

  /**
   * 現在年をフッターに差し込み。
   */
  function injectCurrentYear() {
    const yearEl = document.getElementById("year");
    if (!yearEl) return;
    yearEl.textContent = new Date().getFullYear();
  }

  /**
   * モッドカードを描画する。フィルター適用後の結果を表示。
   */
  function renderModCards(mods = allMods) {
    const grid = document.getElementById("mod-grid");
    if (!grid) return;

    grid.textContent = "";

    if (!mods.length) {
      const empty = document.createElement("p");
      empty.className = "mod-grid__empty";
      empty.textContent =
        "まだMod情報が登録されていません。`assets/mods.js` の配列にデータを追加してください。";
      grid.appendChild(empty);
      return;
    }

    const filtered = applyFilters(mods).sort(
      (a, b) => safeDate(b.releaseDate) - safeDate(a.releaseDate)
    );

    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "mod-grid__empty";
      empty.textContent = "条件に一致するModが見つかりませんでした。フィルターを調整してください。";
      grid.appendChild(empty);
      return;
    }

    filtered.forEach((mod) => {
      grid.appendChild(createModCard(mod));
    });
  }

  function populateFilters() {
    const panel = document.getElementById("mod-filter-panel");
    if (!panel) return;

    const controls = panel.querySelectorAll("[data-filter]");
    controls.forEach((control) => {
      const key = control.dataset.filter;
      injectFilterOptions(control, key);
      control.addEventListener("change", (event) => {
        filterState[key] = event.target.value;
        renderModCards();
      });
    });

    const clearButton = panel.querySelector("[data-filter-clear]");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        controls.forEach((control) => {
          control.value = "";
        });
        FILTER_KEYS.forEach((key) => {
          filterState[key] = "";
        });
        renderModCards();
      });
    }
  }

  function injectFilterOptions(selectEl, key) {
    if (!selectEl) return;

    // 既存の自動生成オプションを削除
    selectEl.querySelectorAll("option[data-generated]").forEach((option) => option.remove());

    const uniqueValues = collectUniqueValues(allMods, key);
    uniqueValues.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      option.dataset.generated = "true";
      selectEl.appendChild(option);
    });
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
      return values.sort((a, b) =>
        b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" })
      );
    }

    return values.sort((a, b) =>
      a.localeCompare(b, "ja", { numeric: true, sensitivity: "base" })
    );
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
      img.alt = `${mod.name} プレビュー`;
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
      summary.textContent = mod.summary;
      card.appendChild(summary);
    }

    if (mod.description) {
      const desc = document.createElement("p");
      desc.className = "mod-card__description";
      desc.textContent = mod.description;
      card.appendChild(desc);
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
        chip.textContent = tag;
        tags.appendChild(chip);
      });
      card.appendChild(tags);
    }

    card.appendChild(buildActions(mod));
    return card;
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
    title.textContent = mod.name ?? "未命名のMod";
    group.appendChild(title);

    header.appendChild(group);
    return header;
  }

  function buildMeta(mod) {
    const entries = [
      mod.version ? `バージョン: ${mod.version}` : null,
      mod.environment ? `環境: ${mod.environment}` : null,
      mod.minecraftVersion ? `Minecraft: ${mod.minecraftVersion}` : null
    ].filter(Boolean);

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
        const dot = document.createElement("span");
        dot.textContent = "・";
        meta.appendChild(dot);
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
    detailLink.textContent = "詳細ページを見る";
    actions.appendChild(detailLink);

    return actions;
  }

  function buildDetailUrl(mod) {
    const slug = mod.slug || slugify(mod.name);
    return `mod.html?slug=${encodeURIComponent(slug)}`;
  }

  function applyLocaleOptions(value) {
    return String(value ?? "").trim();
  }

  function normalize(value) {
    return applyLocaleOptions(value).toLowerCase();
  }

  function safeDate(value) {
    if (!value) return new Date(0);
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  }

  function formatDate(value) {
    const date = safeDate(value);
    if (!value || Number.isNaN(date.getTime())) return value ?? "";
    return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日`;
  }

  function pad(num) {
    return num.toString().padStart(2, "0");
  }

  function slugify(value) {
    return String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
})();
