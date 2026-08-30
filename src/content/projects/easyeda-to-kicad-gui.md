---
title: EasyEDA to KiCad GUI
slug: easyeda-to-kicad-gui
repo: easyeda2kicad_gui
summary: easyeda2kicadは便利ですが、毎回コマンドを打つのがだるいのでWindows GUIにしました。LCSC IDからシンボル、フットプリント、3Dモデルを変換できます。
description: LCSCの部品を、GUIでKiCadへ持ってくる
category: electronics-tool
tags: [EasyEDA, KiCad, LCSC, フットプリント, 3Dモデル, Windows]
status: public
draft: false
featured: true
createdYear: 2025
links:
  github: https://github.com/HSBL-ko-gyo/easyeda2kicad_gui
  release: https://github.com/HSBL-ko-gyo/easyeda2kicad_gui/releases
seoTitle: EasyEDA部品をKiCadへ変換するWindows GUI | ハシビロ工業 GitHub
seoDescription: LCSC IDからEasyEDAのシンボル、フットプリント、3DモデルをKiCad形式へ変換。easyeda2kicadをGUIで操作するWindows向けツールです。
searchIntents: [EasyEDA KiCad 変換 GUI, LCSC KiCad フットプリント 変換]
repoCreatedAt: "2025-04-17T11:45:27Z"
repoUpdatedAt: "2026-05-26T10:15:14Z"
repoPushedAt: "2026-04-19T11:44:37Z"
primaryLanguage: HTML
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/easyeda2kicad_gui
  - https://github.com/HSBL-ko-gyo/easyeda2kicad_gui/blob/main/README.md
---

## コマンドをGUIにした

`easyeda2kicad`を画面から使うためのWindows GUIです。KiCadに欲しい部品がない時、LCSC IDを入れてEasyEDAの部品データを持ってきます。毎回コマンドとオプションを組み立てなくて済むようにしました。

## できること

シンボル、フットプリント、3Dモデルから必要なものを選び、出力先と変換オプションを指定できます。空のLCSC IDは実行前に止めます。設定は次回用に保存し、変換ログは選択してコピーできます。必要なら`easyeda2kicad`の導入も行います。

## 配布

Windows用の単体実行ファイルをReleaseで配布しています。Python、tkinter、PyInstallerを使ったビルド手順もリポジトリにあります。
