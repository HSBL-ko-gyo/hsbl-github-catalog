---
title: easyeda2kicad +DigiMou
slug: easyeda2kicad-digimou
repo: easyeda2kicad-digimou
summary: 部品の正確なメーカー型番を基準に、LCSC・DigiKey・MouserのメタデータとKiCad用CADデータの由来を分けて記録する変換ツール。
description: 販売元メタデータとCADデータの由来を確認しながらKiCadライブラリへ取り込む派生版
category: electronics-tool
tags: [EasyEDA, KiCad, LCSC, DigiKey, Mouser, BOM, Python]
status: beta
draft: false
featured: false
isFork: true
forkSourceUrl: https://github.com/uPesy/easyeda2kicad.py
createdYear: 2024
links:
  github: https://github.com/HSBL-ko-gyo/easyeda2kicad-digimou
  release: https://github.com/HSBL-ko-gyo/easyeda2kicad-digimou/releases/tag/v1.1.0b3
seoTitle: DigiKey・Mouser部品情報をKiCadへ取り込む +DigiMou | ハシビロ工業 GitHub
seoDescription: 正確なメーカー型番からLCSC・DigiKey・Mouserの部品メタデータを取得し、CADデータの提供元と分けてKiCadライブラリへ記録する非公式fork版です。
searchIntents:
  [
    DigiKey Mouser KiCad 部品 変換,
    KiCad BOM 販売元 メタデータ,
    EasyEDA KiCad 派生版,
  ]
repoCreatedAt: "2024-08-27T06:44:26Z"
repoUpdatedAt: "2026-07-30T01:22:07Z"
repoPushedAt: "2026-07-30T09:16:58Z"
primaryLanguage: Python
topics: [bom, digikey, easyeda, electronics, kicad, lcsc, mouser, pcb, python]
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/easyeda2kicad-digimou
  - https://github.com/HSBL-ko-gyo/easyeda2kicad-digimou/blob/feature/multi-distributor-metadata/README.md
  - https://github.com/uPesy/easyeda2kicad.py
---

## 何ができるか

メーカー名と完全なメーカー型番を基準に電子部品を照合し、KiCad 6以降で使うシンボル、フットプリント、3Dモデルと販売元メタデータをまとめます。LCSC、DigiKey、Mouserから得る部品情報と、EasyEDAなどから得るCADデータの提供元を分けて記録できる点が特徴です。

このリポジトリは [uPesy/easyeda2kicad.py](https://github.com/uPesy/easyeda2kicad.py) を基にした非公式forkです。派生元の公式版や、各販売元の公式ツールではありません。

## こんな時に使う

回路図やBOMで使う部品のメーカー型番、販売元の品番、CADモデルの作成元を混同せずにKiCadプロジェクトへ残したい時に使えます。複数の販売元を横断して部品情報を確認しつつ、採用したCADデータの由来も機械可読なManifestへ保存したい場合を想定しています。

## 主な機能

- メーカー名と完全なメーカー型番による照合
- LCSCの公開情報とEasyEDA CADを使った、アカウント不要の取り込み経路
- 利用者自身のAPI認証を使うDigiKey・Mouserメタデータ検索
- メタデータ提供元、CAD配布元、モデル作成元を分けたManifest出力
- KiCadプロジェクトローカルのライブラリ生成と登録
- Ultra Librarian、SamacSys、メーカー提供パッケージの検証付きローカル取り込み

DigiKeyやMouserからCADを完全自動取得するツールではありません。READMEでは、Mouser経路の実データ検証や両販売元を通した最終E2Eなど、未完了の範囲も明示されています。

## 技術・構成

Python 3.9以降で動作するCLIとPythonパッケージで、配布名とコマンド名を派生元から分離しています。ライセンスは派生元と同じAGPL-3.0で、KiCad 6以降を対象にしています。DigiKeyとMouserを使う場合は利用者自身のAPI認証が必要で、認証情報をコマンド引数やリポジトリへ保存しない運用が案内されています。

## 公開先または使い方

[easyeda2kicad +DigiMou v1.1.0b3の公開ベータ版をGitHubで確認する](https://github.com/HSBL-ko-gyo/easyeda2kicad-digimou/releases/tag/v1.1.0b3)。まずは認証不要のLCSC・EasyEDA経路で動作を確認し、DigiKeyやMouserは公式APIの利用条件と認証を準備した場合だけ追加します。

## GitHubで見る

[easyeda2kicad +DigiMouのソース、制約、検証状況をGitHubで見る](https://github.com/HSBL-ko-gyo/easyeda2kicad-digimou)。派生元の実装と履歴は [uPesy/easyeda2kicad.py](https://github.com/uPesy/easyeda2kicad.py) で確認できます。
