---
title: KiCad STEP完成厚補正ツール
slug: kicad-step-thickness-fixer
repo: kicad-step-just-1p6
summary: KiCadから出したSTEP基板が少し薄くなる時、下面を動かさず1.600mmなど指定した完成厚へ直すWindows GUIです。
description: KiCadのSTEP基板を、指定した完成厚へ直す
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
repoCreatedAt: "2025-10-10T08:00:48Z"
repoUpdatedAt: "2025-10-10T10:35:19Z"
repoPushedAt: "2025-10-10T10:35:16Z"
primaryLanguage: Python
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/kicad-step-just-1p6
  - https://github.com/HSBL-ko-gyo/kicad-step-just-1p6/blob/main/README.md
---

## STEPの薄さを直す

KiCad v7以降から出したSTEP基板が、外層銅やレジストの扱いで1.5xxmmになることがあります。そのSTEPを読み、下面のZ=0は動かさず、上側へ厚みを足して1.600mmなど指定した完成厚へ直します。MCADへ持っていった時の部品めり込みを避けるための道具です。

## 補正のしかた

入力STEP、完成厚、トップとボトムの銅厚・レジスト厚を設定します。解析すると現在厚、必要な増厚、想定される浮き量が出ます。めり込みを検出した場合は警告し、変換後は別のSTEPへ保存します。

## 注意

`.kicad_pcb`を直接読むものではありません。特殊形状や大きなSTEPでは基板本体の認識に失敗する場合があります。最後はFusionなどで厚みと干渉を確認してください。
