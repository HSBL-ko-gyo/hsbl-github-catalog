---
title: UNO Q Codex Matrix
slug: uno-q-codex-matrix
repo: unoq-codex-matrix
summary: Codexの処理状態と利用枠の目安を、Arduino UNO Q内蔵8×13 LEDマトリクスへアニメーション表示するローカル連携ソフト。
description: Codexの処理状態をArduino UNO QのLEDマトリクスへ表示する連携ソフト
category: hardware-software
tags: [Arduino UNO Q, Codex, LEDマトリクス, Router Bridge, Python]
status: public
draft: false
featured: true
createdYear: 2026
links:
  github: https://github.com/HSBL-ko-gyo/unoq-codex-matrix
  release: https://github.com/HSBL-ko-gyo/unoq-codex-matrix/releases
seoTitle: Codexの状態をUNO Q LEDマトリクスへ表示 | ハシビロ工業 GitHub
seoDescription: Codex Hooksをローカルで集約し、Arduino UNO Q内蔵8×13 LEDマトリクスへ思考中、テスト中、待機、完了などを表示します。
searchIntents: [Arduino UNO Q Codex LED matrix, Codex status hardware display]
repoUpdatedAt: "2026-08-29T22:50:39Z"
repoPushedAt: "2026-08-29T22:50:34Z"
primaryLanguage: Python
topics: [arduino-router, arduino-uno-q, codex, codex-hooks, embedded, led-matrix, python, rpc, stm32u585]
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/unoq-codex-matrix
  - https://github.com/HSBL-ko-gyo/unoq-codex-matrix/blob/main/README.md
---

## 何ができるか

UNO Q上で動くCodexのライフサイクルイベントをローカルに受け取り、内蔵8×13青色LEDマトリクスへ状態別アニメーションを表示します。思考、読み取り、書き込み、ビルド、テスト、待機、完了などを机上で見分けられます。

## こんな時に使う

Codexへ長い作業を任せて別の作業をしている間、画面を開き続けずに処理状態を把握したい時に使えます。UNO Q本体のLEDマトリクスを物理的なステータス表示器として活用します。

## 主な機能

- Codex Hooksを待たせないfail-openなイベント取得
- 複数セッションの状態集約
- READY、THINKING、TESTING、WAITINGなどのアニメーション
- Codex app-serverから取得できる場合の利用枠バー表示
- CLIによる状態確認、デモ、診断、一時表示

## 技術・構成

UNO QのLinux側ではPythonデーモンがイベントを集約し、Arduino RouterのMessagePack RPCを通じてSTM32U585側のファームウェアへ状態を送ります。MCUが8×13 LEDマトリクスを描画します。プロンプトやファイル内容を保存しないプライバシー境界も文書化されています。

## 公開先または使い方

[UNO Q Codex MatrixのReleaseと導入履歴を見る](https://github.com/HSBL-ko-gyo/unoq-codex-matrix/releases)。UNO Q上でリポジトリを取得し、インストーラーを実行する手順がREADMEにあります。ファームウェア書き込みを含むため、対象実機を確認してから進めます。

## GitHubで見る

[UNO Q Codex Matrixの構成、プライバシー設計、診断手順をGitHubで見る](https://github.com/HSBL-ko-gyo/unoq-codex-matrix)。
