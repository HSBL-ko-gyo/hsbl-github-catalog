kicad-step-just-1p6 — KiCad STEP finished thickness fixer

概要 (JP)
- 目的: KiCad v7+ の STEP 出力で「完成厚」をピッタリ(例: 1.600 mm)に合わせ、部品のめり込みを防止（浮きは許容）。
- 前提: KiCad v7+ の STEP では外層の銅厚・レジスト厚を差し引いた厚みで出力されることがあり、約1.5xx mmとなる事例がある。
  - 背景議論: [KiCad Forum: 3D STEP export PCB thickness](https://forum.kicad.info/t/3d-step-export-pcb-thickness/62020?utm_source=chatgpt.com)
  - 追跡Issue: [GitLab #20896](https://gitlab.com/kicad/code/kicad/-/issues/20896?utm_source=chatgpt.com)

機能 (JP)
- 完成厚優先の厚み補正（既定: 1.600 mm）
- 基準はボトム固定（Z=0維持、上側に増厚）
- トップ/ボトムの銅厚・レジスト厚をパラメータ入力（既定: 銅0.035 mm, レジスト0.010 mm）
- 浮き量の見積り表示、めり込み（交差）検出時は警告
- 入出力: STEP → STEP（.kicad_pcb直読みは対象外）

使い方 (JP)
1. 入力STEPを選択
2. 完成厚と各厚みパラメータを設定
3. 解析を実行して現状厚・必要増厚・想定浮き量を確認
4. 変換を実行し完成厚を反映したSTEPを書き出し
5. Fusion等で厚み・干渉を確認

制約 (JP)
- 大規模/特殊形状STEPではボード本体認識が失敗する場合があります（Issueでご連絡ください）
- GUI対応（Windows想定）。バッチ/CLIは将来対応

—

Overview (EN)
- Goal: Make the exported PCB in STEP have the exact finished thickness (e.g., 1.600 mm), and prevent component interpenetration (allowing a small gap if any).
- Context: In KiCad v7+, the exported board thickness may reflect dielectric only (outer copper + solder mask excluded), resulting in ~1.5xx mm.
  - Discussion: [KiCad Forum: 3D STEP export PCB thickness](https://forum.kicad.info/t/3d-step-export-pcb-thickness/62020?utm_source=chatgpt.com)
  - Tracking: [GitLab Issue #20896](https://gitlab.com/kicad/code/kicad/-/issues/20896?utm_source=chatgpt.com)

Features (EN)
- Finished-thickness-first correction (default: 1.600 mm)
- Bottom face fixed (Z=0 kept, offset only on the top side)
- Parametric outer copper and solder mask thickness per side (defaults: Cu 0.035 mm, mask 0.010 mm)
- Show estimated gap; warn on interpenetration
- I/O: STEP → STEP (.kicad_pcb direct read is out of scope)

Usage (EN)
1) Select input STEP
2) Set target finished thickness and layer parameters
3) Run Analyze to see current thickness, required offset, estimated gap
4) Run Convert to export corrected STEP
5) Verify in Fusion or your MCAD

License
- MIT

Dependencies and Their Licenses
- pythonocc-core: LGPLv3 (https://github.com/tpaviot/pythonocc-core)
- OCCT (OpenCascade Technology): LGPLv2.1 with exception (https://www.opencascade.com/)
- PySide6 / PyQt6: LGPLv3 / GPLv3 (https://www.qt.io/licensing/)

Note: This software dynamically links to LGPL libraries. The source code of this software is available under MIT license, but binary distributions must comply with LGPL requirements (e.g., allowing users to replace LGPL components).


