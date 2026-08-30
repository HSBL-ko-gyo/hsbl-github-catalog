# UNO Q 運用開始手順

> 現行の実装済み手順は [`docs/OPERATIONS.md`](OPERATIONS.md) を参照してください。この文書はブートストラップパック由来の導入メモです。

## 1. 必要コマンド

```bash
git --version
gh --version
node --version
npm --version
codex --version
```

## 2. 認証確認

```bash
gh auth status
codex login status
```

GitHubは、カタログリポジトリの作成・main pushと、対象publicリポジトリのメタデータ・README更新ができるアカウントで認証します。Codex認証ファイルとGitHub tokenは、このリポジトリへコピーしません。

## 3. 初回構築

作業ディレクトリでCodexを開き、`CODEX_BOOTSTRAP_PROMPT.md` を渡します。

実装終了後:

```bash
npm ci
npm run collect:github
npm run audit:repo-seo
npm run validate:repo-seo-actions
npm run check
npm run build
npm run apply:repo-seo -- --dry-run
```

## 4. 週次処理のdry-run

```bash
HSBL_CATALOG_DRY_RUN=1 ./automation/run-weekly.sh
```

dry-runでは次を確認できますが、カタログpushも他リポジトリ変更も行いません。

- 新規公開予定ページ
- 既存ページ更新
- Description / Topics / Homepage変更予定
- README管理ブロック変更予定
- checkとbuild結果

人間承認を運用要件にはしません。dry-runは初回導入と自動化改修時の動作確認用です。

## 5. systemd timer

システムのタイムゾーンを確認します。

```bash
timedatectl
sudo timedatectl set-timezone Asia/Tokyo
```

インストール:

```bash
./automation/install-systemd.sh
```

手動起動:

```bash
sudo systemctl start hsbl-github-catalog-discovery.service
```

ログ:

```bash
journalctl -u hsbl-github-catalog-discovery.service -n 200 --no-pager
```

予定確認:

```bash
systemctl list-timers hsbl-github-catalog-discovery.timer --no-pager
```

## 6. 通常運転

週次ジョブは次を自動で行います。

1. public GitHub情報を収集
2. 明確な新規作品をカタログ公開
3. 既存ページを更新
4. 安全なGitHub SEO変更を適用
5. レポートを記録
6. 検証成功後にカタログmainへpush

曖昧な候補は質問せずスキップします。失敗した個別SEO変更はレポートへ残り、他の安全な変更は続行します。

## 7. Cloudflare Pages

mainをCloudflare PagesへGit連携します。API tokenをUNO Qへ置かず、main push後の公開はCloudflare側へ任せます。

## 8. Google Sites

Google Sitesのメニューへ `GitHub` の外部リンクを追加し、トップには代表作とカタログへの通常リンクを置きます。完全一覧をGoogle Sitesへ手作業で複製しません。

## 9. 停止

```bash
sudo systemctl disable --now hsbl-github-catalog-discovery.timer
```

ジョブを止めても公開済みサイトとGitHub変更は残ります。カタログ変更はGit履歴から通常のrevertで戻せます。
