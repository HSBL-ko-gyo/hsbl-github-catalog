# 定期発掘・更新の設計 — 自律運用

## 結論

週次処理は人間の承認待ちにしません。ただし、AIへ認証付きネットワーク操作を自由に渡すのではなく、次の三段に分けます。

1. 決め打ち収集スクリプトが public・非forkと、ポリシーで明示許可したforkのGitHub情報だけを取得する。
2. Codexがローカル収集結果を読み、カタログ更新とSEO変更計画を作る。
3. 決め打ちスクリプトが対象・変更種類・件数・SHAを検証して、他リポジトリ更新とカタログ公開を行う。
4. 固定Playwright処理がProtoPediaの重複確認、フォーム入力、実画面サムネイルのアップロード、公開後検証を行う。

明確なものは自動実行し、曖昧なものは質問せず飛ばします。

実装ではCodex CLIをworkspace-writeを内包する `--approve-for-me` で起動し、`sandbox_workspace_write.network_access=false` を指定します。Codexの作業領域はカタログリポジトリ内、ネットワーク取得とGitHub更新は外側の固定スクリプトだけです。

## 週次処理

推奨: 毎週日曜 05:20 JST。`flock` で重複を防ぎ、`Persistent=true` で停止中に逃した予定を次回起動時に一度実行します。

処理順:

```text
mainをff-onlyで更新
  ↓
public GitHubメタデータとREADMEを収集
  ↓
Codexをworkspace-write / networkなしで実行
  ├─ カタログページを作成・更新
  └─ repo-seo-actions.jsonを生成
  ↓
公開Webサービスの不足サムネイルを880×495で撮影
  ↓
ProtoPedia投稿キューを決定的に生成
  ↓
アクション計画の厳格検証
  ↓
check + build
  ↓
dry-runなら外部変更予定だけ表示して終了
  ↓
固定スクリプトが安全なGitHub SEO変更を適用
  ↓
適用結果を記録
  ↓
check + buildを再実行
  ↓
差分あり → カタログと投稿キューをmainへpush
  ↓
固定Playwright処理がProtoPediaへ投稿
  ├─ 失敗/不明 → 台帳を変えずキューを残して終了
  └─ 公開ページ検証成功 → publication-stateとfrontmatterを更新
  ↓
検証済み公開結果だけを別コミットでmainへpush
```

初回やAPIレート制限下で既存収集データを使うローカル確認だけは、次を利用できます。

```bash
HSBL_CATALOG_DRY_RUN=1 HSBL_CATALOG_SKIP_COLLECT=1 ./automation/run-weekly.sh
```

`HSBL_CATALOG_SKIP_COLLECT=1` はdry-run以外では拒否されます。dry-runはoriginがまだない初期構築でもfetch/pullを省略して続行し、他リポジトリ更新とmain pushを行いません。

## なぜPR承認を置かないか

日常運用の判断は委任済みだからです。代わりに、事故を防ぐ境界をコードで固定します。

- public・owner一致・非fork・非archivedだけ
- 新規掲載は用途と自作性が明確な場合だけ
- 曖昧な候補は質問せずスキップ
- 他リポジトリ変更はメタデータとREADME管理ブロックだけ
- コード・設定・workflow・Releaseには触れない
- repo削除・rename・archive・visibility等の破壊的操作をスキーマで表現不能にする
- READMEはbase SHA一致時だけ更新
- 1回あたりの件数上限を固定
- 全変更をGit履歴とレポートへ残す

カタログと投稿キュー、検証済みの外部公開結果は段階を分けてコミットします。外部投稿に失敗しても、未投稿の台帳を成功扱いにしません。

## 収集範囲

取得対象:

- owner: `HSBL-ko-gyo`
- visibility: public
- fork: false
- fork例外: `config/catalog-policy.yml` の `publication.allowedForks` に完全一致するものだけ

取得しないもの:

- private
- 許可リストにないfork
- GitHub tokenやAPIヘッダー
- Issue本文、PR本文、コミット差分の全量
- 不要なコード全文

READMEは候補判定と安全な導入ブロック生成に必要な範囲だけ取得します。元READMEのSHA、path、default branchを保持し、更新直前に再確認します。

## 新規作品の扱い

自動公開条件:

- public
- owner一致
- 非fork・非empty、または人間が明示許可した非emptyの独自派生fork
- READMEや公開ファイルから用途が説明できる
- 自作または明確な独自派生物
- 現行版または単独で意味がある
- 会社・顧客・受託・個人情報の懸念がない

条件を満たす候補は `draft: false` で公開します。判断が曖昧ならdraftページを大量生成せず、発掘レポートへ短く残して終了します。

## 他リポジトリSEO改善

Codexは直接GitHubへアクセスせず、`data/actions/repo-seo-actions.json` を生成します。

許可される変更:

- Description
- Topics
- Homepage
- README管理ブロック
- 完全一致の壊れたURL修正

README管理ブロック:

```md
<!-- hsbl-catalog:seo-start -->

ここだけ自動管理
<!-- hsbl-catalog:seo-end -->
```

管理ブロック外は保持します。初回追加時も既存READMEを削除せず、タイトル・badgeとの位置関係を保ちながら短い導入を挿入します。

固定適用スクリプトは、リモートのREADME SHAが計画時と違えばそのアクションをスキップします。人間や別処理の最新変更を上書きしません。

## 生成物

- `data/github/public-repositories.json`: 正規化済み公開メタデータ
- `data/github/readmes/<repo>.md`: 候補判定用キャッシュ
- `src/content/projects/*.md`: 公開作品ページ
- `data/actions/repo-seo-actions.json`: 検証前の変更計画
- `public/images/projects/<slug>.png`: Webサービス実画面の共用サムネイル
- `data/actions/protopedia-submissions.json`: 固定投稿処理の入力キュー
- `data/protopedia/publication-state.json`: 検証済み公開作品の重複防止台帳
- `reports/discovery/<date>.md`: 新規、更新、除外理由
- `reports/repo-seo/*.md`: リポジトリ単位の監査
- `reports/repo-seo-applied/<date>.md`: 実際の適用結果

## 失敗時の挙動

- 収集失敗: 既存作品を削除せず終了
- Codex失敗: リモート変更もpushも行わない
- action検証失敗: リモート変更もpushも行わない
- check/build失敗: リモート変更を行わない
- 個別SEO action失敗: そのactionだけスキップし、他の安全なactionは続行
- 最終check/build失敗: カタログmainへpushしない
- main push競合: force pushせず失敗として残し、次回または手動の通常Git操作で解消
- ProtoPedia送信前の失敗: 台帳を変えず次回再試行
- ProtoPedia送信後の結果不明: 台帳を変えず、次回は先に既存作品を照合して二重投稿を防止
- ProtoPedia公開確認成功: 作品ID、公開URL、公式URLの一致後だけ台帳を更新

## 日次処理はAI不要

意味判断は週次で十分です。更新日だけを動かす無意味なコミットは作らず、実質的な変更がある時だけ反映します。
