export const SITE = {
  name: "ハシビロ工業 GitHub",
  origin: "https://github.hsbl-ko-gyo.com",
  description: "ハシビロ工業が公開しているブラウザツール、電子工作、個人開発アプリの作品カタログです。",
  githubProfile: "https://github.com/HSBL-ko-gyo",
  parentSite: "https://sites.google.com/view/hsbl-industrial-hp/home",
} as const;

export const CATEGORIES = {
  "browser-tool": {
    label: "ブラウザツール",
    description: "インストールせず、ブラウザから使える小さな道具。",
  },
  "browser-extension": {
    label: "ブラウザ拡張",
    description: "普段使うWebサービスの操作を少し便利にする拡張機能。",
  },
  "electronics-tool": {
    label: "電子回路・CAD支援",
    description: "基板設計や3Dデータ変換を支えるデスクトップツール。",
  },
  "web-app": {
    label: "Webアプリ",
    description: "学習や作業をブラウザ上で進めるアプリケーション。",
  },
  "web-art": {
    label: "Web作品",
    description: "眺めたり触れたりして楽しむ、ブラウザ上の作品。",
  },
  "hardware-software": {
    label: "電子工作・連携ソフト",
    description: "実機とソフトウェアを組み合わせた個人開発作品。",
  },
  app: {
    label: "アプリ",
    description: "スマートフォンやPCで使う実験的なアプリ。",
  },
} as const;

export type CategorySlug = keyof typeof CATEGORIES;

export const STATUS_LABELS = {
  public: "公開中",
  beta: "ベータ",
  development: "開発中",
  archived: "アーカイブ",
} as const;

export function canonicalUrl(pathname: string): string {
  return new URL(pathname, SITE.origin).toString();
}
