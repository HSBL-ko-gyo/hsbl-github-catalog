---
title: アニメーションGIF分解ツール
slug: gif-splitter
repo: gif-splitter
summary: アニメーションGIFをブラウザ内でフレームごとのPNGへ分解し、個別またはZIPにまとめて保存するWebツール。
description: アニメーションGIFを連番PNGへ分解して保存するWebツール
category: browser-tool
tags: [GIF, PNG, フレーム分解, 連番画像, ZIP]
status: public
draft: false
featured: true
createdYear: 2025
links:
  github: https://github.com/HSBL-ko-gyo/gif-splitter
  app: https://hsbl-ko-gyo.github.io/gif-splitter/
seoTitle: アニメーションGIFをフレームごとのPNGへ分解 | ハシビロ工業 GitHub
seoDescription: GIFアニメーションをブラウザ内で解析し、各フレームをPNGで表示。必要な画像だけ、または全フレームをZIPでまとめて保存できます。
searchIntents: [GIF フレーム 分解 PNG, アニメーションGIF 連番画像 変換]
repoUpdatedAt: "2025-03-22T01:13:04Z"
repoPushedAt: "2025-03-21T11:24:50Z"
primaryLanguage: HTML
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/gif-splitter
  - https://github.com/HSBL-ko-gyo/gif-splitter/blob/main/README.md
  - https://hsbl-ko-gyo.github.io/gif-splitter/
---

## 何ができるか

GIFアニメーションを読み込み、含まれるフレームを一枚ずつPNG画像として取り出せます。処理はクライアントサイドで完結し、専用ソフトやサーバー処理を必要としません。

## こんな時に使う

GIFの途中にある一枚を素材として取り出したい時や、全フレームを連番画像として編集ソフトへ渡したい時に使えます。

## 主な機能

- ドラッグ＆ドロップまたはファイル選択
- 全フレームのPNGプレビュー
- フレーム単位のダウンロード
- 全PNGをZIPへまとめて保存
- ブラウザ内でのGIF解析

## 技術・構成

HTML、CSS、JavaScriptによる静的アプリで、GIF解析にlibgif-js、ZIP作成にJSZip、保存処理にFileSaver.jsを利用しています。

## 公開先または使い方

[アニメーションGIF分解ツールをブラウザで使う](https://hsbl-ko-gyo.github.io/gif-splitter/)。GIFを選択し、表示されたフレームを個別または一括で保存します。

## GitHubで見る

[アニメーションGIF分解ツールのソースと使用ライブラリをGitHubで見る](https://github.com/HSBL-ko-gyo/gif-splitter)。
