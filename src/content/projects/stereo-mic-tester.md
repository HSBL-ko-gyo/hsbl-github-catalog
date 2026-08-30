---
title: ステレオマイク・テスター
slug: stereo-mic-tester
repo: stereo-mic-tester
summary: USBステレオマイクの左右チャンネルを分け、オシロスコープ風の波形でリアルタイム確認するWebツール。
description: USBステレオマイクの左右チャンネル波形を確認するWebツール
category: browser-tool
tags: [USBマイク, ステレオ, 波形, チャンネル確認, Web Audio]
status: public
draft: false
featured: true
createdYear: 2025
links:
  github: https://github.com/HSBL-ko-gyo/stereo-mic-tester
  app: https://hsbl-ko-gyo.github.io/stereo-mic-tester/
seoTitle: USBステレオマイクの左右波形を確認するテスター | ハシビロ工業 GitHub
seoDescription: USBステレオマイクの左右チャンネルを独立した波形で表示。デバイスを切り替えながらChromeやEdge上でリアルタイム確認できます。
searchIntents: [ステレオマイク 左右 波形 テスト, USBマイク チャンネル 確認]
repoCreatedAt: "2025-08-12T15:21:27Z"
repoUpdatedAt: "2025-08-12T16:09:32Z"
repoPushedAt: "2025-08-12T16:09:29Z"
primaryLanguage: HTML
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/stereo-mic-tester
  - https://github.com/HSBL-ko-gyo/stereo-mic-tester/blob/main/README.md
  - https://hsbl-ko-gyo.github.io/stereo-mic-tester/
---

## 何ができるか

USBステレオマイクから入る左右の音声を分離し、それぞれの波形をリアルタイム表示します。入力デバイスを検出し、使用するマイクをブラウザ上で切り替えられます。

## こんな時に使う

ステレオマイクの組み立て後や出荷前に、左右のチャンネルが正しく接続され、両方から信号が入るかを目で確認したい時に向いています。

## 主な機能

- 左右チャンネルの独立表示
- オシロスコープ風のロール波形
- 音声入力デバイスの自動検出と切り替え
- インストール不要のブラウザ動作

## 技術・構成

HTMLを中心にした静的Webツールです。マイク入力を扱うため、ChromeまたはEdgeでページを開き、ブラウザのマイクアクセスを許可する必要があります。

## 公開先または使い方

[ステレオマイク・テスターをブラウザで開く](https://hsbl-ko-gyo.github.io/stereo-mic-tester/)。USBマイクを接続して入力を許可し、左右それぞれの波形を確認します。

## GitHubで見る

[ステレオマイク・テスターのソースと動作条件をGitHubで見る](https://github.com/HSBL-ko-gyo/stereo-mic-tester)。
