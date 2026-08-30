---
title: MD Table Shot
slug: md-table-shot
repo: md-table-shot
summary: noteなどへMarkdownの表を貼ると崩れるので、ブラウザ上で整えてPNGにする道具です。
description: Markdownの表を、そのままPNGにする
category: browser-tool
tags: [Markdown, 表, PNG, 画像書き出し, ブラウザ]
status: public
draft: false
featured: true
createdYear: 2026
links:
  github: https://github.com/HSBL-ko-gyo/md-table-shot
  app: https://hsbl-ko-gyo.github.io/md-table-shot/
seoTitle: Markdownの表をPNG画像へ変換する MD Table Shot | ハシビロ工業 GitHub
seoDescription: Markdownの表をnoteやブログへ貼れるPNG画像に変換。配置、装飾、背景、解像度を調整でき、入力データはブラウザ内で処理します。
searchIntents: [Markdown 表 PNG 変換, note 表 画像化]
repoCreatedAt: "2026-08-07T18:28:13Z"
repoUpdatedAt: "2026-08-07T18:39:30Z"
repoPushedAt: "2026-08-07T18:39:25Z"
primaryLanguage: TypeScript
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/md-table-shot
  - https://github.com/HSBL-ko-gyo/md-table-shot/blob/main/README.md
  - https://hsbl-ko-gyo.github.io/md-table-shot/
---

## 表が崩れるのでPNGへ

noteなどへMarkdownの表を貼ると、表にならなかったり見た目が崩れたりします。そこで、GFM形式の表をブラウザで整え、貼り付けやすいPNGへ変えるようにしました。入力したMarkdownは外部サーバーへ送りません。

## できること

左右・中央の寄せ方、太字、斜体、取り消し線、インラインコードをプレビューできます。画像は1倍・2倍・3倍、白背景・透過背景から選べます。文字サイズ、セル余白、表の最大幅も調整できます。

## コピーできない時

対応ブラウザではPNGをクリップボードへコピーできます。`ClipboardItem`やHTTPSに対応していない環境では、PNGファイルとして保存してください。
