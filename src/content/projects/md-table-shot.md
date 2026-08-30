---
title: MD Table Shot
slug: md-table-shot
repo: md-table-shot
summary: Markdownの表を整ったPNG画像に変換し、noteやブログへ貼り付けやすくするブラウザ完結型ツール。
description: Markdownの表をPNG画像へ変換するブラウザツール
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
repoUpdatedAt: "2026-08-07T18:39:30Z"
repoPushedAt: "2026-08-07T18:39:25Z"
primaryLanguage: TypeScript
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/md-table-shot
  - https://github.com/HSBL-ko-gyo/md-table-shot/blob/main/README.md
  - https://hsbl-ko-gyo.github.io/md-table-shot/
---

## 何ができるか

GFM形式のMarkdown tableを読み込み、レイアウトを確認しながらPNG画像へ書き出せます。表のテキストや設定はブラウザ内で処理され、外部サーバーへ送信しない構成です。

## こんな時に使う

noteやブログなど、Markdownの表をそのまま貼り付けにくい場所へ、読みやすい画像として掲載したい時に向いています。クリップボードへ直接コピーできない環境ではPNG保存へ切り替えられます。

## 主な機能

- 左寄せ・中央寄せ・右寄せを含むGFM表のプレビュー
- 太字、斜体、取り消し線、インラインコードの描画
- 1倍・2倍・3倍の解像度、白背景・透過背景の選択
- 文字サイズ、セル余白、表の最大幅の調整
- PNGのクリップボードコピーとダウンロード

## 技術・構成

TypeScriptとViteで作られた静的Webアプリです。PNGコピーには `ClipboardItem` とHTTPSまたはlocalhostのSecure Contextが必要で、非対応ブラウザではファイル保存を利用します。

## 公開先または使い方

[MD Table Shotをブラウザで使う](https://hsbl-ko-gyo.github.io/md-table-shot/)。Markdownの表を入力し、表示と出力設定を整えてからコピーまたは保存します。

## GitHubで見る

[MD Table Shotのソースコードと詳しい対応範囲をGitHubで見る](https://github.com/HSBL-ko-gyo/md-table-shot)。
