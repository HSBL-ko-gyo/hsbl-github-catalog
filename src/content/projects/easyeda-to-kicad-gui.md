---
title: EasyEDA to KiCad GUI
slug: easyeda-to-kicad-gui
repo: easyeda2kicad_gui
summary: LCSC IDを入力し、EasyEDA部品のシンボル、フットプリント、3DモデルをKiCad向けに変換するWindows用GUI。
description: EasyEDA部品をLCSC IDからKiCad形式へ変換するWindows GUI
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

## 何ができるか

LCSC IDを手掛かりに、EasyEDAの部品データをKiCad用のシンボル、フットプリント、3Dモデルへ変換します。コマンド操作が必要な `easyeda2kicad` を画面から設定して実行できるラッパーです。

## こんな時に使う

基板設計で使いたい部品がKiCadライブラリに見つからず、EasyEDA側の公開部品データを取り込みたい時に使えます。変換対象や出力先を毎回コマンドで組み立てたくないWindows利用者向けです。

## 主な機能

- LCSC IDの入力チェック
- シンボル、フットプリント、3Dモデルの選択変換
- 出力フォルダと変換オプションの指定
- 設定の保存と、選択可能なログ表示
- 必要時のeasyeda2kicad導入支援

## 技術・構成

Python、tkinter、easyeda2kicadを組み合わせたデスクトップGUIです。配布用のWindows単体実行ファイルはPyInstallerで構築する手順が公開されています。

## 公開先または使い方

[EasyEDA to KiCad GUIの配布状況をGitHub Releasesで見る](https://github.com/HSBL-ko-gyo/easyeda2kicad_gui/releases)。LCSC ID、変換するデータ種別、出力先を設定して変換を実行します。

## GitHubで見る

[EasyEDA to KiCad GUIのソースとビルド手順をGitHubで見る](https://github.com/HSBL-ko-gyo/easyeda2kicad_gui)。
