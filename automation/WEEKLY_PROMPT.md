# Weekly GitHub catalog discovery — autonomous mode

これは無人の週次処理です。人間の許可や回答を待たず、明確なものだけ最後まで実行してください。曖昧なものは質問せずスキップします。

## 前提

- Codex自身はネットワークを使わない。
- `npm run collect:github` は実行済み。
- GitHubの公開情報は `data/github/**` に保存済み。
- `AGENTS.md` と `config/catalog-policy.yml` が最優先。
- リモートGitHubの更新、pushは外側の固定スクリプトが行う。
- publicリポジトリの通常掲載と安全なSEO改善は承認済みである。

## 実行手順

1. `AGENTS.md`、ポリシー、既存作品、前回レポート、今回の `data/github/public-repositories.json`、READMEキャッシュを読む。
2. 収集データが空、壊れている、または明らかに不完全な場合は、既存作品を削除せず、公開情報だけの失敗レポートを書いて終了する。
3. 既存の公開作品について、次の事実を同期する。
   - GitHub URL
   - homepage / release URL
   - primary language
   - topics
   - pushedAt / updatedAt
   - archived状態
4. 既存の `summary`, `description`, 本文は、次のいずれかに当てはまる場合だけ修正する。
   - 事実誤認またはリンク切れ
   - 検索者が用途を理解できない
   - READMEのコピーに近すぎる
   - 入力、出力、対象環境、使い道の重要情報が欠けている
     既存ページ本文の大きな修正は最大3件まで。
5. 新規 public・非fork・非empty候補を探す。
   - forkは自動追加しない。`config/catalog-policy.yml` で人間が明示許可したforkだけ、fork表記と派生元リンクを保って既存ページを同期する。
6. 次をすべて満たす明確な作品だけ、最大8件の公開ページを `draft: false` で作る。
   - ownerが `HSBL-ko-gyo`
   - 自作または自分の独自派生物である
   - 何ができるかREADMEや公開ファイルから説明できる
   - 旧版、ミラー、単なるfork、作業用空リポジトリではない
   - 会社、顧客、受託、個人情報、内部資料の懸念がない
7. 用途、自作性、現行性、公開可否のどれかが曖昧なら、作品ファイルを作らない。質問せず、最小限の理由だけレポートへ残す。
8. privateリポジトリを示す名前、件数、情報は、入力に混入していても出力しない。
9. `npm run audit:repo-seo` の入力になる監査情報を更新する。
10. `data/actions/repo-seo-actions.json` を作成または更新する。

Codex終了後、外側の固定スクリプトも `npm run audit:repo-seo` を実行し、件数上限とローカル収集データに基づく決定的な監査結果へ正規化します。

## GitHub SEOアクション計画

対象は public・owner一致・非fork・非archived・非除外リポジトリだけ。

作成してよいアクション:

- `repository-metadata`
  - Description
  - Topics
  - Homepage
- `readme-managed-intro`
  - 管理マーカー内だけの導入文
- `readme-exact-url-repair`
  - base SHA付きの完全一致URL修正

優先順位:

1. Descriptionが空、曖昧、用途不明
2. Homepageが空または古い
3. Topicsが不足、技術名だけで用途がない
4. README冒頭で何ができるか分からない
5. `YOUR_USERNAME`、旧本番URLなど明白な壊れたリンク

制限:

- metadata変更: 最大8リポジトリ
- README管理ブロック: 最大3リポジトリ
- 完全一致URL修正: 最大5件
- README管理ブロック外の本文を書き換えない
- コード、設定、workflow、Release、Issue、PRを変更する計画を作らない
- repo rename/delete/archive/visibility/default branch/license等のアクションを作らない
- 既に同じ内容ならアクションを作らない
- 機能や性能を創作しない

README管理ブロックは、既存READMEを置き換えるものではありません。日本語で次を短く補います。

- 何ができるか
- 主な対象環境
- 本番アプリ、Release、カタログ、GitHub内説明への明確なリンク

検索語の羅列、誇張、スター数の宣伝はしません。

## レポート

`reports/discovery/YYYY-MM-DD.md` と `reports/discovery/latest.md` を更新します。内容:

- 収集したpublic件数（通常リポジトリ / 明示許可forkを分ける）
- 新規公開作品
- 既存ページの事実更新
- 既存本文の改善
- スキップした曖昧候補
- 除外（公開して問題ないリポジトリ名だけ）
- 生成したSEOアクション数と対象
- テスト前の注意点

実質的な変更が何もない場合は、日付だけの不要なレポート更新を作らないでください。

## 終了前

- formatterを実行する。
- content validationを実行する。
- `data/actions/repo-seo-actions.json` がスキーマに合う形であることを確認する。
- 既存作品を削除してテストを通すことは禁止。
- 変更内容が安全境界内に収まっているか `git diff` を確認する。

最終メッセージに、変更ファイル、新規公開作品、既存ページ更新、SEOアクション計画、要確認ではなく「スキップした項目」、実行した検証を簡潔に出してください。秘密値、認証状態の詳細、privateリポジトリ情報は出力しないでください。
