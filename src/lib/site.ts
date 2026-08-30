export const SITE = {
  name: "ハシビロ工業 GitHub",
  origin: "https://github.hsbl-ko-gyo.com",
  description:
    "ハシビロ工業で作った電子工作、基板設計ツール、ブラウザツール、Web作品をまとめたGitHub作品一覧です。",
  githubProfile: "https://github.com/HSBL-ko-gyo",
  parentSite: "https://sites.google.com/view/hsbl-industrial-hp/home",
} as const;

export const CATEGORIES = {
  "browser-tool": {
    label: "ブラウザツール",
    description: "インストールなし。ブラウザだけで動く小物。",
  },
  "browser-extension": {
    label: "ブラウザ拡張",
    description: "普段使うWebサービスへ、足りない操作を少し足すもの。",
  },
  "electronics-tool": {
    label: "電子回路・CAD支援",
    description: "KiCadや部品データまわり。基板設計で自分が欲しかったもの。",
  },
  "web-app": {
    label: "Webアプリ",
    description: "ブラウザで動く、少し大きめのもの。",
  },
  "web-art": {
    label: "Web作品",
    description: "役に立つとは限らない、眺めたり触ったりするもの。",
  },
  "hardware-software": {
    label: "電子工作・連携ソフト",
    description: "基板や実機とソフトを一緒に作ったもの。",
  },
  app: {
    label: "アプリ",
    description: "スマホやPC向け。試作中のものも含みます。",
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
