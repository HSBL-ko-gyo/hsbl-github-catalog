---
title: KiCad STEP完成厚補正ツール
slug: kicad-step-thickness-fixer
repo: kicad-step-just-1p6
summary: KiCadから出力したSTEP基板を読み込み、下面を固定したまま完成厚を指定値へ補正し、部品のめり込みを避けるWindows向けGUI。
description: KiCadのSTEP基板を指定した完成厚へ補正するGUIツール
category: electronics-tool
tags: [KiCad, STEP, 基板厚, 3D CAD, Windows, Python]
status: beta
draft: false
featured: true
createdYear: 2025
links:
  github: https://github.com/HSBL-ko-gyo/kicad-step-just-1p6
seoTitle: KiCad STEP基板の完成厚を1.6mmなどへ補正 | ハシビロ工業 GitHub
seoDescription: KiCad v7以降から出力したSTEP基板の下面を固定し、1.600mmなど指定した完成厚へ補正。部品のめり込み警告と浮き量の目安を表示します。
searchIntents: [KiCad STEP 基板 厚さ 1.6mm, KiCad STEP 部品 めり込み 補正]
repoUpdatedAt: "2025-10-10T10:35:19Z"
repoPushedAt: "2025-10-10T10:35:16Z"
primaryLanguage: Python
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/kicad-step-just-1p6
  - https://github.com/HSBL-ko-gyo/kicad-step-just-1p6/blob/main/README.md
---

## 何ができるか

KiCad v7以降から出力したSTEP形式の基板を読み込み、下面のZ=0を保ちながら上側へ厚みを足し、指定した完成厚へ補正して別のSTEPを書き出します。

## こんな時に使う

KiCadの3D基板をFusionなどのMCADへ渡した際、想定より薄い基板によって部品が基板へめり込む状態を避けたい時に使います。入力はSTEPで、`.kicad_pcb` の直接読み込みは対象外です。

## 主な機能

- 完成厚を優先したSTEP→STEP変換
- 下面固定、上面側だけの増厚
- 外層銅厚とソルダーレジスト厚の設定
- 現在厚、必要増厚、想定浮き量の表示
- めり込みを検出した場合の警告

## 技術・構成

PythonのGUIとpythonocc-core / OpenCascadeを使うWindows想定のツールです。特殊形状や大規模なSTEPでは基板本体の認識に失敗する場合があることも公開されています。

## 公開先または使い方

入力STEPと目標の完成厚を選び、解析結果を確認してから補正済みSTEPを書き出します。出力後はFusionなどで厚みと干渉を確認する手順です。

## GitHubで見る

[KiCad STEP完成厚補正ツールのソース、制約、ライセンス情報をGitHubで見る](https://github.com/HSBL-ko-gyo/kicad-step-just-1p6)。
