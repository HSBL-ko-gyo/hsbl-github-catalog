---
title: HSBL-S200-01 RGB LED bottom
slug: hsbl-s200-01-rgb-led-bottom
repo: HSBL-S200-01
summary: M5Stack CoreS3 / CoreS3 SEの底面へ4個のRGB LEDと光拡散部を追加する拡張ハードウェア。
description: M5Stack CoreS3の底面へ4個のRGB LEDを追加するハードウェア
category: hardware-software
tags: [M5Stack, CoreS3, RGB LED, NeoPixel, 3Dデータ]
status: public
draft: false
featured: false
createdYear: 2024
links:
  github: https://github.com/HSBL-ko-gyo/HSBL-S200-01
  shop: https://www.switch-science.com/products/9815
seoTitle: M5Stack CoreS3へRGB LEDを追加するHSBL-S200-01 | ハシビロ工業 GitHub
seoDescription: M5Stack CoreS3 / SEの底面へ4個のRGB LEDを追加するハードウェア。組み立て、回路図、光拡散部3Dデータ、Arduinoサンプルを公開しています。
searchIntents: [M5Stack CoreS3 RGB LED 底面, CoreS3 NeoPixel 拡張]
repoCreatedAt: "2024-07-20T12:58:46Z"
repoUpdatedAt: "2025-05-05T15:18:46Z"
repoPushedAt: "2024-10-06T09:24:48Z"
primaryLanguage: null
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/HSBL-S200-01
  - https://github.com/HSBL-ko-gyo/HSBL-S200-01/blob/main/README.md
  - https://www.switch-science.com/products/9815
---

## 何ができるか

M5Stack CoreS3またはCoreS3 SEの底面に、4個のRGB LEDと透明な光拡散部を追加します。Arduinoから各LEDの色を順に制御できます。

## こんな時に使う

CoreS3の動作状態を底面の光で表したい時や、筐体の下へカラーイルミネーションを追加したい時に使える拡張ハードウェアです。

## 主な機能

- CoreS3 / CoreS3 SE底面への4灯RGB LED追加
- 光拡散部の3Dデータ公開
- 回路図の公開
- Adafruit NeoPixelとM5UnifiedによるArduinoサンプル

## 技術・構成

RGB LED基板、SLA樹脂製の光拡散部、固定ネジで構成されています。公開サンプルでは信号ピン5と4個のNeoPixelを設定し、CoreS3底面の5V出力のために `M5.begin()` を呼びます。

## 公開先または使い方

[HSBL-S200-01の販売ページをスイッチサイエンスで見る](https://www.switch-science.com/products/9815)。組み立て時は光拡散部の上下マークを確認します。

## GitHubで見る

[HSBL-S200-01の組み立て、回路図、3DデータをGitHubで見る](https://github.com/HSBL-ko-gyo/HSBL-S200-01)。
