---
title: UNO Q Codex Matrix
slug: uno-q-codex-matrix
repo: unoq-codex-matrix
summary: Codexの処理中・待機中と利用枠の目安を、UNO Qの8×13 LEDマトリクスへ出すローカル連携です。画面を見張り続けたくないので作りました。
description: Codexが今何してるか、UNO QのLEDに出す
category: hardware-software
tags: [Arduino UNO Q, Codex, LEDマトリクス, Router Bridge, Python]
status: public
draft: false
featured: true
createdYear: 2026
links:
  github: https://github.com/HSBL-ko-gyo/unoq-codex-matrix
  release: https://github.com/HSBL-ko-gyo/unoq-codex-matrix/releases
  protopedia: https://protopedia.net/prototype/9619
seoTitle: Codexの状態をUNO Q LEDマトリクスへ表示 | ハシビロ工業 GitHub
seoDescription: Codex Hooksをローカルで集約し、Arduino UNO Q内蔵8×13 LEDマトリクスへ思考中、テスト中、待機、完了などを表示します。
searchIntents: [Arduino UNO Q Codex LED matrix, Codex status hardware display]
repoCreatedAt: "2026-08-16T10:43:59Z"
repoUpdatedAt: "2026-09-03T19:11:37Z"
repoPushedAt: "2026-09-03T19:07:21Z"
primaryLanguage: Python
topics:
  [
    arduino-router,
    arduino-uno-q,
    codex,
    codex-hooks,
    embedded,
    led-matrix,
    python,
    rpc,
    stm32u585,
  ]
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/unoq-codex-matrix
  - https://github.com/HSBL-ko-gyo/unoq-codex-matrix/blob/main/README.md
  - https://protopedia.net/prototype/9619
---

## CodexをLEDで見る

Codexが考えている、ファイルを読んでいる、テスト中、入力待ち、終わった、という状態をUNO Qの8×13青色LEDマトリクスへ出します。長い処理の間ずっと画面を見張りたくないので作りました。

## 出しているもの

READY、THINKING、READING、WRITING、BUILDING、TESTING、WAITING、SUCCESSなどを別のアニメーションで表示します。取得できる時は、上の13灯をCodex利用枠の目安にも使います。複数セッションが動いている場合は状態をまとめます。

## 仕組み

UNO QのLinux側でPythonデーモンがHooksを受け、Arduino RouterのMessagePack RPCでSTM32U585側へ送ります。MCUがLEDを描画します。状態確認、デモ、診断、一時表示用のCLIもあります。

## 注意

プロンプト、応答、コマンド、ファイル内容は保存しません。インストール時はMCUファームウェアを書き換えるので、対象がUNO Qであることを確認してから実行します。
