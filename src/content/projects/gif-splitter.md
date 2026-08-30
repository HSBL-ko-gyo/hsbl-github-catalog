---
title: アニメーションGIF分解ツール
slug: gif-splitter
repo: gif-splitter
summary: GIFアニメの途中にある一枚が欲しい時、ブラウザで全フレームをPNGへばらす道具です。まとめてZIPにもできます。
description: アニメーションGIFを、PNGへばらす
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
repoCreatedAt: "2025-03-21T11:10:34Z"
repoUpdatedAt: "2025-03-22T01:13:04Z"
repoPushedAt: "2025-03-21T11:24:50Z"
primaryLanguage: HTML
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/gif-splitter
  - https://github.com/HSBL-ko-gyo/gif-splitter/blob/main/README.md
  - https://hsbl-ko-gyo.github.io/gif-splitter/
---

## GIFを一枚ずつ取り出す

アニメーションGIFを読み込み、中に入っているフレームを一枚ずつPNGで表示します。途中の一枚だけ欲しい時は個別保存、全部欲しい時はZIPでまとめて保存できます。

## 使い方

GIFをドラッグ＆ドロップするか、ファイル選択で開きます。処理はブラウザ内で完結するので、画像を変換サーバーへ送る必要はありません。

## 中身

HTML、CSS、JavaScriptで作っています。GIFの解析はlibgif-js、ZIP作成はJSZip、保存はFileSaver.jsです。
