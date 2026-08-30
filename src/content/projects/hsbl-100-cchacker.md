---
title: HSBL-100 ccHacker
slug: hsbl-100-cchacker
repo: HSBL-100
summary: CCプルダウン抵抗が入っていないType-C機器を確認し、必要なら抵抗を代わりに入れる中継基板です。かなり特殊用途。
description: Type-Cなのに給電できない機器へ、CC抵抗を足す
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

## CC抵抗を確認して補う

Type-CコネクタなのにCCプルダウン抵抗がなく、給電側から接続を認識されない機器があります。ccHackerは抵抗が入っているかを確認し、足りなければ代わりの抵抗を入れる中継基板です。かなり特殊用途です。

## 使い方

IN側へ電源供給用のUSB Type-Cケーブル、OUT側へ給電したい機器をType-Cケーブル経由でつなぎます。回路図と接続資料は公開しています。

## 注意

> **USB Type-C規格外です。** 特殊な仕様の基板なので、規格から外れることと接続先を理解した上で使ってください。
