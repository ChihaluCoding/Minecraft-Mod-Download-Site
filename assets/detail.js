(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("mod-detail");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    const mods = Array.isArray(window.modData) ? window.modData : [];
    const mod = mods.find((entry) => (entry.slug || slugify(entry.name)) === slug);

    if (!mod) {
      renderNotFound(container);
      return;
    }

    renderHero(mod);
    renderDetail(container, mod);
  });

  function renderHero(mod) {
    const titleEl = document.getElementById("mod-detail-title");
    const summaryEl = document.getElementById("mod-detail-summary");
    const loaderEl = document.getElementById("mod-detail-loader");
    const downloadEl = document.getElementById("mod-detail-download");

    if (titleEl) {
      titleEl.textContent = mod.name ?? "Mod Detail";
    }

    if (summaryEl) {
      summaryEl.textContent = mod.summary || mod.description || "";
    }

    if (loaderEl) {
      loaderEl.textContent = mod.loader ? `${mod.loader} / ${mod.environment ?? "環境不明"}` : "Mod Detail";
    }

    if (downloadEl) {
      if (mod.downloadUrl) {
        downloadEl.href = mod.downloadUrl;
        downloadEl.textContent = "ダウンロード";
        downloadEl.classList.remove("is-disabled");
      } else {
        downloadEl.href = "#";
        downloadEl.textContent = "ダウンロード情報なし";
        downloadEl.classList.add("is-disabled");
      }
    }

    document.title = `${mod.name} | My Minecraft Mods`;
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
      img.alt = `${mod.name} のプレビュー画像`;
      img.loading = "lazy";
      img.decoding = "async";
      media.appendChild(img);

      wrapper.appendChild(media);
    }

    const body = document.createElement("div");
    body.className = "mod-detail__body";

    body.appendChild(buildMeta(mod));

    if (mod.description) {
      const desc = document.createElement("div");
      desc.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = "概要";
      desc.appendChild(heading);

      splitParagraphs(mod.description).forEach((paragraph) => {
        const p = document.createElement("p");
        p.textContent = paragraph;
        desc.appendChild(p);
      });

      body.appendChild(desc);
    }

    if (mod.changelog) {
      const change = document.createElement("div");
      change.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = "最新の更新内容";
      change.appendChild(heading);

      const p = document.createElement("p");
      p.textContent = mod.changelog;
      change.appendChild(p);

      body.appendChild(change);
    }

    if (Array.isArray(mod.tags) && mod.tags.length) {
      const tagsSection = document.createElement("div");
      tagsSection.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = "タグ";
      tagsSection.appendChild(heading);

      const list = document.createElement("div");
      list.className = "mod-card__tags";
      mod.tags.forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "mod-card__tag";
        chip.textContent = tag;
        list.appendChild(chip);
      });

      tagsSection.appendChild(list);
      body.appendChild(tagsSection);
    }

    if (Array.isArray(mod.requirements) && mod.requirements.length) {
      const req = document.createElement("div");
      req.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = "前提Mod / 依存関係";
      req.appendChild(heading);

      const list = document.createElement("ul");
      list.className = "mod-detail__list";

      mod.requirements.forEach((entry) => {
        const item = document.createElement("li");
        if (entry?.url) {
          const link = document.createElement("a");
          link.href = entry.url;
          link.target = "_blank";
          link.rel = "noopener";
          link.textContent = entry.name ?? entry.url;
          item.appendChild(link);
        } else if (entry?.name) {
          item.textContent = entry.name;
        } else {
          item.textContent = String(entry ?? "");
        }
        list.appendChild(item);
      });

      req.appendChild(list);
      body.appendChild(req);
    }

    if (mod.license) {
      const license = document.createElement("div");
      license.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = "利用条件 / ライセンス";
      license.appendChild(heading);

      const p = document.createElement("p");
      p.textContent = mod.license;
      license.appendChild(p);

      body.appendChild(license);
    }

    if (mod.downloadUrl) {
      const downloads = document.createElement("div");
      downloads.className = "mod-detail__section";

      const heading = document.createElement("h2");
      heading.textContent = "ダウンロード";
      downloads.appendChild(heading);

      const link = document.createElement("a");
      link.className = "button button--primary";
      link.href = mod.downloadUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = `${mod.version ?? ""} をダウンロード`.trim();
      downloads.appendChild(link);

      body.appendChild(downloads);
    }

    wrapper.appendChild(body);
    container.appendChild(wrapper);
  }

  function buildMeta(mod) {
    const entries = [
      { label: "対応Minecraft", value: mod.minecraftVersion },
      { label: "バージョン", value: mod.version },
      { label: "ローダー", value: mod.loader },
      { label: "環境", value: mod.environment },
      { label: "ファイルサイズ", value: mod.fileSize },
      { label: "公開日", value: formatDate(mod.releaseDate) }
    ].filter((entry) => Boolean(entry.value));

    if (!entries.length) {
      return null;
    }

    const meta = document.createElement("div");
    meta.className = "mod-detail__meta";

    entries.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "mod-detail__meta-row";

      const label = document.createElement("span");
      label.className = "mod-detail__meta-label";
      label.textContent = entry.label;

      const value = document.createElement("span");
      value.className = "mod-detail__meta-value";
      value.textContent = entry.value;

      row.appendChild(label);
      row.appendChild(value);
      meta.appendChild(row);
    });

    return meta;
  }

  function renderNotFound(container) {
    const titleEl = document.getElementById("mod-detail-title");
    const summaryEl = document.getElementById("mod-detail-summary");
    const downloadEl = document.getElementById("mod-detail-download");

    if (titleEl) titleEl.textContent = "Modが見つかりません";
    if (summaryEl) summaryEl.textContent = "指定されたModは存在しないか、非公開になっています。";
    if (downloadEl) {
      downloadEl.textContent = "ダウンロード不可";
      downloadEl.classList.add("is-disabled");
      downloadEl.href = "#";
    }

    document.title = "Mod Not Found | My Minecraft Mods";

    const message = document.createElement("div");
    message.className = "mod-detail__empty";
    message.innerHTML = `<p>Modが見つかりませんでした。<a href="index.html#mods">Mod一覧</a>に戻って別のModを探してください。</p>`;

    container.textContent = "";
    container.appendChild(message);
  }

  function splitParagraphs(text) {
    return String(text)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月${String(
      date.getDate()
    ).padStart(2, "0")}日`;
  }

  function slugify(value) {
    return String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
})();
