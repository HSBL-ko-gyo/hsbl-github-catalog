---
title: サウナ時計Webアプリ
slug: sauna-clock
repo: Sauna-Clock-WEB-App
summary: サウナの12分計っぽい時計をブラウザへ出し、分針が一周する時間を好きな分数へ変えられます。
description: 12分計っぽい時計を、好きな周回時間で動かす
category: browser-tool
tags: [サウナ, 12分計, アナログ時計, タイマー, JavaScript]
status: public
draft: false
featured: false
createdYear: 2023
links:
  github: https://github.com/HSBL-ko-gyo/Sauna-Clock-WEB-App
  app: https://hsbl-ko-gyo.github.io/Sauna-Clock-WEB-App/
seoTitle: 周回時間を変更できるサウナ12分計風Web時計 | ハシビロ工業 GitHub
seoDescription: サウナで見かける12分計風のアナログ時計をブラウザに表示。入力した分数に合わせて分針の一周時間を変更できます。
searchIntents: [サウナ 12分計 Web, 周回時間 変更 アナログ時計]
repoCreatedAt: "2023-06-18T08:59:31Z"
repoUpdatedAt: "2023-08-23T12:25:40Z"
repoPushedAt: "2023-07-05T14:06:17Z"
primaryLanguage: null
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/Sauna-Clock-WEB-App
  - https://github.com/HSBL-ko-gyo/Sauna-Clock-WEB-App/blob/main/README.md
  - https://hsbl-ko-gyo.github.io/Sauna-Clock-WEB-App/
---

## 12分計をブラウザへ

日本のサウナでよく見る12分計を、ブラウザのcanvasへ描いたものです。青い分針と赤い秒針が動きます。12分固定ではなく、分針が一周する時間を好きな分数へ変えられます。

## 時間の変え方

画面下の入力欄へ一周させたい時間を分単位で入れ、Enterキーを押します。その値に合わせて分針の速度が変わります。定期的な時間をざっくり見る用途にも使えます。

## 中身

HTML canvasとJavaScriptだけの小さなWebアプリです。公開ページを開けばそのまま動きます。
