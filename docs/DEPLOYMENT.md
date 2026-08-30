# Cloudflare Pagesへの公開

このサイトはAstroの静的出力 `dist` を、Cloudflare PagesのGit連携で公開します。UNO QへCloudflare API tokenを置かず、CLIからCloudflare設定を変更しません。

## 事前検証

```bash
npm ci
npm run check
npm run build
```

`dist/index.html`、`dist/sitemap.xml`、`dist/robots.txt` が生成されることを確認します。公開内容は `main` へpushされたコミットだけです。

## Pagesプロジェクト

Cloudflare Dashboardの **Workers & Pages → Create → Pages → Connect to Git** から `HSBL-ko-gyo/hsbl-github-catalog` を接続します。

| 設定 | 値 |
| --- | --- |
| Framework preset | Astro |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js | 24 |

環境変数でNodeを指定する必要がある画面では `NODE_VERSION=24` を設定します。サイトのビルドにはGitHub tokenやCloudflare API tokenは不要です。

## カスタムドメイン

Pagesプロジェクトの **Custom domains** から `github.hsbl-ko-gyo.com` を追加します。DNSがCloudflare管理下なら案内に従ってCNAMEを作成します。この操作は手動です。

既存のルートドメインやGoogle Sites向け設定を一括転送・変更しません。`github` サブドメインだけをPagesへ向けます。

## 公開後の確認

```bash
curl -I https://github.hsbl-ko-gyo.com/
curl https://github.hsbl-ko-gyo.com/robots.txt
curl https://github.hsbl-ko-gyo.com/sitemap.xml
```

あわせて次を確認します。

- トップから全公開作品へ通常のリンクで到達できる
- 作品ページのcanonicalが自ページを向く
- 404ページが返る
- sitemapにdraftや未掲載リポジトリがない
- スマートフォン幅でカードとナビゲーションが横にはみ出さない

デプロイ失敗時はCloudflare側のビルドログを確認し、`main` をforce pushしません。問題のコミットは通常の `git revert` で戻します。
