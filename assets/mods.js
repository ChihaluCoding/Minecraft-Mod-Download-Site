/**
 * Mod情報のテンプレート。
 * name: Mod名（必須）
 * summary: 一言で魅力が伝わる概要
 * description: 詳細説明（任意）
 * loader: 対応ローダー (Fabric / Forge / NeoForge / Quilt など)
 * minecraftVersion: 対応するMinecraft本体のバージョン
 * version: Modのリリースバージョン
 * fileSize: ファイルサイズ（任意）
 * releaseDate: リリース日。ISO形式 (YYYY-MM-DD) 推奨
 * slug: URLに使う識別子（任意/自動生成してもOK）
 * image: カードに表示するGIF/画像のパス（任意）
 * tags: 表示用タグ（任意）
 * requirements: 依存Modやライブラリへのリンク（URLでもOK）
 * changelog: 変更点を簡潔に書く欄
 * downloadUrl: ダウンロード先URLまたはファイルへの相対パス
 * license: 利用条件やライセンスの概要
 */
const modData = [
  {
    slug: "item-no-loss",
    name: "Item No Loss",
    summary: "死亡後もインベントリのアイテムを失わずに復帰できるサバイバル支援Mod",
    description:
      "探索や建築の最中に事故が起きても安心。座標ごとの例外設定や、マルチプレイ権限ごとの挙動制御にも対応しています。",
    loader: "Fabric",
    minecraftVersion: "1.20.4",
    version: "v1.0.0",
    fileSize: "1.1 MB",
    releaseDate: "2025-10-20",
    tags: ["Survival", "Quality of Life"],
    environment: "両方",
    image: "assets/images/item-no-loss.gif",
    requirements: [
      { name: "Fabric API", url: "https://modrinth.com/mod/fabric-api" }
    ],
    changelog: "初回リリース。死亡時のインベントリ保持と経験値減少の切り替えオプションを追加。",
    downloadUrl: "assets/Mods/itemnoloss/itemsnoloss-1.0.0.jar",
    license: "二次配布禁止・サーバー導入はクレジット表記必須"
  },
  {
    slug: "emerald-tools-plus",
    name: "Emerald Tools Plus",
    summary: "バニラに溶け込むエメラルド製ツール・防具を追加",
    description:
      "原作のバランスを崩さないよう調整されたエメラルド装備セットを追加します。クラフトレシピや性能はJSONデータで簡単に調整可能です。",
    loader: "Fabric",
    minecraftVersion: "1.20.1",
    version: "v1.4.0",
    fileSize: "2.4 MB",
    releaseDate: "2024-11-12",
    tags: ["Gameplay", "Equipment", "Lightweight"],
    environment: "両方",
    image: "assets/images/emerald-tools-plus.gif",
    requirements: [
      { name: "Fabric API", url: "https://modrinth.com/mod/fabric-api" }
    ],
    changelog: "鍛冶型対応、採掘速度バランス調整、言語ファイル刷新。",
    downloadUrl: "downloads/emerald-tools-plus-v1.4.0.jar",
    license: "二次配布禁止・動画利用可（クレジット表記推奨）"
  },
  {
    slug: "mob-music-remixer",
    name: "Mob Music Remixer",
    summary: "モブごとにイベント音楽を切り替え、戦闘を演出",
    description:
      "ボスモブや特定エリアに入った際に専用BGMを再生し、Minecraftのプレイ体験をドラマチックに彩ります。",
    loader: "Forge",
    minecraftVersion: "1.19.4",
    version: "v0.9.2-beta",
    fileSize: "18.7 MB",
    releaseDate: "2025-02-03",
    tags: ["Audio", "Atmosphere"],
    environment: "クライアント",
    image: "assets/images/mob-music-remixer.gif",
    requirements: [
      { name: "Forge 45.0+", url: "https://files.minecraftforge.net/net/minecraftforge/forge/" }
    ],
    changelog: "新規BGMトラックを4曲追加。エンダードラゴン戦時の音量を自動調整。",
    downloadUrl: "https://example.com/mob-music-remixer",
    license: "個人利用・配信利用可／改変配布は要連絡"
  },
  {
    slug: "builders-companion",
    name: "Builder's Companion",
    summary: "建築支援ツールをひとまとめにした便利系Mod",
    description:
      "クリエイティブ・サバイバル双方で役立つ建築補助機能を多数追加。ゴーストブロックや一括設置、ブロックパレット管理などを備えています。",
    loader: "NeoForge",
    minecraftVersion: "1.20.4",
    version: "v2.1.0",
    fileSize: "5.2 MB",
    releaseDate: "2025-05-18",
    tags: ["Building", "Utility", "Quality of Life"],
    environment: "両方",
    image: "assets/images/builders-companion.gif",
    requirements: [],
    changelog: "UIスキンの刷新とホットキー機能の安定化。マルチプレイ同期も改善。",
    downloadUrl: "downloads/builders-companion-v2.1.0.zip",
    license: "改変可／二次配布は配布ページリンク必須"
  }
];

window.modData = modData;
