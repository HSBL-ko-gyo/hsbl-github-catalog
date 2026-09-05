---
title: Google Drive PDF Ctrl+Wheel Zoom
slug: gdrive-pdf-ctrl-wheel-zoom
repo: gdrive-pdf-ctrl-wheel-zoom
summary: ズームボタンまで毎回マウスを動かすのがだるかったので作った、Chrome / Edge用の小さな拡張です。
description: DriveのPDFをCtrl＋ホイールで拡大したい
category: browser-extension
tags: [Google Drive, PDF, ズーム, Chrome, Edge]
status: beta
draft: false
featured: true
createdYear: 2026
links:
  github: https://github.com/HSBL-ko-gyo/gdrive-pdf-ctrl-wheel-zoom
  release: https://github.com/HSBL-ko-gyo/gdrive-pdf-ctrl-wheel-zoom/releases/tag/v0.1.0
  protopedia: https://protopedia.net/prototype/9618
seoTitle: Google Drive PDFをCtrl＋ホイールで拡大する拡張機能 | ハシビロ工業 GitHub
seoDescription: Google DriveのPDFプレビューでCtrl＋マウスホイールを拡大・縮小へ割り当てる、Chrome / Edge向けManifest V3拡張機能です。
searchIntents: [Google Drive PDF Ctrl ホイール 拡大, Drive PDF ズーム 拡張機能]
repoCreatedAt: "2026-08-20T04:27:01Z"
repoUpdatedAt: "2026-08-20T04:27:15Z"
repoPushedAt: "2026-08-20T04:27:21Z"
primaryLanguage: JavaScript
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/gdrive-pdf-ctrl-wheel-zoom
  - https://github.com/HSBL-ko-gyo/gdrive-pdf-ctrl-wheel-zoom/blob/main/README.md
  - https://github.com/HSBL-ko-gyo/gdrive-pdf-ctrl-wheel-zoom/releases/tag/v0.1.0
  - https://protopedia.net/prototype/9618
---

## Ctrl＋ホイールを足す

Google DriveのPDFプレビュー中だけ、`Ctrl + ホイール`を拡大・縮小に変えます。Ctrlを押していない時は、今までどおりスクロールします。PDFプレビューの外では通常のブラウザ操作のままです。

## 使い方

Releaseから展開して、ChromeかEdgeの拡張機能画面で読み込みます。まだストア配布はしていません。Manifest V3で、外部通信、解析、データ保存は行いません。

## 中身

DriveにはPDFズーム用の公開APIがないので、画面上のズームボタンを探して押しています。Drive側の画面が変わると直す必要があります。
