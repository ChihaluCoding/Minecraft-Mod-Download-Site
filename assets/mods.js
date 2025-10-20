const modData = [
  {
    slug: "item-no-loss",
    name: { ja: "Item No Loss", en: "Item No Loss" },
    summary: {
      ja: "死亡してもインベントリを失わないサバイバル支援Mod",
      en: "Keep your inventory after death without commands"
    },
    description: {
      ja: "難易度の高い探索中でも安心。座標単位で例外ルールを設定でき、マルチプレイではロールごとの権限制御にも対応します。",
      en: "Stay safe during difficult expeditions. Configure coordinate exceptions and role-based permissions for multiplayer servers."
    },
    loader: "Fabric",
    minecraftVersion: "1.20.4",
    version: "v1.0.0",
    fileSize: "1.1 MB",
    releaseDate: "2025-10-20",
    tags: ["survival", "quality_of_life"],
    environment: "client_server",
    image: "assets/images/item-no-loss.gif",
    requirements: [
      { name: { ja: "Fabric API", en: "Fabric API" }, url: "https://modrinth.com/mod/fabric-api" }
    ],
    changelog: {
      ja: "初回リリース。死亡時のインベントリ保持と経験値復旧オプションを追加。",
      en: "Initial release with inventory retention and optional XP recovery toggles."
    },
    downloadUrl: "assets/Mods/itemnoloss/itemsnoloss-1.0.0.jar",
    license: {
      ja: "二次配布は禁止。サーバー導入時はクレジット表記をお願いします。",
      en: "No redistribution. Credit required when installing on servers."
    }
  },
  {
    slug: "emerald-tools-plus",
    name: { ja: "Emerald Tools Plus", en: "Emerald Tools Plus" },
    summary: {
      ja: "バニラに自然に溶け込むエメラルド製ツールと防具を追加",
      en: "Vanilla-friendly Emerald tools and armor"
    },
    description: {
      ja: "ゲームバランスを崩さないよう調整されたエメラルド装備を追加します。JSON設定で性能やレシピを柔軟に変更できます。",
      en: "Adds a balanced Emerald gear set that fits into vanilla progression. Tune power levels and recipes via JSON configs."
    },
    loader: "Fabric",
    minecraftVersion: "1.20.1",
    version: "v1.4.0",
    fileSize: "2.4 MB",
    releaseDate: "2024-11-12",
    tags: ["gameplay", "equipment", "lightweight"],
    environment: "client_server",
    image: "assets/images/emerald-tools-plus.gif",
    requirements: [
      { name: { ja: "Fabric API", en: "Fabric API" }, url: "https://modrinth.com/mod/fabric-api" }
    ],
    changelog: {
      ja: "鍛冶型への対応と採掘速度の調整、ローカライズの更新を実施。",
      en: "Adjusted smithing templates, refined mining speed, and refreshed localisation."
    },
    downloadUrl: "downloads/emerald-tools-plus-v1.4.0.jar",
    license: {
      ja: "二次配布は禁止。動画で紹介する場合はクレジット表記を推奨します。",
      en: "No redistribution. Credit is appreciated when featured in videos."
    }
  },
  {
    slug: "mob-music-remixer",
    name: { ja: "Mob Music Remixer", en: "Mob Music Remixer" },
    summary: {
      ja: "ボス戦やダンジョンに合わせてBGMを自動切り替え",
      en: "Dynamic battle music for bosses and dungeons"
    },
    description: {
      ja: "ボス戦や特定エリアに入った際に専用BGMを再生し、戦闘をドラマチックに演出します。音量バランスや再生キューも細かく設定可能です。",
      en: "Trigger custom tracks for bosses and regions to add dramatic flair. Includes volume balancing and queue-based playback."
    },
    loader: "Forge",
    minecraftVersion: "1.19.4",
    version: "v0.9.2-beta",
    fileSize: "18.7 MB",
    releaseDate: "2025-02-03",
    tags: ["audio", "atmosphere"],
    environment: "client",
    image: "assets/images/mob-music-remixer.gif",
    requirements: [
      { name: { ja: "Forge 45.0+", en: "Forge 45.0+" }, url: "https://files.minecraftforge.net/net/minecraftforge/forge/" }
    ],
    changelog: {
      ja: "BGMトラックを4曲追加し、エンダードラゴン戦の音量バランスを調整。",
      en: "Added four ambient tracks and rebalanced the Ender Dragon battle mix."
    },
    downloadUrl: "https://example.com/mob-music-remixer",
    license: {
      ja: "個人利用・配信利用は自由。改変配布は事前連絡をお願いします。",
      en: "Personal and streaming use allowed. Contact me before redistributing modified builds."
    }
  },
  {
    slug: "builders-companion",
    name: { ja: "Builder's Companion", en: "Builder's Companion" },
    summary: {
      ja: "建築作業を効率化する便利機能をひとまとめ",
      en: "Construction utilities rolled into one toolkit"
    },
    description: {
      ja: "ゴーストブロック配置や一括設置、ブロックパレット管理など、建築作業を支援する機能を多数収録。マルチプレイ同期も改善されています。",
      en: "Streamline building with ghost placement, bulk fill tools, palette management, and improved multiplayer syncing."
    },
    loader: "NeoForge",
    minecraftVersion: "1.20.4",
    version: "v2.1.0",
    fileSize: "5.2 MB",
    releaseDate: "2025-05-18",
    tags: ["building", "utility", "quality_of_life"],
    environment: "client_server",
    image: "assets/images/builders-companion.gif",
    requirements: [],
    changelog: {
      ja: "UIスキンの刷新、ホットキーの安定化、マルチプレイ同期の改善を実施。",
      en: "Revamped UI skin, stabilised hotkeys, and improved multiplayer synchronisation."
    },
    downloadUrl: "downloads/builders-companion-v2.1.0.zip",
    license: {
      ja: "改変は自由ですが、配布時は元の配布ページへのリンクを記載してください。",
      en: "Modifications are allowed; please link back to the original distribution page when sharing."
    }
  }
];

window.modData = modData;
