(() => {
  let activeMod = null;
  let detailContainer = null;

  const TEXT = {
  "detail.hero.download": "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9",
  "detail.hero.downloadUnavailable": "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u4e0d\u53ef",
  "detail.hero.back": "\u30ab\u30bf\u30ed\u30b0\u306b\u623b\u308b",
  "detail.overview": "\u6982\u8981",
  "detail.latestChanges": "\u6700\u65b0\u306e\u5909\u66f4\u70b9",
  "detail.dependencies": "\u4f9d\u5b58\u95a2\u4fc2",
  "detail.license": "\u30e9\u30a4\u30bb\u30f3\u30b9",
  "detail.tags": "\u30bf\u30b0",
  "detail.downloads": "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9",
  "detail.notFound.title": "MOD\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093",
  "detail.notFound.summary": "\u8981\u6c42\u3055\u308c\u305f MOD \u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002",
  "detail.notFound.link": "\u30ab\u30bf\u30ed\u30b0\u306b\u623b\u308b",
  "environment.unknown": "\u672a\u77e5",
  "meta.environment": "\u74b0\u5883",
  "meta.minecraft": "\u30de\u30a4\u30f3\u30af\u30e9\u30d5\u30c8\u306e\u30d0\u30fc\u30b8\u30e7\u30f3",
  "meta.version": "\u30d0\u30fc\u30b8\u30e7\u30f3",
  "meta.fileSize": "\u30d5\u30a1\u30a4\u30eb\u30b5\u30a4\u30ba",
  "meta.releaseDate": "\u767a\u58f2\u65e5"
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
      loaderEl.textContent = loader ? `${loader} / ${environment}` : environment;
    }

    if (downloadEl) {
      if (mod.downloadUrl) {
        downloadEl.href = mod.downloadUrl;
        downloadEl.textContent = t("detail.hero.download");
        downloadEl.classList.remove("is-disabled");
      } else {
        downloadEl.href = "#";
        downloadEl.textContent = t("detail.hero.downloadUnavailable");
        downloadEl.classList.add("is-disabled");
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

      appendParagraphs(section, mod.license);
      body.appendChild(section);
    }

    if (mod.downloadUrl) {
      const section = document.createElement("div");
      section.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = t("detail.downloads");
      section.appendChild(heading);

      const link = document.createElement("a");
      link.className = "button button--primary";
      link.href = mod.downloadUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = `${mod.version ?? ""} ${t("detail.hero.download")}`.trim();
      section.appendChild(link);

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
      mod.fileSize ? { label: "meta.fileSize", value: mod.fileSize } : null,
      mod.releaseDate ? { label: "meta.releaseDate", value: formatDate(mod.releaseDate) } : null
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
      downloadEl.href = "#";
      downloadEl.classList.add("is-disabled");
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
})();


