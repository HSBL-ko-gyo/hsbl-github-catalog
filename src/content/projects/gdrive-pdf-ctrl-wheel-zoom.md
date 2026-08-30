---
title: Google Drive PDF Ctrl+Wheel Zoom
slug: gdrive-pdf-ctrl-wheel-zoom
repo: gdrive-pdf-ctrl-wheel-zoom
summary: Google DriveのPDFプレビューで、Ctrl＋マウスホイールを既存の拡大・縮小操作へ割り当てるChrome / Edge拡張機能。
description: Google DriveのPDFをCtrl＋ホイールで拡大・縮小するブラウザ拡張
category: browser-extension
tags: [Google Drive, PDF, ズーム, Chrome, Edge]
status: beta
draft: false
featured: true
createdYear: 2026
links:
  github: https://github.com/HSBL-ko-gyo/gdrive-pdf-ctrl-wheel-zoom
  release: https://github.com/HSBL-ko-gyo/gdrive-pdf-ctrl-wheel-zoom/releases/tag/v0.1.0
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
---

## 何ができるか

Google DriveのPDFプレビューを開いている間だけ、`Ctrl + ホイール上` を拡大、`Ctrl + ホイール下` を縮小として扱います。Ctrlを押していないホイール操作は通常のPDFスクロールのままです。

## こんな時に使う

Drive上の図面や資料をマウス中心で確認し、画面のズームボタンまでポインターを移動する回数を減らしたい時に使えます。PDFプレビュー外では通常のブラウザ操作へ干渉しません。

## 主な機能

- Chrome / Edgeで読み込めるManifest V3拡張
- PDFプレビュー内だけでCtrl＋ホイールを捕捉
- Driveの既存ズームボタンを見つけて操作
- 外部通信、解析、データ保存を行わない構成
- 権限とhost permissionsを宣言しない最小構成

## 技術・構成

JavaScriptのcontent scriptがDriveのPDFビューアーを判定し、既存UIを操作します。Google DriveにはPDFズーム用の公開APIがないため、Drive側のDOM変更で調整が必要になる可能性があります。

## 公開先または使い方

[v0.1.0の配布内容をGitHub Releasesで確認する](https://github.com/HSBL-ko-gyo/gdrive-pdf-ctrl-wheel-zoom/releases/tag/v0.1.0)。ChromeまたはEdgeの拡張機能画面でデベロッパーモードを有効にし、展開したフォルダを読み込みます。

## GitHubで見る

[Google Drive PDF Ctrl+Wheel Zoomのインストール手順とソースをGitHubで見る](https://github.com/HSBL-ko-gyo/gdrive-pdf-ctrl-wheel-zoom)。
