# ProtoPedia無人投稿

## 構成

ASH READと同じく、認証済みブラウザプロファイル、実行時ログ、試行記録をリポジトリ外へ置き、user systemdの週次ジョブから直接実行します。ASH READの運用外枠を共用しつつ、ProtoPediaの画面操作はCodexプロンプトではなく `scripts/publish-protopedia.ts` に固定したPlaywright処理です。

- 入力: `data/actions/protopedia-submissions.json`
- 成功台帳: `data/protopedia/publication-state.json`
- 共用画像: `public/images/projects/<slug>.png`（880×495）
- CDP: `http://127.0.0.1:9222`（既定）
- 外部設定: `~/.config/hsbl-github-catalog/automation.env`（0600）
- 外部状態: `~/.local/state/hsbl-github-catalog/protopedia/`（attempt、JSONLログ、lock）
- 外部プロファイル: `~/.local/share/ashread/chromium-profile/`

Cookie、認証情報、ブラウザプロファイル、実行時ログはリポジトリへ保存しません。

## 初回だけ必要な認証

永続プロファイルへ一度だけProtoPediaログインを作ります。通常ChromeのCookieを読み出したりコピーしたりはしません。

```bash
./automation/protopedia-auth-bootstrap.sh
```

表示されたブラウザでログインし、作品管理画面が開くことを確認してブラウザを閉じます。スクリプトは一時停止した `ashread-chromium.service` を終了時に戻します。以後の週次投稿にはGUI操作もCodex対話も不要です。

## 投稿処理

```bash
npm run capture:thumbnails
npm run prepare:protopedia
npm run validate:protopedia-actions
npm run publish:protopedia -- --dry-run
npm run publish:protopedia
```

実投稿は次の順で進みます。

1. 永続プロファイルのログイン状態を確認する。
2. 自分の既存作品を列挙し、タイトルと公式URLを照合する。
3. 同一作品があれば再投稿せず、結果不明だった試行として回収する。
4. attemptを外部状態ディレクトリへ保存する。
5. フォーム入力、PNGアップロード、公開指定を行い、登録・更新を1回だけ押す。
6. 公開ページを再読込し、作品ID、タイトル、公式URLを確認する。
7. 成功確認後だけ台帳とfrontmatterを更新する。

タイトルまたは公式URLの片方だけが既存作品と一致した場合は、自動判断せず衝突として停止します。

## 失敗と再試行

- 送信前の失敗: 台帳を更新せず、同じキューを次回再試行する。
- 送信開始後の不明: `uncertain` attemptだけを外部へ残す。次回は投稿前の既存照合で成功済みか確認する。
- 公開ページ検証失敗: 台帳を更新しない。
- CDP停止またはログアウト: キューを保持したまま非0終了する。
- 公開確認成功: 台帳を更新し、キュー再生成で対象を除く。

週次ジョブはカタログとキューを先にpushし、ProtoPedia成功後の台帳を別コミットでpushします。これにより、外部投稿が失敗しても再試行可能なキューがmainに残ります。
