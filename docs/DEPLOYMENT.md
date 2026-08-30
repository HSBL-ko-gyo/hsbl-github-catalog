# GitHub Pagesへの公開

このサイトはAstroの静的出力 `dist` をGitHub Actionsでビルドし、GitHub Pagesへ公開します。本番URLは <https://github.hsbl-ko-gyo.com/>、DNSはAWS Route 53の `hsbl-ko-gyo.com` Public Hosted Zoneで管理します。

## 事前検証

Node.js 24以上で次を実行します。

```bash
npm ci
npm run check
npm run build
```

`dist/index.html`、`dist/sitemap.xml`、`dist/robots.txt` が生成されることを確認します。公開内容は `main` へpushされたコミットだけです。

## GitHub Pages

`.github/workflows/pages.yml` は `main` へのpushで次を行います。

1. Node.js 24で依存関係を導入する
2. Astroをビルドする
3. `dist` をGitHub Pages artifactとしてアップロードする
4. `github-pages` environmentへデプロイする

既存の `.github/workflows/ci.yml` は独立してcheckとbuildを継続します。Pagesのpublishing sourceは **GitHub Actions**、custom domainは `github.hsbl-ko-gyo.com` に設定します。custom workflowではリポジトリ内の `CNAME` ファイルは不要です。

GitHub CLIで状態を確認する場合:

```bash
gh api repos/HSBL-ko-gyo/hsbl-github-catalog/pages
gh run list --repo HSBL-ko-gyo/hsbl-github-catalog --workflow pages.yml
```

## Route 53

変更前に、`hsbl-ko-gyo.com.` と完全一致するPublic Hosted Zoneを特定し、そのHosted ZoneのNSが公開DNSの権威NSと一致することを確認します。一致しないHosted Zoneへレコードを追加しても本番DNSには反映されないため、その場合は変更せず委任状態を解決します。

変更対象は次の1レコードだけです。

| 名前 | タイプ | 値 | TTL |
| --- | --- | --- | --- |
| `github.hsbl-ko-gyo.com.` | `CNAME` | `HSBL-ko-gyo.github.io.` | `300` |

同名の既存レコードが別サービスを指す場合は上書きしません。ルートドメイン、他のサブドメイン、Hosted Zone自体は変更しません。

読み取り確認には次を使います。

```bash
aws route53 list-hosted-zones-by-name --dns-name hsbl-ko-gyo.com
aws route53 list-resource-record-sets \
  --hosted-zone-id <EXACT_PUBLIC_HOSTED_ZONE_ID> \
  --query "ResourceRecordSets[?Name == 'github.hsbl-ko-gyo.com.']"
```

## HTTPS

DNS反映後、GitHub Pagesがカスタムドメインの証明書を発行したら **Enforce HTTPS** を有効にします。証明書の発行には時間がかかることがあるため、待機中はDNSやPagesを別構成へ切り替えません。

## 公開後の確認

```bash
curl -I https://github.hsbl-ko-gyo.com/
curl -I https://github.hsbl-ko-gyo.com/robots.txt
curl -I https://github.hsbl-ko-gyo.com/sitemap.xml
```

あわせて次を確認します。

- 3 URLがHTTPSで200を返す
- トップのcanonicalが `https://github.hsbl-ko-gyo.com/` を向く
- GitHub Pages deploymentが成功している
- GitHubリポジトリのHomepageが本番URLを向く
- sitemapにdraftや未掲載リポジトリがない
- git worktreeがcleanである

デプロイ失敗時はGitHub Actionsのbuild/deployログを確認し、`main` をforce pushしません。問題のコミットは通常の `git revert` で戻します。
