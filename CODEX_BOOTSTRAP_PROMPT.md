# Codexへの初回構築指示（自律運用版）

あなたは Arduino UNO Q 上で動く Codex です。このディレクトリを、ハシビロ工業の公開 GitHub 作品カタログ用リポジトリとして完成させてください。

この運用では、通常の掲載・更新・SEO改善について人間の都度承認を必要としません。明確なものは検証後に実行し、判断が曖昧なものは質問待ちにならずスキップしてください。

最初に、次のファイルを全文読んでください。

- `AGENTS.md`
- `config/catalog-policy.yml`
- `seed/initial-projects.yml`
- `docs/AUTOMATION_DESIGN.md`
- `docs/GITHUB_SEO_RULES.md`
- `docs/GSITE_INTEGRATION.md`
- `automation/WEEKLY_PROMPT.md`
- `automation/run-weekly.sh`
- `systemd/hsbl-github-catalog-discovery.service.in`
- `systemd/hsbl-github-catalog-discovery.timer`

## 目的

`https://github.hsbl-ko-gyo.com/` に公開する、日本語中心の静的サイトを作ります。

目的は二つです。

1. `HSBL-ko-gyo` が作った公開物を、GitHub のリポジトリ名だけでは分からない人にも見つけやすくする。
2. 「Markdown 表 PNG 変換」「Google Drive PDF Ctrl ホイール」「EasyEDA KiCad 変換」などの具体的な検索から、紹介ページとGitHubリポジトリの両方へ流入させる。

Google Sites の iframe 埋め込みを検索用本体にはしません。Google Sites には代表作と通常リンクだけを置き、この静的サイトを検索・一覧の本体にします。

## 自律運用方針

次の通常判断は委任済みです。確認質問を挟まず進めてください。

- 明確な public・非fork・非empty 自作品をカタログへ公開する。人間がポリシーで明示許可したforkだけは、派生元と独自変更を明記して掲載できる。
- 既存ページの事実、リンク、検索説明を改善する。
- 検証成功後、カタログリポジトリの `main` へ反映する。
- public・非fork・非archived の自作リポジトリについて、Description、Topics、Homepageを改善する。
- READMEへ管理マーカーで囲った検索用導入ブロックを追加・更新する。
- README内の明白な壊れたURLを、完全一致かつbase SHA一致時に限り修正する。

ただし、曖昧な候補を無理に公開してはいけません。質問する代わりにスキップし、公開情報だけを使った短い理由をレポートへ残してください。

## 作成するもの

### 1. 静的サイト

現在利用可能な安定版 Node.js で動く Astro + TypeScript を採用してください。静的出力のみとし、DB、SSR、常駐サーバーは使いません。

最低限、次を実装してください。

- `/` — GitHub作品一覧、キーワード検索、カテゴリ絞り込み、状態絞り込み
- `/projects/<slug>/` — 各作品の独立した紹介ページ
- `/categories/<slug>/` — カテゴリ一覧
- `/about/` — このカタログについて、掲載基準、GitHubプロフィールへの導線
- `/robots.txt`
- `/sitemap-index.xml` または `/sitemap.xml`
- 404ページ

作品ページは README の丸写しにしません。人間向けの独自説明を持ち、GitHub、本番Webアプリ、Release、販売ページなどへ用途が分かるアンカーテキストでリンクしてください。

### 2. コンテンツモデル

Astro Content Collections または同等の型付き方式で、作品ごとに Markdown/MDX を一ファイル持たせてください。

必須フィールド:

- `title`
- `slug`
- `repo`
- `summary`
- `description`
- `category`
- `tags`
- `status`: `public | beta | development | archived`
- `draft`
- `featured`
- `createdYear`（分かる場合）
- `links.github`
- `links.app`（任意）
- `links.release`（任意）
- `links.article`（任意）
- `links.shop`（任意）
- `seoTitle`
- `seoDescription`
- `searchIntents`
- `repoUpdatedAt`
- `repoPushedAt`
- `primaryLanguage`
- `topics`
- `sourceEvidence`

作品本文へ固定6節を強制しません。作品ごとに、内容に合うH2を2〜4個程度選び、全作品を同じ見出し順へ揃えないでください。企業やサービスの紹介文ではなく、本人が自分で作ったものを普通の言葉で説明する短い技術メモの温度を維持します。

`これ何`、`作った理由`、`使い方`、`中身`、`注意`、`まだできないこと`などを必要に応じて使います。`だるかったので作った`などの動機は根拠がある時だけ書き、同じ口癖を全作品へ散らしません。機能や動機を創作せず、既に本人文体で書かれた文章を週次処理で無難な説明文へ戻さないでください。週次更新で既存本文を大きく直すのは、事実誤認、リンク切れ、重大な用途不明がある場合だけです。新規作品も既存作品の文体へ合わせます。

`draft: true` はビルド成果物、サイトマップ、一覧、内部リンクへ一切出さないでください。新規候補は、公開情報から用途と自作性を高い確度で確認できる場合は `draft: false` で作成します。曖昧な場合はdraftを量産せず掲載を見送ります。

### 3. デザイン

- ハシビロ工業らしい「個人開発・電子工作・道具箱」の雰囲気
- 日本語が読みやすい
- スマートフォン対応
- 外部フォント、外部アイコンCDN、追跡スクリプトは初期版では使わない
- カードへ、作品名、一行説明、カテゴリ、状態、主要言語、主要リンクを表示
- GitHub のスター数を主役にしない
- 画像がない作品でも破綻しない
- キーボード操作と十分なコントラストを確保する

### 4. SEO

`docs/GITHUB_SEO_RULES.md` に従ってください。

必須:

- ページごとに固有の `title` と `meta description`
- self canonical
- OGP と Twitter Card
- 一覧ページから全公開作品へ通常の `<a href>` で到達可能
- サイトマップには公開ページだけを含める
- 内容に合う `SoftwareApplication`、`WebApplication`、`CreativeWork` などの JSON-LD
- 作品ページの見出しに、実際の用途を自然な日本語で含める
- キーワードの羅列や不自然な重複はしない
- README と同文の複製ページにはしない

### 5. GitHubメタデータ収集

`npm run collect:github` を実装してください。

収集は、認証済み `gh` CLI または GitHub API を使う決め打ちスクリプトで行い、Codex自身へネットワーク取得を任せません。

絶対条件:

- owner は `HSBL-ko-gyo`
- public リポジトリだけを問い合わせる
- fork は除外する
- private リポジトリは取得対象にせず、名前や件数をログへ出さない
- 取得内容を `data/github/public-repositories.json` へ正規化して保存
- README は public・非forkの候補と明示許可forkだけを取得し、必要最小限のキャッシュを `data/github/readmes/` へ保存
- APIレスポンス、認証情報、ヘッダーをそのまま保存しない
- 収集物は決定的な並び順にする
- 一時的な API エラーで既存の公開ページを削除しない

収集候補の主なフィールド:

- name
- description
- url
- homepageUrl
- isArchived
- isFork
- isEmpty または相当判定
- createdAt
- updatedAt
- pushedAt
- primaryLanguage
- topics
- defaultBranch
- latestRelease
- license
- readmePath
- readmeSha

### 6. 自動発掘・公開フロー

`automation/WEEKLY_PROMPT.md` で週次 Codex が無人運転できるようにしてください。

- 既存作品: API由来の事実を同期する。
- 明確な新規作品: 最大8件まで `draft: false` で公開ページを作る。
- 曖昧な候補: 質問せずスキップする。
- fork、空、置き場、ミラー、旧版、他者作品: 掲載しない。
- 検索性が実際に改善する場合、既存ページ本文を最大3件まで修正してよい。
- 変更がなければ不要なコミットを作らない。
- `npm run check` と `npm run build` が成功した場合だけ `main` へ反映する。
- 手動PR、手動マージ、公開承認は要求しない。

### 7. GitHubリポジトリ自体のSEO改善

カタログだけでなく、各GitHubリポジトリ自体への検索流入も改善します。

次を実装してください。

- `npm run audit:repo-seo`
- `npm run validate:repo-seo-actions`
- `npm run apply:repo-seo`
- 監査結果: `reports/repo-seo/<repo>.md`
- 機械可読な変更計画: `data/actions/repo-seo-actions.json`
- 適用結果: `reports/repo-seo-applied/<date>.md` と `reports/repo-seo-applied/latest.md`
- JSON Schema または同等の厳格な型検証

Codexはネットワークを使わず、ローカルの収集データから変更計画だけを作ります。ネットワーク操作は固定スクリプトが実行します。

許可するアクション:

1. `repository-metadata`
   - Description
   - Topics
   - Homepage
2. `readme-managed-intro`
   - `<!-- hsbl-catalog:seo-start -->`
   - `<!-- hsbl-catalog:seo-end -->`
   - この範囲だけを追加・更新し、既存READMEの残りはbyte単位で保持する
3. `readme-exact-url-repair`
   - `baseSha` が一致し、古いURLが完全一致する場合だけ置換する

固定スクリプト側で必ず検証する条件:

- owner が `HSBL-ko-gyo`
- public
- 非fork、またはポリシーで人間が明示許可し派生元を明記できるfork
- 非archived
- explicit exclusionではない
- 対象READMEのSHAが計画時と一致する
- Descriptionは160文字以内
- Topicsは最大12件、GitHub topicとして妥当な形式
- Homepageは検証できるHTTPS URL
- README管理ブロックは1200文字以内
- 管理ブロック外のREADME、コード、設定、workflowを変更しない
- 1回あたりの件数上限をポリシーから強制する

適用方式:

- Description、Topics、Homepageは `gh` を使って直接更新する。
- READMEは対象リポジトリのdefault branchへ、READMEのみの単独コミットとして直接反映する。
- commit messageはポリシーに従う。
- 個別アクションの失敗は他の安全なアクションを止めず、結果レポートへ記録する。
- dry-runでは差分予定だけを表示し、リモートを一切変更しない。
- 同じ内容を毎週書き換えないよう冪等にする。

明示的に禁止:

- ソースコード、依存関係、設定、workflow、Release、Issue、PRの変更
- repo rename、delete、archive、visibility、default branch、権限、ライセンス変更
- private、fork、archived、他者所有repoの変更
- README全文の自由な書き換え

### 8. 検証

次の npm scripts を用意してください。

- `dev`
- `build`
- `preview`
- `typecheck`
- `lint`
- `test`
- `check` — typecheck, lint, test, content validation をまとめる
- `collect:github`
- `audit:repo-seo`
- `validate:repo-seo-actions`
- `apply:repo-seo`

テスト対象:

- draft が公開出力に出ない
- private/fork を表す入力があっても公開コンテンツへ出ない
- canonical が自サイトを向く
- 全公開作品に固有 title/description がある
- GitHub URL が `HSBL-ko-gyo` 配下である
- リンク切れや必須フィールド欠落をビルド前に検出
- サイトマップに draft が入らない
- SEO actionの対象が public・owner・非fork・非archived に限定される
- README actionは管理ブロック外を変更できない
- baseSha不一致時はREADME actionを拒否する
- dry-runはリモート変更関数を呼ばない
- 件数上限を超えるactionを拒否する
- repo rename/delete/archive/visibility/license等の未許可actionを拒否する

### 9. CIと公開

GitHub Actions は、push/PRで `npm ci`, `npm run check`, `npm run build` を行うCIを作ってください。

Cloudflare Pages は Git 連携で `main` を公開する前提です。Cloudflare API トークンをUNO Qへ置きません。設定手順を `docs/DEPLOYMENT.md` に書いてください。

- Build command: 実装に合わせる
- Output directory: 実装に合わせる
- Production branch: `main`
- Custom domain: `github.hsbl-ko-gyo.com`

DNS、Cloudflare Pagesプロジェクト、Google Sitesは自動変更しません。

### 10. 初期データ

`seed/initial-projects.yml` を読み、`approved` は公開ページとして生成してください。

`review` は人間承認待ちにしません。public GitHubの現物を確認し、用途・自作性・現行性が明確なら公開し、曖昧ならスキップして理由を発掘レポートへ残してください。

説明やリンクは public GitHub の現物を収集して確認してから書き、根拠がない機能を作らないでください。

### 11. 文書

最低限、次を完成させてください。

- `README.md` — サイト概要、ローカル開発、自律更新方法
- `AGENTS.md` — 実装後の正確なコマンドを反映
- `docs/DEPLOYMENT.md`
- `docs/CONTENT_GUIDE.md`
- `docs/AUTOMATION_DESIGN.md`
- `docs/GSITE_INTEGRATION.md`
- `docs/OPERATIONS.md`
- `docs/REPO_SEO_AUTOMATION.md`

### 12. GitHubリポジトリ作成

ローカルで次がすべて成功するまで、GitHubリポジトリを作成しないでください。

- `npm run collect:github`
- `npm run validate:repo-seo-actions`
- `npm run check`
- `npm run build`
- `npm run apply:repo-seo -- --dry-run`

成功後、`HSBL-ko-gyo/hsbl-github-catalog` が存在しない場合だけ、GitHub CLIで public リポジトリとして作成し、`main` を pushしてください。存在する場合は履歴を破壊せず更新してください。

### 13. 完了条件

- 初期公開ページが生成されている。
- 全テスト・ビルドが成功する。
- 週次スクリプトがdry-runで最後まで動く。
- dry-run時に他リポジトリを変更しない。
- systemd timerをインストールできる。
- 通常運転では、人間の承認待ちなしで発掘、公開、SEO改善、記録まで完結する。

作業中に通常判断の確認質問をしないでください。安全境界に抵触する候補は実行せず、残りを完成させてください。
