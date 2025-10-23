(() => {
  let activeMod = null;
  let detailContainer = null;
  let downloadModal = null;
  let lastFocusedElement = null;
  const downloadState = {
    mod: null,
    entries: [],
    currentVersion: "",
    currentLoader: ""
  };

  const TEXT = {
  "detail.hero.download": "\u30b5\u30f3\u30d7\u30eb\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9",
  "detail.hero.downloadUnavailable": "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u4e0d\u53ef",
  "detail.hero.back": "Mod\u4e00\u89a7",
  "detail.overview": "\u6982\u8981",
  "detail.latestChanges": "\u6700\u65b0\u306e\u5909\u66f4\u70b9",
  "detail.dependencies": "\u4f9d\u5b58\u95a2\u4fc2",
  "detail.license": "\u30e9\u30a4\u30bb\u30f3\u30b9",
  "detail.tags": "\u30bf\u30b0",
  "detail.downloads": "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9",
  "detail.download.previous": "\u904e\u53bb\u30d0\u30fc\u30b8\u30e7\u30f3",
  "detail.download.title": "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u8a2d\u5b9a",
  "detail.download.chooseVersion": "\u30b2\u30fc\u30e0\u30d0\u30fc\u30b8\u30e7\u30f3\u3092\u9078\u629e",
  "detail.download.chooseLoader": "\u30ed\u30fc\u30c0\u30fc\u3092\u9078\u629e",
  "detail.download.cancel": "\u30ad\u30e3\u30f3\u30bb\u30eb",
  "detail.notFound.title": "MOD\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093",
  "detail.notFound.summary": "\u8981\u6c42\u3055\u308c\u305f MOD \u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002",
  "detail.notFound.link": "\u30ab\u30bf\u30ed\u30b0\u306b\u623b\u308b",
  "environment.unknown": "\u672a\u77e5",
  "meta.environment": "\u74b0\u5883",
  "meta.minecraft": "\u30de\u30a4\u30f3\u30af\u30e9\u30d5\u30c8\u306e\u30d0\u30fc\u30b8\u30e7\u30f3",
  "meta.version": "\u30d0\u30fc\u30b8\u30e7\u30f3",
  "meta.releaseDate": "\u30ea\u30ea\u30fc\u30b9\u65e5",
  "meta.updatedDate": "\u66f4\u65b0\u65e5",
  "detail.download.releaseDate": "\u30ea\u30ea\u30fc\u30b9\u65e5",
  "detail.download.latest": "\u6700\u65b0",
  "mods.card.untitled": "\u7121\u984c\u306eMOD"
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

  function safeDate(value) {
    if (!value) return 0;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
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
    detailContainer = document.getElementById("mod-detail");
    if (!detailContainer) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    const mods = Array.isArray(window.modData) ? window.modData : [];
    activeMod = mods.find((entry) => (entry.slug || slugify(localizeText(entry.name))) === slug) ?? null;

    if (!activeMod) {
      renderNotFound(detailContainer);
      return;
    }

    renderHero(activeMod);
    renderDetail(detailContainer, activeMod);

  });

  function renderHero(mod) {
    const titleEl = document.getElementById("mod-detail-title");
    const summaryEl = document.getElementById("mod-detail-summary");
    const loaderEl = document.getElementById("mod-detail-loader");
    const downloadEl = document.getElementById("mod-detail-download");

    const displayName = localizeText(mod.name) || "MOD\u8a73\u7d30";

    if (titleEl) {
      titleEl.textContent = displayName;
    }

    if (summaryEl) {
      summaryEl.textContent = localizeText(mod.summary) || localizeText(mod.description) || "";
    }

    if (loaderEl) {
      const loader = mod.loader || "";
      const environment = mod.environment ? environmentLabel(mod.environment) : environmentLabel('unknown');
      const license = mod.license && (mod.license.name || mod.license.spdx) ? (mod.license.name || mod.license.spdx) : "";
      const parts = [loader || environment, license].filter(Boolean);
      loaderEl.textContent = parts.join(" / ") || environment;
    }

    if (downloadEl) {
      const versions = normalizeVersions(mod);
      const latest = versions.find((entry) => entry.downloadUrl);

      if (latest && latest.downloadUrl) {
        downloadEl.textContent = t("detail.hero.download");
        downloadEl.classList.remove("is-disabled");
        downloadEl.removeAttribute("aria-disabled");
        downloadEl.href = latest.downloadUrl;
        downloadEl.setAttribute("download", "");
        downloadEl.setAttribute("aria-label", `${displayName} ${t("detail.hero.download")}`);
        downloadEl.onclick = null;
      } else {
        downloadEl.textContent = t("detail.hero.downloadUnavailable");
        downloadEl.classList.add("is-disabled");
        downloadEl.setAttribute("aria-disabled", "true");
        downloadEl.removeAttribute("aria-label");
        downloadEl.removeAttribute("download");
        downloadEl.removeAttribute("href");
        downloadEl.onclick = null;
      }
    }

    const backButton = document.querySelector(".hero__actions .hero__cta--ghost");
    if (backButton) {
      backButton.textContent = t("detail.hero.back");
    }

    document.title = `${displayName} | My Minecraft Mods`;

  }

  function renderDetail(container, mod) {
    container.textContent = "";

    const wrapper = document.createElement("div");
    wrapper.className = "mod-detail__content";

    if (mod.image) {
      const media = document.createElement("figure");
      media.className = "mod-detail__media";

      const img = document.createElement("img");
      img.src = mod.image;
      img.alt = `${localizeText(mod.name)} preview`;
      img.loading = "lazy";
      img.decoding = "async";
      media.appendChild(img);

      wrapper.appendChild(media);
    }

    const body = document.createElement("div");
    body.className = "mod-detail__body";

    const meta = buildMeta(mod);
    if (meta) {
      body.appendChild(meta);
    }

    if (mod.description) {
      const section = document.createElement("div");
      section.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = t("detail.overview");
      section.appendChild(heading);

      appendParagraphs(section, mod.description);
      body.appendChild(section);
    }

    if (mod.changelog) {
      const section = document.createElement("div");
      section.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = t("detail.latestChanges");
      section.appendChild(heading);

      appendParagraphs(section, mod.changelog);
      body.appendChild(section);
    }

    if (Array.isArray(mod.tags) && mod.tags.length) {
      const section = document.createElement("div");
      section.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = t("detail.tags");
      section.appendChild(heading);

      const tagsList = document.createElement("div");
      tagsList.className = "mod-card__tags";
      mod.tags.forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "mod-card__tag";
        chip.textContent = tagLabel(tag);
        tagsList.appendChild(chip);
      });
      section.appendChild(tagsList);

      body.appendChild(section);
    }

    if (Array.isArray(mod.requirements) && mod.requirements.length) {
      const section = document.createElement("div");
      section.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = t("detail.dependencies");
      section.appendChild(heading);

      const list = document.createElement("ul");
      list.className = "mod-detail__list";

      mod.requirements.forEach((entry) => {
        const item = document.createElement("li");
        if (entry?.url) {
          const link = document.createElement("a");
          link.href = entry.url;
          link.target = "_blank";
          link.rel = "noopener";
          link.textContent = localizeText(entry.name);
          item.appendChild(link);
        } else if (entry?.name) {
          item.textContent = localizeText(entry.name);
        }
        list.appendChild(item);
      });

      section.appendChild(list);
      body.appendChild(section);
    }

    if (mod.license) {
      const section = document.createElement("div");
      section.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = t("detail.license");
      section.appendChild(heading);

      const link = document.createElement("a");
      link.href = "https://chihalucoding.github.io/Minecraft-Mod-License/";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Chihalu-License";

      const paragraph = document.createElement("p");
      paragraph.appendChild(link);
      section.appendChild(paragraph);

      body.appendChild(section);
    }

    const versions = normalizeVersions(mod);
    if (versions.length) {
      const section = document.createElement("div");
      section.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = t("detail.downloads");
      section.appendChild(heading);

      const latest = versions[0];
      if (latest) {
        const latestContainer = document.createElement("div");
        latestContainer.className = "mod-detail__download-list mod-detail__download-list--single";
        latestContainer.appendChild(createDownloadRow(mod, latest, true));
        section.appendChild(latestContainer);
      }

      if (versions.length > 1) {
        const wrapper = document.createElement("details");
        wrapper.className = "mod-detail__versions";

        const summary = document.createElement("summary");
        summary.textContent = t("detail.download.previous");
        wrapper.appendChild(summary);

        const list = document.createElement("div");
        list.className = "mod-detail__download-list";

        versions.slice(1).forEach((entry) => {
          list.appendChild(createDownloadRow(mod, entry, false));
        });

        wrapper.appendChild(list);
        section.appendChild(wrapper);
      }

      body.appendChild(section);
    }

    wrapper.appendChild(body);
    container.appendChild(wrapper);
  }

  function buildMeta(mod) {
    const entries = [
      mod.minecraftVersion ? { label: "meta.minecraft", value: mod.minecraftVersion } : null,
      mod.version ? { label: "meta.version", value: mod.version } : null,
      mod.loader ? { label: "meta.environment", value: `${mod.loader}` } : null,
      mod.environment ? { label: "environment", value: mod.environment } : null,
      mod.releaseDate ? { label: "meta.releaseDate", value: formatDate(mod.releaseDate) } : null,
      mod.updatedDate ? { label: "meta.updatedDate", value: formatDate(mod.updatedDate) } : null
    ].filter(Boolean);

    if (!entries.length) {
      return null;
    }

    const meta = document.createElement("div");
    meta.className = "mod-detail__meta";

    entries.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "mod-detail__meta-row";

      const label = document.createElement("span");
      if (entry.label === "environment") {
        label.className = "mod-detail__meta-label";
        label.textContent = t("meta.environment");

        const value = document.createElement("span");
        value.className = "mod-detail__meta-value";
        value.textContent = environmentLabel(entry.value);

        row.appendChild(label);
        row.appendChild(value);
      } else {
        label.className = "mod-detail__meta-label";
        label.textContent = t(entry.label);

        const value = document.createElement("span");
        value.className = "mod-detail__meta-value";
        value.textContent = entry.value;

        row.appendChild(label);
        row.appendChild(value);
      }

      meta.appendChild(row);
    });

    return meta;
  }

  function renderNotFound(container) {
    if (container) {
      container.textContent = "";
      const message = document.createElement("div");
      message.className = "mod-detail__empty";
      message.innerHTML = `<p>${t("detail.notFound.summary")} <a href="mods.html">${t("detail.notFound.link")}</a></p>`;
      container.appendChild(message);
    }

    const titleEl = document.getElementById("mod-detail-title");
    const summaryEl = document.getElementById("mod-detail-summary");
    const downloadEl = document.getElementById("mod-detail-download");

    if (titleEl) titleEl.textContent = t("detail.notFound.title");
    if (summaryEl) summaryEl.textContent = t("detail.notFound.summary");
    if (downloadEl) {
      downloadEl.textContent = t("detail.hero.downloadUnavailable");
      downloadEl.classList.add("is-disabled");
      downloadEl.setAttribute("aria-disabled", "true");
      downloadEl.removeAttribute("aria-label");
      downloadEl.removeAttribute("download");
      downloadEl.removeAttribute("href");
      downloadEl.onclick = null;
    }

    const backButton = document.querySelector(".hero__actions .hero__cta--ghost");
    if (backButton) {
      backButton.textContent = t("detail.hero.back");
    }

    document.title = "Mod\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093 | My Minecraft Mods";

  }

  function appendParagraphs(section, text) {
    const localizedText = localizeText(text);
    const lines = String(localizedText)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      const p = document.createElement("p");
      p.textContent = localizedText;
      section.appendChild(p);
      return;
    }

    lines.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      section.appendChild(p);
    });
  }

  function slugify(value) {
    return String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function openDownloadModal(mod, initial = {}) {
    if (!mod) return;

    const modal = ensureDownloadModal();
    const versionSelect = modal.querySelector("[data-download-version]");
    const loaderSelect = modal.querySelector("[data-download-loader]");
    const confirmButton = modal.querySelector("[data-download-confirm]");
    const titleEl = modal.querySelector(".download-modal__title");

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    downloadState.mod = mod;
    downloadState.entries = normalizeVersions(mod);

    const versions = uniqueVersions(downloadState.entries);
    downloadState.currentVersion = setVersionOptions(versionSelect, versions, initial.version);

    const loaders = uniqueLoadersForVersion(downloadState.entries, downloadState.currentVersion);
    downloadState.currentLoader = setLoaderOptions(loaderSelect, loaders, initial.loader ?? mod.loader ?? "");

    if (versionSelect) {
      versionSelect.disabled = versions.length <= 1;
      versionSelect.onchange = () => {
        downloadState.currentVersion = versionSelect.value;
        const nextLoaders = uniqueLoadersForVersion(downloadState.entries, downloadState.currentVersion);
        downloadState.currentLoader = setLoaderOptions(loaderSelect, nextLoaders, downloadState.currentLoader);
        if (loaderSelect) {
          loaderSelect.disabled = nextLoaders.length <= 1;
        }
        updateConfirmButton();
      };
    }

    if (loaderSelect) {
      loaderSelect.disabled = loaders.length <= 1;
      loaderSelect.onchange = () => {
        downloadState.currentLoader = loaderSelect.value;
        updateConfirmButton();
      };
    }

    if (confirmButton) {
      confirmButton.onclick = () => {
        const entry = findDownloadEntry(downloadState.entries, downloadState.currentVersion, downloadState.currentLoader);
        if (entry?.downloadUrl) {
          closeDownloadModal();
          window.location.href = entry.downloadUrl;
        }
      };
    }

    if (titleEl) {
      titleEl.textContent = `${localizeText(mod.name)} - ${t("detail.download.title")}`;
    }

    updateConfirmButton();

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-modal-open");
    requestAnimationFrame(() => {
      modal.classList.add("is-visible");
    });

    const focusTarget =
      (versionSelect && !versionSelect.disabled && versionSelect.options.length) ? versionSelect :
      (loaderSelect && !loaderSelect.disabled && loaderSelect.options.length ? loaderSelect : confirmButton);
    if (focusTarget && typeof focusTarget.focus === "function") {
      focusTarget.focus();
    }

    function updateConfirmButton() {
      if (!confirmButton) return;
      const entry = findDownloadEntry(downloadState.entries, downloadState.currentVersion, downloadState.currentLoader);
      confirmButton.disabled = !entry || !entry.downloadUrl;
    }
  }

  function ensureDownloadModal() {
    if (downloadModal) return downloadModal;

    downloadModal = document.createElement("div");
    downloadModal.className = "download-modal";
    downloadModal.hidden = true;
    downloadModal.setAttribute("aria-hidden", "true");
    downloadModal.innerHTML = `
      <div class="download-modal__backdrop" data-download-dismiss></div>
      <div class="download-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="download-modal-title">
        <button type="button" class="download-modal__close" data-download-dismiss aria-label="${t("detail.download.cancel")}">×</button>
        <h2 class="download-modal__title" id="download-modal-title">${t("detail.download.title")}</h2>
        <div class="download-modal__fields">
          <label class="download-modal__field">
            <span>${t("detail.download.chooseVersion")}</span>
            <select data-download-version></select>
          </label>
          <label class="download-modal__field">
            <span>${t("detail.download.chooseLoader")}</span>
            <select data-download-loader></select>
          </label>
        </div>
        <div class="download-modal__actions">
          <button type="button" class="button button--secondary" data-download-dismiss>${t("detail.download.cancel")}</button>
          <button type="button" class="button button--primary" data-download-confirm>${t("detail.hero.download")}</button>
        </div>
      </div>
    `;

    document.body.appendChild(downloadModal);

    const dialog = downloadModal.querySelector(".download-modal__dialog");
    if (dialog) {
      dialog.addEventListener("click", (event) => event.stopPropagation());
    }

    downloadModal.querySelectorAll("[data-download-dismiss]").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeDownloadModal();
      });
    });

    return downloadModal;
  }

  function closeDownloadModal() {
    if (!downloadModal || downloadModal.hidden) return;

    downloadModal.classList.remove("is-visible");
    downloadModal.hidden = true;
    downloadModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-modal-open");

    downloadState.mod = null;
    downloadState.entries = [];
    downloadState.currentVersion = "";
    downloadState.currentLoader = "";

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function uniqueVersions(entries) {
    const seen = new Map();

    entries.forEach((entry) => {
      const value = entry.minecraftVersion ?? entry.version ?? "";
      const key = normalizeValue(value);
      if (!seen.has(key)) {
        let label = value;
        if (entry.minecraftVersion && entry.version) {
          label = `${entry.minecraftVersion} (${t("meta.version")}: ${entry.version})`;
        } else if (!label) {
          label = t("detail.download.chooseVersion");
        }
        seen.set(key, { value, label });
      }
    });

    return [...seen.values()];
  }

  function uniqueLoadersForVersion(entries, version) {
    const normalizedVersion = normalizeValue(version);
    const seen = new Map();

    entries.forEach((entry) => {
      const entryVersionKey = normalizeValue(entry.minecraftVersion ?? entry.version);
      if (normalizedVersion && entryVersionKey !== normalizedVersion) return;
      const loader = entry.loader ?? "";
      const key = normalizeValue(loader);
      if (!seen.has(key)) {
        seen.set(key, loader);
      }
    });

    if (!seen.size) {
      entries.forEach((entry) => {
        const loader = entry.loader ?? "";
        const key = normalizeValue(loader);
        if (!seen.has(key)) {
          seen.set(key, loader);
        }
      });
    }

    const loaders = [...seen.values()];
    return loaders.length ? loaders : [""];
  }

  function setVersionOptions(selectEl, items, desired) {
    if (!selectEl) return "";
    const values = items.map((item) => item.value);
    const resolved = chooseValue(values, desired);
    selectEl.textContent = "";

    if (!items.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = t("detail.download.chooseVersion");
      selectEl.appendChild(option);
      selectEl.value = "";
      return "";
    }

    items.forEach(({ value, label }) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label || value;
      selectEl.appendChild(option);
    });
    selectEl.value = resolved;
    return resolved;
  }

  function setLoaderOptions(selectEl, values, desired) {
    if (!selectEl) return "";
    const resolved = chooseValue(values, desired);
    selectEl.textContent = "";

    if (!values.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = t("detail.download.chooseLoader");
      selectEl.appendChild(option);
      selectEl.value = "";
      return "";
    }

    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value || t("environment.unknown");
      selectEl.appendChild(option);
    });
    selectEl.value = resolved;
    return resolved;
  }

  function chooseValue(values, preferred) {
    if (preferred) {
      const match = values.find((value) => normalizeValue(value) === normalizeValue(preferred));
      if (match != null) return match;
    }
    return values[0] ?? "";
  }

  function findDownloadEntry(entries, version, loader) {
    if (!entries.length) return null;
    const versionKey = normalizeValue(version);
    const loaderKey = normalizeValue(loader);

    let candidate = entries.find((entry) => {
      const entryVersionKey = normalizeValue(entry.minecraftVersion ?? entry.version);
      return entryVersionKey === versionKey && normalizeValue(entry.loader) === loaderKey;
    });

    if (!candidate && versionKey) {
      candidate = entries.find((entry) => normalizeValue(entry.minecraftVersion ?? entry.version) === versionKey);
    }

    if (!candidate && loaderKey) {
      candidate = entries.find((entry) => normalizeValue(entry.loader) === loaderKey);
    }

    return candidate ?? entries[0] ?? null;
  }

  function normalizeValue(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && downloadModal && !downloadModal.hidden) {
      event.preventDefault();
      closeDownloadModal();
    }
  });

  function createDownloadRow(mod, entry, isLatest) {
    const item = document.createElement("div");
    item.className = "mod-detail__download-item";

    const info = document.createElement("div");
    info.className = "mod-detail__download-info";

    const title = document.createElement("span");
    title.className = "mod-detail__download-version";
    title.textContent = entry.version ?? t("mods.card.untitled");
    info.appendChild(title);

    if (isLatest) {
      const badge = document.createElement("span");
      badge.className = "mod-detail__download-badge";
      badge.textContent = t("detail.download.latest");
      info.appendChild(badge);
    }

    item.appendChild(info);

    const loaderValue = entry.loader ?? mod.loader ?? "";

    if (entry.downloadUrl) {
      const link = document.createElement("a");
      link.className = isLatest ? "button button--primary" : "button button--secondary";
      link.href = entry.downloadUrl;
      link.setAttribute("download", "");
      link.textContent = t("detail.hero.download");
      if (entry.version) {
        link.setAttribute("aria-label", `${entry.version} ${t("detail.hero.download")}`);
      }
      item.appendChild(link);
    } else {
      const unavailable = document.createElement("span");
      unavailable.className = "mod-detail__download-unavailable";
      unavailable.textContent = t("detail.hero.downloadUnavailable");
      item.appendChild(unavailable);
    }

    return item;
  }

  function normalizeVersions(mod) {
    if (Array.isArray(mod.versions) && mod.versions.length) {
      return [...mod.versions]
        .map((entry) => ({
          version: entry.version ?? mod.version,
          releaseDate: entry.releaseDate ?? mod.releaseDate,
          downloadUrl: entry.downloadUrl ?? mod.downloadUrl,
          minecraftVersion: entry.minecraftVersion ?? mod.minecraftVersion,
          loader: entry.loader ?? mod.loader
        }))
        .sort((a, b) => safeDate(b.releaseDate) - safeDate(a.releaseDate));
    }

    if (mod.downloadUrl) {
      return [
        {
          version: mod.version,
          releaseDate: mod.releaseDate,
          downloadUrl: mod.downloadUrl,
          minecraftVersion: mod.minecraftVersion,
          loader: mod.loader
        }
      ];
    }

    return [];
  }
})();
