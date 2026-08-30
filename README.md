# ハシビロ工業 GitHub 作品カタログ

`HSBL-ko-gyo` がGitHubで公開しているブラウザツール、電子回路設計支援ソフト、Webアプリ、電子工作を、用途から探せる日本語中心の静的カタログです。

- 本番URL: <https://github.hsbl-ko-gyo.com/>
- GitHubプロフィール: <https://github.com/HSBL-ko-gyo>
- 構成: Astro + TypeScript、静的出力のみ
- 公開: GitHub Actionsで `main` をビルドし、GitHub Pagesへデプロイ

READMEの転載サイトではありません。各作品ページは「何ができるか」「いつ使うか」「入力・出力・対象環境」を公開情報から整理し、本番アプリ、Release、販売ページ、GitHubへ役割が分かるリンクを置きます。

## 主なページ

- `/` — キーワード検索、カテゴリ・状態絞り込み付き作品一覧
- `/projects/<slug>/` — 作品ごとの独立した紹介
- `/categories/<slug>/` — カテゴリ別一覧
- `/about/` — 掲載基準と更新方針
- `/robots.txt`、`/sitemap.xml`、`/404.html`

## 必要環境

- Node.js 24以上（UNO Qでは `/home/arduino/.local/bin` をPATHへ追加）
- npm 11以上
- 公開GitHub情報を更新する場合は外部HTTPSへ接続できること
- リモートSEO適用と初回リポジトリ作成には、`HSBL-ko-gyo` を更新できる `gh` 認証
- 週次自律処理には、ログイン済みCodex CLI

秘密値や認証ファイルをこのリポジトリへ置かないでください。

## ローカル開発

```bash
export PATH="$HOME/.local/bin:$PATH"
npm ci
npm run dev
```

静的ビルドとプレビュー:

```bash
npm run check
npm run build
npm run preview
```

GitHub Pagesへアップロードする静的出力ディレクトリは `dist` です。

## 公開GitHubデータの収集

```bash
npm run collect:github
```

固定スクリプトが `GET /users/HSBL-ko-gyo/repos?type=public` を起点に、owner一致・public・非forkだけを正規化します。候補READMEだけを `data/github/readmes/` へ保存し、APIレスポンス、認証情報、HTTPヘッダーは保存しません。失敗時は既存データを置き換えません。

## GitHub SEO監査と安全な適用

```bash
npm run audit:repo-seo
npm run validate:repo-seo-actions
npm run apply:repo-seo -- --dry-run
```

実適用は次のコマンドです。対象はpublic・owner一致・非fork・非archived・非除外に限定されます。

```bash
npm run apply:repo-seo
```

許可されるのはDescription、Topics、Homepage、README管理ブロック、base SHA付き完全一致URL修正だけです。dry-runは認証確認を含むリモート関数を呼びません。詳細は [docs/REPO_SEO_AUTOMATION.md](docs/REPO_SEO_AUTOMATION.md) を参照してください。

## 作品コンテンツ

作品ごとに `src/content/projects/*.md` を一ファイル置きます。`draft: true` は一覧、カテゴリ、個別ページ、内部リンク、サイトマップへ出力されません。必要フィールドと文章ルールは [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) にまとめています。

## 週次自律更新

通常のdry-run:

```bash
HSBL_CATALOG_DRY_RUN=1 ./automation/run-weekly.sh
```

GitHub APIの連続実行を避け、既存の公開収集データでローカル動作だけを確認する場合:

```bash
HSBL_CATALOG_DRY_RUN=1 HSBL_CATALOG_SKIP_COLLECT=1 ./automation/run-weekly.sh
```

dry-runは他リポジトリもカタログ `main` も変更しません。実運転では検証成功後だけ安全なSEOアクションを適用し、差分がある場合だけ1コミットを `main` へpushします。運用手順は [docs/OPERATIONS.md](docs/OPERATIONS.md)、設計は [docs/AUTOMATION_DESIGN.md](docs/AUTOMATION_DESIGN.md) を参照してください。

systemd定義の非変更検証:

```bash
./automation/install-systemd.sh --dry-run
```

実際の登録は `./automation/install-systemd.sh` です。sudoを使って毎週日曜05:20 JSTのtimerを有効化します。

## 完全検証

初回公開または自動化変更前は、次をすべて成功させます。

```bash
npm ci
npm run collect:github
npm run audit:repo-seo
npm run validate:repo-seo-actions
npm run check
npm run build
npm run apply:repo-seo -- --dry-run
./automation/install-systemd.sh --dry-run
```

GitHub PagesとRoute 53の公開設定は [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)、Google Sites側の案内は [docs/GSITE_INTEGRATION.md](docs/GSITE_INTEGRATION.md) を参照してください。
