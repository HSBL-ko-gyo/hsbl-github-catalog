---
sourceType: external
title: 晴攻雨読｜現在地に追従する雨雲レーダー
slug: seikou-udoku
summary: 現在地と進行方向に追従し、気象庁の実況・予測を地図に重ねる雨雲レーダーです。時間バーで雨雲の時刻を選べます。
description: 現在地・進行方向に追従する雨雲レーダー
category: web-app
tags: [雨雲レーダー, 気象庁, 現在地, 地図, PWA]
status: public
draft: false
featured: true
createdYear: 2026
links:
  app: https://seikou-udoku.pages.dev/
  article: https://seikou-udoku.pages.dev/about/
thumbnail: /images/projects/seikou-udoku.png
seoTitle: 晴攻雨読｜現在地・進行方向に追従する雨雲レーダー | ハシビロ工業 GitHub
seoDescription: 晴攻雨読は、現在地と進行方向に追従する雨雲レーダーです。気象庁の実況・予測を地図に重ね、時間バーで過去・未来の雨雲を選べます。ナビと並べて見ることを想定したWebアプリです。
searchIntents: [現在地 追従 雨雲レーダー, 進行方向 雨雲 地図, 雨雲レーダー 時間バー, ナビ 画面分割 雨雲]
publishedAt: "2026-09-26T06:56:11Z"
sourceEvidence:
  - https://seikou-udoku.pages.dev/
  - https://seikou-udoku.pages.dev/about/
---

## 現在地に合わせて雨雲を見る

晴攻雨読（せいこううどく）は、気象庁の実況・予測を地図に重ねる雨雲レーダーです。位置情報を許可すると現在地に追従し、進行方向を上にする表示と北を上にする表示を切り替えられます。位置情報を使わず「地図だけ見る」こともできます。

## 時間バーで過去と未来を選ぶ

利用可能な過去15分〜未来60分の雨雲を、時間バーで選んで表示します。「先読みへ」を押すと約5分先の時刻への自動追従に戻ります。雨の強さは「凡例」で8段階の色とmm/hの対応を確認できます。独自の気象予報は行いません。

## ナビと並べて使う想定

Androidでナビアプリと画面分割して使うことを想定したWebアプリで、PWAとしてホーム画面にも追加できます。Android実機での画面分割・実GPS・実走行は未検証です。画面消灯中や完全なバックグラウンドでの継続測位は対象外です。

「この道の先の雨域を調べる」は試験機能です。収録された道路を道なりに進む仮定で雨域との重なりを確認します。外部ナビの経路は受け取らず、通行可能や雨なしを保証するものではありません。制作元と利用範囲は[晴攻雨読について](https://seikou-udoku.pages.dev/about/)にまとめています。
