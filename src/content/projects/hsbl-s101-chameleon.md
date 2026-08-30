---
title: HSBL-S101 Chameleon
slug: hsbl-s101-chameleon
repo: HSBL-S101
summary: ブラウザからAtomS3へ画像を送り、画面の向きや底面LEDの色と一緒に本体へ保存するツールです。
description: AtomS3へ画像を送って、そのまま表示する
category: hardware-software
tags: [AtomS3, M5Stack, USB, 画像転送, Web Serial, C++]
status: public
draft: false
featured: false
createdYear: 2023
links:
  github: https://github.com/HSBL-ko-gyo/HSBL-S101
  app: https://hsbl-ko-gyo.github.io/HSBL-S101/
  shop: https://sites.google.com/view/hsbl-s100/home
seoTitle: AtomS3へ画像と表示設定を送るHSBL-S101 Chameleon | ハシビロ工業 GitHub
seoDescription: USB接続したAtomS3へWebツールから画像を送り、表示、画面回転、底面LED色を本体ストレージへ保存する公開プロジェクトです。
searchIntents: [AtomS3 画像 転送 Webツール, AtomS3 画面 回転 保存]
repoCreatedAt: "2023-11-25T03:55:48Z"
repoUpdatedAt: "2024-09-28T12:16:49Z"
repoPushedAt: "2024-05-08T08:45:41Z"
primaryLanguage: C++
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/HSBL-S101
  - https://github.com/HSBL-ko-gyo/HSBL-S101/blob/main/README.md
  - https://hsbl-ko-gyo.github.io/HSBL-S101/
---

## 画像をAtomS3へ送る

USBでつないだAtomS3へ、ブラウザから画像を送るツールです。画像を画面へ出すだけでなく、画面の回転値と一緒に内部ストレージへ保存するので、電源を切っても設定が残ります。Chameleon Keyの機能制限版として公開しています。

## Webツールでできること

AtomS3への接続、画像送信、画面回転、対応する底面RGB LEDの色設定ができます。ファームウェアの書き込み入口も同じ公開ページにあります。

## 必要なもの

本体はM5Stack AtomS3です。底面LEDを使う場合はHSBL-S100-01を追加します。ファームウェアはC++で、M5GFX、FS、SPIFFS、Adafruit NeoPixelを使っています。
