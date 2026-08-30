# GitHubリポジトリSEO自動化

## 境界

Codexは `data/github/**` のローカル収集データから監査と変更計画だけを作ります。GitHubへの取得・更新は固定スクリプトだけが行います。

許可actionは3種類です。

- `repository-metadata`: Description、Topics、Homepage
- `readme-managed-intro`: 指定マーカー内の導入ブロック
- `readme-exact-url-repair`: base SHA付きの完全一致URL置換

rename、delete、archive、visibility、default branch、permission、license、ソース、依存関係、設定、workflow、Release、Issue、PRはJSON Schemaで表現できません。

## 監査と計画

```bash
npm run audit:repo-seo
npm run validate:repo-seo-actions
```

生成物:

- `reports/repo-seo/<repo>.md`
- `data/actions/repo-seo-actions.json`
- `reports/discovery/<date>.md` と `latest.md`

計画は `schemas/repo-seo-actions.schema.json` と追加の意味検証を通します。

## 固定検証

各actionについて次を確認します。

- ownerが `HSBL-ko-gyo`
- public、非fork、非archived、非empty、明示的除外ではない
- Descriptionは160文字以内
- Topicsは最大12件でtopic形式に合い、決定的にソート済み
- Homepageは収集メタデータまたは作品の `links` / `sourceEvidence` で裏付けられたHTTPS URL
- README pathとbase SHAが収集結果に一致
- READMEキャッシュのGit blob SHAもbase SHAに一致
- 管理ブロックは1200文字以内でマーカーが一組
- 完全一致URLの置換元はREADMEに一度だけ存在
- README actionは一リポジトリ一件
- ポリシーの実行件数上限以内
- 現状と同じ内容を書き直さない

## dry-run

```bash
npm run apply:repo-seo -- --dry-run
```

dry-runは全ローカル検証を行いますが、`gh auth status` を含むリモート関数を一切呼びません。予定を `reports/repo-seo-applied/<date>.md` と `latest.md` へ記録します。

## 実適用

```bash
npm run apply:repo-seo
```

実適用直前に `gh api` でowner、visibility、fork、archived、default branchを再取得します。メタデータはGitHub APIへ直接反映し、READMEはリモートSHAが計画時と一致した場合だけREADME単独コミットで更新します。

管理ブロック外の既存README文字列は保持します。既存マーカーがある場合は開始から終了までだけを置換し、マーカーがない場合は既存READMEを残したまま短いブロックを挿入します。

一つのactionが失敗しても他の安全なactionを続行し、結果をレポートへ記録します。認証自体がない場合は適用開始前に失敗します。
