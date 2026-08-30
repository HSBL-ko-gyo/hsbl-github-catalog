# GitHub Pagesへの公開

このサイトはAstroの静的出力 `dist` をGitHub Actionsでビルドし、GitHub Pagesへ公開します。本番URLは <https://github.hsbl-ko-gyo.com/> です。`hsbl-ko-gyo.com` の公開DNSはCloudflareが権威を持ち、AWS Route 53にも同名のPublic Hosted Zoneがあります。公開に使うCNAMEはCloudflareへ設定し、Route 53にも同じ値を保持します。

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

## DNS（CloudflareとRoute 53）

変更前に公開DNSの権威NSを確認します。現在の権威NSはCloudflareであり、Route 53の `hsbl-ko-gyo.com.` Public Hosted Zoneは公開委任先ではありません。このため、Route 53だけを変更しても本番DNSには反映されません。レジストラの委任やルートドメインは変更せず、公開用のCloudflareゾーンとRoute 53の正確なHosted Zoneに同じCNAMEを設定します。

変更対象は両方のDNSサービスで次の1レコードだけです。Cloudflareでは証明書発行を妨げないよう **DNSのみ**（プロキシ無効）にします。

| DNS | 名前 | タイプ | 値 | TTL | Cloudflareプロキシ |
| --- | --- | --- | --- | --- | --- |
| Cloudflare | `github.hsbl-ko-gyo.com.` | `CNAME` | `HSBL-ko-gyo.github.io.` | `300` | DNSのみ |
| Route 53 | `github.hsbl-ko-gyo.com.` | `CNAME` | `HSBL-ko-gyo.github.io.` | `300` | 対象外 |

同名の既存レコードが別サービスを指す場合は上書きしません。ルートドメイン、他のサブドメイン、Hosted Zone自体は変更しません。

公開DNSはCloudflareのダッシュボードと公開リゾルバで確認します。Route 53の読み取り確認には次を使います。

```bash
aws route53 list-hosted-zones-by-name --dns-name hsbl-ko-gyo.com
aws route53 list-resource-record-sets \
  --hosted-zone-id <EXACT_PUBLIC_HOSTED_ZONE_ID> \
  --query "ResourceRecordSets[?Name == 'github.hsbl-ko-gyo.com.']"
```

公開リゾルバで `github.hsbl-ko-gyo.com.` が `HSBL-ko-gyo.github.io.` を返すことを確認します。Route 53のレコードが正しくても公開リゾルバが返さない場合は、権威DNS側のCloudflareレコードを確認します。

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
