---
title: HSBL-100 ccHacker
slug: hsbl-100-cchacker
repo: HSBL-100
summary: USB Type-CデバイスのCCプルダウン抵抗を確認し、不足時に代替抵抗を中継するためのハードウェア。
description: USB Type-CのCCプルダウン抵抗を確認・代替するハードウェア
category: hardware-software
tags: [USB Type-C, CC抵抗, 充電, 回路図, ハードウェア]
status: public
draft: false
featured: false
createdYear: 2023
links:
  github: https://github.com/HSBL-ko-gyo/HSBL-100
  app: https://hsbl-ko-gyo.github.io/HSBL-100/
seoTitle: USB Type-CのCC抵抗を確認・代替するccHacker | ハシビロ工業 GitHub
seoDescription: HSBL-100 ccHackerは、USB Type-CデバイスのCCプルダウン抵抗を確認し、不足時に代替抵抗を中継するハードウェアです。
searchIntents: [USB Type-C CC抵抗 確認, Type-C 充電 CC プルダウン]
repoCreatedAt: "2023-05-10T12:05:01Z"
repoUpdatedAt: "2023-08-07T12:09:31Z"
repoPushedAt: "2023-12-18T05:26:41Z"
primaryLanguage: null
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/HSBL-100
  - https://github.com/HSBL-ko-gyo/HSBL-100/blob/main/README.md
  - https://hsbl-ko-gyo.github.io/HSBL-100/
---

## 何ができるか

USB Type-CデバイスにCCプルダウン抵抗が存在するかを確認し、抵抗が不足する機器では本体の代替抵抗を中継して電源側へ接続状態を伝えます。リポジトリでは回路図などが公開されています。

## こんな時に使う

Type-C給電で電源が入らない小型機器について、CC抵抗の有無を確認したい時や、不足する抵抗を専用ハードウェアで補いたい時の製品です。

## 主な機能

- CCプルダウン抵抗の存在確認
- 不足するCCプルダウン抵抗の代替
- Type-CケーブルのIN / OUT間へ中継
- 回路資料の公開

## 技術・構成

USB Type-CのCC接続に関わるハードウェアです。READMEには規格から外れる特殊な製品仕様である注意が明記されています。用途と注意事項を理解した上で扱う必要があります。

## 公開先または使い方

[HSBL-100 ccHackerの製品説明と接続方法を見る](https://hsbl-ko-gyo.github.io/HSBL-100/)。電源側をIN、充電対象側をOUTへ接続します。

## GitHubで見る

[HSBL-100 ccHackerの回路資料と注意事項をGitHubで見る](https://github.com/HSBL-ko-gyo/HSBL-100)。
