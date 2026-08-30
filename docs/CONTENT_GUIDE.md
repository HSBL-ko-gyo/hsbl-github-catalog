# 作品コンテンツガイド

## ファイルと公開判定

作品は `src/content/projects/<slug>.md` に一ファイルずつ置きます。Astro Content Collectionの厳格なスキーマと `npm run validate:content` の両方を通します。

掲載条件:

- ownerが `HSBL-ko-gyo` のpublicリポジトリ
- 非fork、非empty、非archived、明示的除外ではない
- 公開READMEなどから用途と自作性を高い確度で説明できる
- 旧版、ミラー、置き場、内部資料ではない

曖昧な候補はdraftを量産せず、作品ファイルを作らないで発掘レポートへ短い理由を残します。

## 必須frontmatter

```yaml
title: 人が理解できる作品名
slug: stable-lowercase-slug
repo: GitHubの正確なリポジトリ名
summary: カード用の一行説明
description: 用途を含む作品ページH1
category: browser-tool
tags: [用途, 技術]
status: public # public | beta | development | archived
draft: false
featured: false
createdYear: 2026
links:
  github: https://github.com/HSBL-ko-gyo/example
seoTitle: 固有のタイトル | ハシビロ工業 GitHub
seoDescription: 固有の検索説明
searchIntents: [具体的な用途検索]
repoUpdatedAt: "2026-01-01T00:00:00Z"
repoPushedAt: "2026-01-01T00:00:00Z"
primaryLanguage: TypeScript # GitHub未判定ならnull
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/example/blob/main/README.md
```

`links.app`、`links.release`、`links.article`、`links.shop` は公開情報で確認できるHTTPS URLだけを任意で追加します。

## 本文の必須節

この順序で書きます。

1. `何ができるか`
2. `こんな時に使う`
3. `主な機能`
4. `技術・構成`
5. `公開先または使い方`
6. `GitHubで見る`

READMEを丸写しせず、入力、出力、対象環境、解決する不便を利用者の言葉で整理します。確認できない性能、対応環境、実績、価格は書きません。制約や注意が重要な作品では省略しません。

## リンクとSEO

- 「こちら」だけでなく、遷移先と行動が分かるアンカーテキストを使う
- GitHub URLは `https://github.com/HSBL-ko-gyo/<repo>` と完全一致させる
- title、description、H1を作品ごとに固有にする
- 検索語を列挙せず、用途の説明へ自然に含める
- 本番URLが確認できなければ推測せずGitHubだけを案内する
- `draft: true` は公開出力へ一切含めない

## 更新

収集後、`repoUpdatedAt`、`repoPushedAt`、`primaryLanguage`、`topics`、Release / Homepageの事実を同期します。本文を書き直すのは、誤り、リンク切れ、用途不明、READMEとの過度な重複を実質的に改善できる場合だけです。
