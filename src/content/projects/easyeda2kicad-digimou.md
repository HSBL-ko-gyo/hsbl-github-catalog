---
title: easyeda2kicad +DigiMou
slug: easyeda2kicad-digimou
repo: easyeda2kicad-digimou
summary: 部品の完全な型番を軸に、販売元の情報とCADデータの出どころを分けて残すeasyeda2kicad派生版です。
description: 部品の出どころを分けて、KiCadへ持ってくる
category: electronics-tool
tags: [EasyEDA, KiCad, LCSC, DigiKey, Mouser, BOM, Python]
status: beta
draft: false
featured: false
isFork: true
forkSourceUrl: https://github.com/uPesy/easyeda2kicad.py
createdYear: 2026
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
publishedAt: "2026-07-23T12:28:46Z"
repoCreatedAt: "2024-08-27T06:44:26Z"
repoUpdatedAt: "2026-07-30T01:22:07Z"
repoPushedAt: "2026-07-30T09:16:58Z"
primaryLanguage: Python
topics: [bom, digikey, easyeda, electronics, kicad, lcsc, mouser, pcb, python]
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/easyeda2kicad-digimou
  - https://github.com/HSBL-ko-gyo/easyeda2kicad-digimou/releases/tag/v1.1.0b1
  - https://github.com/HSBL-ko-gyo/easyeda2kicad-digimou/blob/feature/multi-distributor-metadata/README.md
  - https://github.com/uPesy/easyeda2kicad.py
---

## 型番と出どころを残す

メーカー名と完全なメーカー型番で部品を照合し、KiCad 6以降のシンボル、フットプリント、3DモデルへつなぐCLIです。LCSC、DigiKey、Mouserの販売情報と、EasyEDAなどのCADデータを同じ出どころとして扱わず、別々にManifestへ残します。

## 派生元と独自変更

[uPesy/easyeda2kicad.py](https://github.com/uPesy/easyeda2kicad.py)を基にした非公式forkです。完全な型番での照合、複数販売元のメタデータ、CADの配布元とモデル作成元を分けた記録、プロジェクトローカルのKiCadライブラリ登録を追加しています。各販売元の公式ツールではありません。

## 今できること

アカウントなしのLCSC・EasyEDA経路と、利用者自身のAPI認証を使うDigiKey・Mouserのメタデータ検索があります。Ultra Librarian、SamacSys、メーカー提供パッケージは、手元へダウンロードしたものを検証して取り込めます。認証情報は引数やリポジトリへ保存しない前提です。

## まだできないこと

DigiKeyやMouserからCADを何でも自動取得するものではありません。Mouser経路の実パッケージ確認と、両販売元を通した最終E2Eには未完了の範囲があります。現在は公開ベータです。
