# GitHubとカタログの検索流入を増やすルール

## 二つの検索入口を作る

1. カタログの作品ページが、具体的な困りごと・用途の検索で見つかる。
2. GitHubリポジトリ自体が、製品名・技術名・用途の検索で見つかる。

カタログはREADMEのコピーではなく、利用者の言葉で入口を作ります。GitHubは実装、使い方、Release、ライセンスの一次情報を強化します。

## 作品ページ

推奨タイトル形式:

```text
Markdownの表をPNG画像に変換する「MD Table Shot」 | ハシビロ工業 GitHub
```

推奨H1:

```text
Markdownの表をPNG画像へ変換するWebツール
```

本文へ自然に含める情報:

- 何を入力するか
- 何が出力されるか
- ブラウザ、Windows、KiCadなどの対象環境
- 解決する不便
- データを外部送信するか
- インストールが必要か
- 本番アプリ、Release、GitHubの違い

リンク文言の例:

- `MD Table Shotをブラウザで使う`
- `MD Table ShotのソースコードをGitHubで見る`
- `EasyEDA to KiCad GUIのWindows版をダウンロードする`

避けるもの:

- 「こちら」だけのリンク
- 同じ検索語の反復
- 実態のない「最強」「高性能」「完全対応」
- README全文の転載
- 他作品とほぼ同じdescription

## 技術SEO

- 各ページに固有のtitle, description, canonical
- canonicalはカタログ自身
- OGP画像がない場合も共通画像へ安全にフォールバック
- 一覧から全公開ページへ通常リンク
- JavaScript実行なしでも主要本文とリンクが読める静的HTML
- sitemapには公開ページだけ
- draftはビルドしない
- 404や後継ページを適切に扱う
- URLは短く、slugを後から頻繁に変えない

## 構造化データ

Webツールには `SoftwareApplication` または `WebApplication`、ハードウェア作品や展示作品には `CreativeWork` を検討します。実在しない価格、評価、OS、配布形態を埋めません。

## GitHub Description

Descriptionは、リポジトリ名を言い換えるだけでなく用途を一文で説明します。

悪い例:

```text
Web tool
```

良い例:

```text
Markdownの表をPNG画像へ変換する、ブラウザ完結型のWebツール
```

ルール:

- 160文字以内
- 公開情報で確認できる事実だけ
- 日本語を主にし、英語が必要なら短く補助
- キーワード列挙にしない
- 「公式」「完全対応」など誤認を招く表現を使わない

## GitHub Topics

技術名と用途を組み合わせ、最大12件程度に絞ります。

例:

```text
markdown
markdown-table
png
image-export
browser-tool
typescript
```

似た語を大量に並べず、実装または用途と直接関係するものだけを使います。

## Homepage

優先順位:

1. 実際に使える本番アプリ
2. Releaseページ
3. 製品・販売ページ
4. カタログの個別紹介ページ

HTTPSで到達可能と確認できるURLだけを設定します。

## README管理ブロック

README全体を自動で書き換えません。検索入口が弱い場合だけ、次の管理ブロックを追加または更新します。

```md
<!-- hsbl-catalog:seo-start -->
短い日本語説明、対象環境、主要リンク
<!-- hsbl-catalog:seo-end -->
```

ルール:

- 1200文字以内
- 既存タイトル、badge、本文、ライセンス表記を壊さない
- 「何ができるか」を最初に書く
- 本番アプリ、Release、カタログへの具体的なリンクを置く
- 既存READMEと同じ説明を冗長に繰り返さない
- 同じブロック内容ならコミットしない
- 管理ブロック外を変更しない

## 明白なURL修正

`YOUR_USERNAME`、移行済み旧URL、タイプミスなど、正しいURLが公開情報から一意に確認できるものだけ対象にします。

- 計画時のREADME SHAを持つ
- 適用時にSHAが一致しなければスキップ
- 古い文字列が完全一致する時だけ置換
- 本文の意味やコード例は変更しない

## 自律適用の境界

自動適用してよい:

- Description
- Topics
- Homepage
- README管理ブロック
- 完全一致URL修正

自動適用しない:

- ソースコード、依存関係、設定、workflow
- README全文の自由編集
- repo rename、delete、archive、visibility、default branch、権限、ライセンス
- Release、Issue、PR
- private、fork、archived、他者所有repo

すべて固定スクリプトで再検証し、Codexが生成した文字列をそのまま無条件実行しません。
