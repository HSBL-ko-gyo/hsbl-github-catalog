# UNO Qでの運用

## 実行環境

UNO QではNode.js、npm、gh、Codex CLIをユーザー領域へ置けます。systemdインストーラーと週次スクリプトは `$HOME/.local/bin` をPATHの先頭へ追加します。

```bash
export PATH="$HOME/.local/bin:$PATH"
node --version
npm --version
gh --version
codex --version
codex login status
gh auth status --hostname github.com
```

認証値や設定ファイルの中身は表示・保存しません。

## 初回検証

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

GitHub APIの未認証レート制限内で同じ収集を続けて試さないでください。収集済みデータで週次処理のローカル動作だけを確認する場合は次を使います。

```bash
HSBL_CATALOG_DRY_RUN=1 HSBL_CATALOG_SKIP_COLLECT=1 ./automation/run-weekly.sh
```

このモードでもCodex、action検証、check、build、SEO apply dry-runは実行します。外部リポジトリとカタログmainは変更しません。

## systemd timer

定義検証:

```bash
./automation/install-systemd.sh --dry-run
```

登録:

```bash
./automation/install-systemd.sh
```

timerは毎週日曜05:20 JSTに実行し、最大20分のランダム遅延を加えます。`Persistent=true` により停止中に逃した回は次回起動後に一度実行されます。

```bash
systemctl list-timers hsbl-github-catalog-discovery.timer --no-pager
sudo systemctl start hsbl-github-catalog-discovery.service
journalctl -u hsbl-github-catalog-discovery.service -n 200 --no-pager
```

## 通常の週次処理

1. cleanなmainをfast-forwardで更新
2. public・非forkと明示許可forkのGitHub情報を固定スクリプトで収集
3. Codexをworkspace-write・ネットワークなしで実行
4. action schema、対象、SHA、件数上限を検証
5. checkとbuild
6. 安全なGitHub SEO actionを固定スクリプトで適用
7. 再度checkとbuild
8. 差分がある場合だけ1コミットをmainへpush

force push、破壊的cleanup、PR承認待ちは行いません。

## 障害対応

- 収集失敗: 既存データと公開ページを保持し、リモート変更前に終了
- Codex / action検証 / build失敗: リモートSEO適用とmain pushを行わない
- README SHA不一致: そのREADME actionだけスキップ
- 個別action失敗: レポートへ記録し、他の安全なactionを続行
- main競合: force pushせず終了

カタログ変更は通常の `git revert <commit>` で戻します。他リポジトリのREADME変更もREADMEだけの単独コミットなので、そのリポジトリで通常のrevertが可能です。

## 停止

```bash
sudo systemctl disable --now hsbl-github-catalog-discovery.timer
```

停止しても公開済みサイトと過去のGitHub変更は残ります。
