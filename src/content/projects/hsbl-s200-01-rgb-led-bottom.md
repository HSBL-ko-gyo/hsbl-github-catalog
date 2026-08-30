---
title: HSBL-S200-01 RGB LED bottom
slug: hsbl-s200-01-rgb-led-bottom
repo: HSBL-S200-01
summary: M5Stack CoreS3 / CoreS3 SEの底へ4個のRGB LEDを足す基板です。透明な光拡散部も一緒に固定します。
description: CoreS3の底面を、4灯のRGB LEDで光らせる
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

## CoreS3の底へ4灯

M5Stack CoreS3 / CoreS3 SEの底面へ、4個のRGB LEDを追加する基板です。透明なSLA樹脂の光拡散部を重ね、付属ネジで本体へ固定します。底面を状態表示やイルミネーションに使えます。

## 組み立てと制御

光拡散部には上下があるので、マークをM5の下側へ合わせます。Arduinoサンプルは信号ピン5、NeoPixel 4個の設定です。CoreS3底面から5Vを出すため、サンプルでは`M5.begin()`を呼んでいます。

## 公開データ

組み立て写真、回路図、光拡散部の3Dデータ、Adafruit NeoPixelとM5Unifiedを使うサンプルを公開しています。完成品はスイッチサイエンスで販売しています。
