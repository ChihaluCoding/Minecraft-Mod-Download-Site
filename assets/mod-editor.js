const modListEl = document.getElementById('modList');
const addModBtn = document.getElementById('addMod');
const jsonPreviewEl = document.getElementById('jsonPreview');
const jsPreviewEl = document.getElementById('jsPreview');
const downloadJsonBtn = document.getElementById('downloadJson');
const downloadJsBtn = document.getElementById('downloadJs');
const copyJsonBtn = document.getElementById('copyJson');
const copyJsBtn = document.getElementById('copyJs');
const statusEl = document.getElementById('status');
const importInput = document.getElementById('importFile');
const loadCurrentBtn = document.getElementById('loadCurrent');
const modCountBadge = document.getElementById('modCount');

let mods = [];

const loaderOptions = ['Fabric', 'Forge', 'Quilt', 'NeoForge', 'Other'];
const environmentOptions = ['client', 'server', 'client_server'];

function createEmptyMod() {
  return {
    slug: '',
    name: { ja: '', en: '' },
    summary: { ja: '', en: '' },
    description: { ja: '', en: '' },
    loader: '',
    minecraftVersion: '',
    version: '',
    fileSize: '',
    releaseDate: '',
    tags: [],
    environment: '',
    image: '',
    requirements: [],
    updatedDate: '',
    changelog: { ja: '', en: '' },
    downloadUrl: '',
    versions: [],
    license: { ja: '', en: '' }
  };
}

function deepTrim(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepTrim(item));
  }

  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = deepTrim(val);
    }
    return result;
  }

  return value;
}

function sanitizeMods() {
  return mods.map((mod) => deepTrim(mod));
}

function updatePreview() {
  const sanitized = sanitizeMods();
  const jsonString = JSON.stringify(sanitized, null, 2);
  jsonPreviewEl.value = jsonString;
  jsPreviewEl.value = `const modData = ${jsonString};\n\nwindow.modData = modData;\n`;
  modCountBadge.textContent = `${mods.length} 件`;
}

function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.dataset.type = type;
  if (message) {
    setTimeout(() => {
      if (statusEl.textContent === message) {
        statusEl.textContent = '';
        delete statusEl.dataset.type;
      }
    }, 4000);
  }
}

function createField(label, value, onInput, options = {}) {
  const wrapper = document.createElement('label');
  wrapper.className = 'field';

  const span = document.createElement('span');
  span.textContent = label;
  wrapper.appendChild(span);

  const { type = 'text', multiline = false, placeholder = '', listId } = options;
  let input;
  if (multiline) {
    input = document.createElement('textarea');
  } else {
    input = document.createElement('input');
    input.type = type;
  }
  input.value = value ?? '';
  input.placeholder = placeholder;
  if (listId) {
    input.setAttribute('list', listId);
  }

  input.addEventListener('input', (event) => {
    onInput(event.target.value);
    updatePreview();
  });

  wrapper.appendChild(input);
  return wrapper;
}

function createLocalizedSection(title, target, onChange) {
  const value = target || { ja: '', en: '' };
  const container = document.createElement('div');
  container.className = 'field-grid';

  const heading = document.createElement('div');
  heading.className = 'section-heading';
  const headingTitle = document.createElement('h3');
  headingTitle.textContent = title;
  heading.appendChild(headingTitle);
  container.appendChild(heading);

  const japaneseField = createField('日本語', value.ja || '', (inputValue) => {
    onChange('ja', inputValue);
  }, { multiline: true });

  const englishField = createField('English', value.en || '', (inputValue) => {
    onChange('en', inputValue);
  }, { multiline: true });

  container.appendChild(japaneseField);
  container.appendChild(englishField);
  return container;
}

function renderTagsSection(container, mod) {
  container.innerHTML = '';
  const heading = document.createElement('div');
  heading.className = 'section-heading';
  const title = document.createElement('h3');
  title.textContent = 'タグ';
  heading.appendChild(title);

  const addButton = document.createElement('button');
  addButton.className = 'button ghost inline';
  addButton.textContent = 'タグを追加';
  addButton.addEventListener('click', () => {
    mod.tags.push('');
    renderTagsSection(container, mod);
    updatePreview();
  });
  heading.appendChild(addButton);
  container.appendChild(heading);

  if (mod.tags.length === 0) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = 'タグがありません。追加してください。';
    container.appendChild(hint);
    return;
  }

  const list = document.createElement('div');
  list.className = 'inline-list';

  mod.tags.forEach((tag, index) => {
    const row = document.createElement('div');
    row.className = 'inline-item';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = tag;
    input.placeholder = '例: survival';
    input.addEventListener('input', (event) => {
      mod.tags[index] = event.target.value;
      updatePreview();
    });

    const actions = document.createElement('div');
    actions.className = 'actions';
    const removeBtn = document.createElement('button');
    removeBtn.className = 'button danger inline';
    removeBtn.type = 'button';
    removeBtn.textContent = '削除';
    removeBtn.addEventListener('click', () => {
      mod.tags.splice(index, 1);
      renderTagsSection(container, mod);
      updatePreview();
    });

    actions.appendChild(removeBtn);
    row.appendChild(input);
    row.appendChild(actions);
    list.appendChild(row);
  });

  container.appendChild(list);
}

function renderRequirementsSection(container, mod) {
  container.innerHTML = '';
  const heading = document.createElement('div');
  heading.className = 'section-heading';
  const title = document.createElement('h3');
  title.textContent = '依存関係';
  heading.appendChild(title);

  const addButton = document.createElement('button');
  addButton.className = 'button ghost inline';
  addButton.textContent = '依存関係を追加';
  addButton.addEventListener('click', () => {
    mod.requirements.push({ name: { ja: '', en: '' }, url: '' });
    renderRequirementsSection(container, mod);
    updatePreview();
  });
  heading.appendChild(addButton);
  container.appendChild(heading);

  if (mod.requirements.length === 0) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = 'Fabric API などの依存関係を追加できます。';
    container.appendChild(hint);
    return;
  }

  const list = document.createElement('div');
  list.className = 'inline-list';

  mod.requirements.forEach((req, index) => {
    const item = document.createElement('div');
    item.className = 'inline-item';

    const grid = document.createElement('div');
    grid.className = 'field-grid two';

    grid.appendChild(
      createField('表示名 (日本語)', req.name?.ja || '', (value) => {
        req.name = req.name || { ja: '', en: '' };
        req.name.ja = value;
      }, { placeholder: 'Fabric API' })
    );

    grid.appendChild(
      createField('表示名 (English)', req.name?.en || '', (value) => {
        req.name = req.name || { ja: '', en: '' };
        req.name.en = value;
      }, { placeholder: 'Fabric API' })
    );

    grid.appendChild(
      createField('URL', req.url || '', (value) => {
        req.url = value;
      }, { placeholder: 'https://example.com' })
    );

    item.appendChild(grid);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const removeBtn = document.createElement('button');
    removeBtn.className = 'button danger inline';
    removeBtn.type = 'button';
    removeBtn.textContent = '削除';
    removeBtn.addEventListener('click', () => {
      mod.requirements.splice(index, 1);
      renderRequirementsSection(container, mod);
      updatePreview();
    });
    actions.appendChild(removeBtn);
    item.appendChild(actions);

    list.appendChild(item);
  });

  container.appendChild(list);
}

function renderVersionsSection(container, mod) {
  container.innerHTML = '';
  const heading = document.createElement('div');
  heading.className = 'section-heading';
  const title = document.createElement('h3');
  title.textContent = 'バージョン履歴';
  heading.appendChild(title);

  const addButton = document.createElement('button');
  addButton.className = 'button ghost inline';
  addButton.textContent = 'バージョンを追加';
  addButton.addEventListener('click', () => {
    mod.versions.push({
      version: '',
      downloadUrl: '',
      releaseDate: '',
      minecraftVersion: '',
      loader: ''
    });
    renderVersionsSection(container, mod);
    updatePreview();
  });
  heading.appendChild(addButton);
  container.appendChild(heading);

  if (mod.versions.length === 0) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = '過去バージョンの情報を追加できます。';
    container.appendChild(hint);
    return;
  }

  const list = document.createElement('div');
  list.className = 'inline-list';

  mod.versions.forEach((ver, index) => {
    const item = document.createElement('div');
    item.className = 'inline-item';

    const grid = document.createElement('div');
    grid.className = 'field-grid two';

    grid.appendChild(
      createField('バージョン', ver.version || '', (value) => {
        ver.version = value;
      }, { placeholder: 'v1.0.0' })
    );

    grid.appendChild(
      createField('対応 Minecraft', ver.minecraftVersion || '', (value) => {
        ver.minecraftVersion = value;
      }, { placeholder: '1.20.4' })
    );

    grid.appendChild(
      createField('ローダー', ver.loader || '', (value) => {
        ver.loader = value;
      }, { placeholder: 'Fabric' })
    );

    grid.appendChild(
      createField('リリース日', ver.releaseDate || '', (value) => {
        ver.releaseDate = value;
      }, { type: 'date' })
    );

    grid.appendChild(
      createField('ダウンロード URL', ver.downloadUrl || '', (value) => {
        ver.downloadUrl = value;
      }, { placeholder: 'assets/downloads/.../file.jar' })
    );

    item.appendChild(grid);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const removeBtn = document.createElement('button');
    removeBtn.className = 'button danger inline';
    removeBtn.type = 'button';
    removeBtn.textContent = '削除';
    removeBtn.addEventListener('click', () => {
      mod.versions.splice(index, 1);
      renderVersionsSection(container, mod);
      updatePreview();
    });
    actions.appendChild(removeBtn);
    item.appendChild(actions);

    list.appendChild(item);
  });

  container.appendChild(list);
}

function createModCard(mod, index) {
  const card = document.createElement('section');
  card.className = 'mod-card';

  mod.name = mod.name || { ja: '', en: '' };
  mod.summary = mod.summary || { ja: '', en: '' };
  mod.description = mod.description || { ja: '', en: '' };
  mod.changelog = mod.changelog || { ja: '', en: '' };
  mod.license = mod.license || { ja: '', en: '' };
  mod.tags = Array.isArray(mod.tags) ? mod.tags : [];
  mod.requirements = Array.isArray(mod.requirements) ? mod.requirements : [];
  mod.versions = Array.isArray(mod.versions) ? mod.versions : [];

  const header = document.createElement('div');
  header.className = 'mod-card__header';
  const title = document.createElement('h2');
  title.className = 'mod-card__title';

  const updateTitle = () => {
    title.textContent = mod.name?.ja || mod.name?.en || mod.slug || `Mod ${index + 1}`;
  };
  updateTitle();

  const removeButton = document.createElement('button');
  removeButton.className = 'button danger inline';
  removeButton.type = 'button';
  removeButton.textContent = 'Mod を削除';
  removeButton.addEventListener('click', () => {
    mods.splice(index, 1);
    renderMods();
    updatePreview();
  });

  header.appendChild(title);
  header.appendChild(removeButton);
  card.appendChild(header);

  const fieldGrid = document.createElement('div');
  fieldGrid.className = 'field-grid two';
  fieldGrid.appendChild(
    createField('スラッグ (URL 用)', mod.slug, (value) => {
      mod.slug = value;
      updateTitle();
    }, { placeholder: 'item-no-loss' })
  );

  fieldGrid.appendChild(
    createField('表示名 (日本語)', mod.name?.ja || '', (value) => {
      mod.name = mod.name || { ja: '', en: '' };
      mod.name.ja = value;
      updateTitle();
    })
  );

  fieldGrid.appendChild(
    createField('表示名 (English)', mod.name?.en || '', (value) => {
      mod.name = mod.name || { ja: '', en: '' };
      mod.name.en = value;
      updateTitle();
    })
  );

  fieldGrid.appendChild(
    createField('ローダー', mod.loader || '', (value) => {
      mod.loader = value;
    }, { placeholder: 'Fabric', listId: 'loaderOptions' })
  );

  fieldGrid.appendChild(
    createField('対応 Minecraft', mod.minecraftVersion || '', (value) => {
      mod.minecraftVersion = value;
    }, { placeholder: '1.20.4' })
  );

  fieldGrid.appendChild(
    createField('最新バージョン', mod.version || '', (value) => {
      mod.version = value;
    }, { placeholder: 'v1.0.0' })
  );

  fieldGrid.appendChild(
    createField('ファイルサイズ', mod.fileSize || '', (value) => {
      mod.fileSize = value;
    }, { placeholder: '1.2 MB' })
  );

  fieldGrid.appendChild(
    createField('リリース日', mod.releaseDate || '', (value) => {
      mod.releaseDate = value;
    }, { type: 'date' })
  );

  fieldGrid.appendChild(
    createField('更新日', mod.updatedDate || '', (value) => {
      mod.updatedDate = value;
    }, { type: 'date' })
  );

  fieldGrid.appendChild(
    createField('稼働環境', mod.environment || '', (value) => {
      mod.environment = value;
    }, { placeholder: 'client_server', listId: 'environmentOptions' })
  );

  fieldGrid.appendChild(
    createField('アイキャッチ画像', mod.image || '', (value) => {
      mod.image = value;
    }, { placeholder: 'assets/images/...' })
  );

  fieldGrid.appendChild(
    createField('ダウンロード URL', mod.downloadUrl || '', (value) => {
      mod.downloadUrl = value;
    }, { placeholder: 'assets/downloads/.../file.jar' })
  );

  card.appendChild(fieldGrid);

  const summarySection = createLocalizedSection('概要', mod.summary, (key, value) => {
    mod.summary = mod.summary || { ja: '', en: '' };
    mod.summary[key] = value;
  });
  card.appendChild(summarySection);

  const descriptionSection = createLocalizedSection('詳細説明', mod.description, (key, value) => {
    mod.description = mod.description || { ja: '', en: '' };
    mod.description[key] = value;
  });
  card.appendChild(descriptionSection);

  const changelogSection = createLocalizedSection('更新情報', mod.changelog, (key, value) => {
    mod.changelog = mod.changelog || { ja: '', en: '' };
    mod.changelog[key] = value;
  });
  card.appendChild(changelogSection);

  const licenseSection = createLocalizedSection('ライセンス / 注意書き', mod.license, (key, value) => {
    mod.license = mod.license || { ja: '', en: '' };
    mod.license[key] = value;
  });
  card.appendChild(licenseSection);

  const tagsSection = document.createElement('div');
  renderTagsSection(tagsSection, mod);
  card.appendChild(tagsSection);

  const requirementsSection = document.createElement('div');
  renderRequirementsSection(requirementsSection, mod);
  card.appendChild(requirementsSection);

  const versionsSection = document.createElement('div');
  renderVersionsSection(versionsSection, mod);
  card.appendChild(versionsSection);

  return card;
}

function renderMods() {
  modListEl.innerHTML = '';
  if (mods.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = 'Mod データがありません。<br />「Mod を追加」から作成してください。';
    modListEl.appendChild(empty);
  } else {
    mods.forEach((mod, index) => {
      const card = createModCard(mod, index);
      modListEl.appendChild(card);
    });
  }
  updatePreview();
}

function downloadFile(filename, content, mime = 'application/json;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

async function loadInitialData() {
  try {
    const response = await fetch('data/mods.json', { cache: 'no-cache' });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        mods = data;
        renderMods();
        showStatus('data/mods.json を読み込みました。', 'success');
        return;
      }
    } else {
      showStatus(`data/mods.json を読み込めませんでした (HTTP ${response.status})。新規作成します。`, 'error');
    }
  } catch (error) {
    console.warn('Could not load data/mods.json', error);
    showStatus('data/mods.json の読み込みに失敗しました。新規作成します。', 'error');
  }
  mods = [];
  renderMods();
}

addModBtn.addEventListener('click', () => {
  mods.push(createEmptyMod());
  renderMods();
  showStatus('新しい Mod フォームを追加しました。', 'success');
});

downloadJsonBtn.addEventListener('click', () => {
  const sanitized = sanitizeMods();
  downloadFile('mods.json', JSON.stringify(sanitized, null, 2));
  showStatus('mods.json をダウンロードしました。', 'success');
});

downloadJsBtn.addEventListener('click', () => {
  const sanitized = sanitizeMods();
  const content = `const modData = ${JSON.stringify(sanitized, null, 2)};\n\nwindow.modData = modData;\n`;
  downloadFile('mods.js', content, 'text/javascript;charset=utf-8');
  showStatus('mods.js をダウンロードしました。', 'success');
});

copyJsonBtn.addEventListener('click', async () => {
  try {
    const sanitized = sanitizeMods();
    await navigator.clipboard.writeText(JSON.stringify(sanitized, null, 2));
    showStatus('JSON をクリップボードにコピーしました。', 'success');
  } catch (error) {
    console.error(error);
    showStatus('コピーに失敗しました。', 'error');
  }
});

copyJsBtn.addEventListener('click', async () => {
  try {
    const sanitized = sanitizeMods();
    const content = `const modData = ${JSON.stringify(sanitized, null, 2)};\n\nwindow.modData = modData;\n`;
    await navigator.clipboard.writeText(content);
    showStatus('mods.js 形式でコピーしました。', 'success');
  } catch (error) {
    console.error(error);
    showStatus('コピーに失敗しました。', 'error');
  }
});

importInput.addEventListener('change', (event) => {
  const [file] = event.target.files || [];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) {
        throw new Error('最上位が配列ではありません');
      }
      mods = parsed;
      renderMods();
      showStatus(`${file.name} を読み込みました。`, 'success');
    } catch (error) {
      console.error(error);
      showStatus('読み込みに失敗しました: ' + error.message, 'error');
    }
  };
  reader.readAsText(file, 'utf-8');
  importInput.value = '';
});

loadCurrentBtn.addEventListener('click', async () => {
  await loadInitialData();
});

window.addEventListener('DOMContentLoaded', async () => {
  const loaderDataList = document.createElement('datalist');
  loaderDataList.id = 'loaderOptions';
  loaderOptions.forEach((option) => {
    const item = document.createElement('option');
    item.value = option;
    loaderDataList.appendChild(item);
  });

  const envDataList = document.createElement('datalist');
  envDataList.id = 'environmentOptions';
  environmentOptions.forEach((option) => {
    const item = document.createElement('option');
    item.value = option;
    envDataList.appendChild(item);
  });

  document.body.appendChild(loaderDataList);
  document.body.appendChild(envDataList);

  await loadInitialData();
});
