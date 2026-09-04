# AGENTS.md — HSBL GitHub Catalog

## Product intent

このリポジトリは、`HSBL-ko-gyo` の公開 GitHub 作品を検索可能なカタログにし、具体的な用途検索から各 GitHub リポジトリへ送客するための静的サイトです。

役割分担:

- カタログ: 人間向けの概要、用途、検索入口
- GitHub: ソース、README、Issue、Release、ライセンス
- 本番アプリ・販売ページ: 実際の利用・購入
- Google Sites: ハシビロ工業全体の本館

## Autonomous authority

この運用では、日常的な掲載・更新・SEO改善について人間の都度承認を必要としません。

- 明確に自作と判断できる public・非fork・非empty リポジトリは、自動で公開ページを作ってよい。
- `config/catalog-policy.yml` で明示許可されたforkは、fork表記、派生元リンク、独自変更と制約の説明を付ける場合だけ掲載・維持してよい。
- 既存ページの事実更新と、検索性を実質的に改善する本文修正を自動で行ってよい。
- 検証成功後、カタログリポジトリの `main` へ自動で反映してよい。
- public・非fork・自作リポジトリについて、Description、Topics、Homepage、READMEの管理対象導入ブロックを自動改善してよい。
- 判断が曖昧な場合は質問せず、その候補を飛ばしてレポートへ残す。

「許可を求めて停止する」より、「明確なものだけ実行し、曖昧なものは保留する」を優先します。

## Non-negotiable safety rules

1. private リポジトリを問い合わせない。
2. private リポジトリの名前、説明、存在、件数をログ、レポート、コミットへ出さない。
3. fork、ミラー、他者作品を自作品として掲載しない。
4. 会社、顧客、受託、個人情報、内部資料を連想させる候補は掲載・編集しない。
5. 認証情報、環境変数値、Cookie、HTTPヘッダー、Codex認証ファイル、GitHub tokenを読み取ったり出力したりしない。
6. READMEやコードから確認できない機能・性能・利用実績を創作しない。
7. リポジトリの削除、rename、archive、visibility変更、default branch変更、権限変更、ライセンス変更は自動化しない。
8. 他リポジトリのソースコード、設定、workflow、Release、Issue、PRは自動変更しない。
9. README自動変更は管理マーカー内または検証可能な完全一致URL修正だけに限定し、それ以外の既存本文を保持する。
10. 一時的なAPI障害や収集欠落を理由に、既存公開ページを削除しない。

## Publication policy

掲載条件はすべて満たす必要があります。

- GitHub上で public
- owner が `HSBL-ko-gyo`
- forkではない。ただし `config/catalog-policy.yml` の明示許可forkは、派生元と独自変更を明記する場合だけ例外
- 空ではない
- 何を作ったか公開情報から説明可能
- 公開して問題ない内容
- `config/catalog-policy.yml` で除外されていない
- 現行版または単独で意味のある作品

明確な候補は初回から `draft: false` で公開します。曖昧な候補は draft を大量生成せず、掲載を見送って発掘レポートへ理由だけ残します。

## Content rules

- 日本語を第一言語とする。必要に応じて英語名や英語検索語を補助的に使う。
- リポジトリ名ではなく、人が理解できる作品名を見出しにする。
- 冒頭で「何ができるか」を明確にする。
- READMEをそのまま複製しない。
- 固定6節を使わず、全作品を同じ見出し順へ揃えない。内容に応じた2〜4個程度のH2を使う。
- 企業やサービスの紹介文にせず、本人が書いた短い技術メモの温度を維持する。
- `だるかったので作った`などの動機は根拠がある時だけ使い、同じ口癖を全作品へ散らさない。
- 新規作品は既存作品の文体へ合わせ、機能や動機を創作しない。
- 検索語を羅列しない。用途・問題・解決方法として自然に書く。
- リンク文言は「こちら」だけにせず、遷移先が分かる言葉にする。
- 不明な年、対応OS、ライセンス、公開状態は推測しない。
- 作品一覧は原則としてGitHubのリポジトリ公開日時（`created_at`）の新しい順にする。明示許可forkで、独自作品名・独自機能としての初回公開Releaseがfork作成より後に確認できる場合は、その最初の公開Release日時を `publishedAt` に記録して作品公開日とし、`repoCreatedAt` にはfork作成日時をそのまま残す。
- 廃止・旧版は後継への導線だけ残すか、カタログから外す。
- 人間が書いた文章は、検索性・正確性・可読性が実際に改善する場合だけ変更する。
- 既に本人文体で書かれた文章を週次処理で無難な説明文へ戻さない。
- 週次更新で既存本文を大きく直すのは、事実誤認、リンク切れ、重大な用途不明がある場合だけにする。

## Allowed weekly edits

週次Codexが編集してよいもの:

- `data/github/**` の公開メタデータ正規化結果
- 既存作品のAPI由来フィールド
- 明確な新規作品の公開コンテンツ
- `reports/**`
- 事実に基づくリンク修正
- 検索意図を明確にする小〜中規模の本文修正
- テスト、スキーマ、収集処理、自動化処理の保守
- `data/actions/repo-seo-actions.json` の安全なアクション計画
- `data/actions/protopedia-submissions.json` の公開作品だけを含む投稿候補
- `data/protopedia/publication-state.json` の公開済み作品IDとURL

固定スクリプトが他リポジトリへ適用してよいもの:

- Description
- Topics
- Homepage
- READMEの `<!-- hsbl-catalog:seo-start -->` 〜 `<!-- hsbl-catalog:seo-end -->` 管理ブロック
- README内の、完全一致で検証できる明白な壊れたURL修正

自動化してはいけないもの:

- private/fork/archivedリポジトリの変更
- ソースコード、依存関係、ビルド設定、workflowの変更
- リポジトリ名、visibility、archive状態、default branch、権限、ライセンスの変更
- DNS、Cloudflare、Google Sitesの変更
- 作品の実態を別物に見せる大規模な再命名
- 根拠のない誇張や検索語詰め込み

## SEO rules

- ページごとに固有 title, description, h1 を持つ。
- canonical はカタログページ自身。
- GitHub READMEとの重複を避ける。
- 具体的な用途、入力、出力、対象環境を本文へ自然に含める。
- 公開作品へ一覧から通常リンクで到達できるようにする。
- draftは noindex にするのではなく、そもそも出力しない。
- 内容に合わない構造化データを付けない。
- スター数や更新日のために品質を誇張しない。
- GitHub側のDescriptionは短く用途が分かる文にする。
- Topicsは技術名だけでなく用途も含め、最大12件程度に絞る。
- Homepageは確認できる本番URLを優先し、なければカタログの個別ページを使う。

## ProtoPedia parallel publication

- 週次の無人処理は `npm run capture:thumbnails` で公開Webサービスの実画面を880×495 PNGへ撮影し、`npm run prepare:protopedia` で新規公開作品と既存作品の未同期サムネイルだけを投稿キューへ入れる。
- Webサービス作品は `thumbnail: /images/projects/<slug>.png` を持たせ、同じファイルをカタログ、OG画像、ProtoPediaで使う。AI生成画像で代用しない。
- 認証情報、Cookie、ブラウザプロファイルをリポジトリへ保存しない。
- `npm run publish:protopedia` はリポジトリ外の永続Chromeプロファイルへlocalhost CDPで接続し、`data/actions/protopedia-submissions.json` だけを入力に固定Playwright処理でフォーム入力、画像アップロード、一般公開を行う。毎回のCodexブラウザ操作や確認待ちは置かない。
- 投稿前にアカウントの既存作品を照合する。タイトルと公式URLがともに一致する作品があれば再投稿せず、成功結果として回収する。一方だけ一致する場合は衝突として停止する。
- 登録・更新ボタンを押す直前にリポジトリ外のattemptを記録し、押下は1回だけにする。公開ページの作品ID、タイトル、公式URLを再確認できた後だけ `publication-state.json` と作品frontmatterを更新する。
- 送信前の失敗は次回再試行する。送信開始後に結果不明となった場合は台帳を更新せず、次回の事前照合で公開済みか確認してから続行する。
- Chrome/CDPまたは認証が利用できない場合もキューと台帳は変更せず、リポジトリ外のJSONLログを残して失敗終了する。
- 複数の投稿候補があっても、外部更新は既定で10分以上空ける。間隔の基準時刻はリポジトリ外へ保存し、週次処理の再起動でも短縮しない。

## Development workflow

Node.js 24以上を使います。UNO Qのユーザー領域へツールを置いた場合は、先に `export PATH="$HOME/.local/bin:$PATH"` を実行します。

完全な検証順:

```bash
npm ci
npm run collect:github
npm run capture:thumbnails
npm run prepare:protopedia
npm run validate:protopedia-actions
npm run publish:protopedia -- --dry-run
npm run audit:repo-seo
npm run validate:repo-seo-actions
npm run check
npm run build
npm run apply:repo-seo -- --dry-run
./automation/install-systemd.sh --dry-run --user
```

開発サーバーは `npm run dev`、静的ビルドの確認は `npm run preview` です。作品は `src/content/projects/*.md`、公開GitHub収集結果は `data/github/**`、SEO actionは `data/actions/repo-seo-actions.json`、ProtoPedia投稿候補は `data/actions/protopedia-submissions.json` に置きます。

週次フローの非変更確認:

```bash
HSBL_CATALOG_DRY_RUN=1 ./automation/run-weekly.sh
```

直前に収集済みでAPI再取得を避けるローカル確認に限り、`HSBL_CATALOG_SKIP_COLLECT=1` をdry-runと同時に指定できます。実適用モードではこの指定を拒否します。

変更前後で `git status` と `git diff` を確認し、生成物や秘密値をコミットしないでください。
