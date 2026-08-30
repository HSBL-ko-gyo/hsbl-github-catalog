---
title: HSBL-S101 Chameleon
slug: hsbl-s101-chameleon
repo: HSBL-S101
summary: Web設定ツールからAtomS3へ画像を送り、表示内容、画面回転、底面LED色を本体へ保存できるハードウェア連携プロジェクト。
description: AtomS3へ画像と表示設定をUSB経由で送るWeb設定ツール
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

## 何ができるか

USB接続したM5Stack AtomS3へブラウザの設定ツールから画像を送り、画面へ表示して本体へ保存します。画面回転と、対応する底面RGB LEDの色も設定できます。

## こんな時に使う

AtomS3の小型画面へ任意の画像を表示し、電源を切った後も同じ表示設定を保持したい時に使えます。Chameleon Keyの機能制限版として公開されています。

## 主な機能

- ブラウザからAtomS3へ接続
- 画像の送信、表示、内部ストレージへの保存
- 画面回転値の保存
- 対応する底面LEDの色設定
- 公開Webツールからのファームウェア書き込み案内

## 技術・構成

AtomS3側のC++ファームウェアとWeb設定ツールで構成されています。ビルドにM5GFX、FS、SPIFFS、Adafruit NeoPixelを使用することがREADMEに示されています。

## 公開先または使い方

[HSBL-S101 ChameleonのWeb設定ツールを開く](https://hsbl-ko-gyo.github.io/HSBL-S101/)。利用にはAtomS3が必要で、底面LED設定には対応ハードウェアを組み合わせます。

## GitHubで見る

[HSBL-S101 Chameleonのファームウェアと必要ハードウェアをGitHubで見る](https://github.com/HSBL-ko-gyo/HSBL-S101)。
