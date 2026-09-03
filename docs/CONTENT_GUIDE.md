# 作品コンテンツガイド

## ファイルと公開判定

作品は `src/content/projects/<slug>.md` に一ファイルずつ置きます。Astro Content Collectionの厳格なスキーマと `npm run validate:content` の両方を通します。

掲載条件:

- ownerが `HSBL-ko-gyo` のpublicリポジトリ
- 原則として非fork。明示許可された派生版だけ、fork表記と派生元リンクを必須にして掲載可能
- 非empty、非archived、明示的除外ではない
- 公開READMEなどから用途と自作性を高い確度で説明できる
- 旧版、ミラー、置き場、内部資料ではない

GitHub外のWeb作品は例外として、`config/catalog-policy.yml` の `allowedExternalProjects` に作品URLとハシビロ工業自身の公開記事を明示した場合だけ掲載します。外部ドメインを自動探索せず、一次情報で開発・運営、公開日、サービスURLを確認します。

曖昧な候補はdraftを量産せず、作品ファイルを作らないで発掘レポートへ短い理由を残します。

## 必須frontmatter

```yaml
title: 人が理解できる作品名
slug: stable-lowercase-slug
repo: GitHubの正確なリポジトリ名
summary: カード用の一行説明
description: 用途を含む作品ページH1
category: browser-tool
tags: [用途, 技術]
status: public # public | beta | development | archived
draft: false
featured: false
isFork: false
createdYear: 2026
links:
  github: https://github.com/HSBL-ko-gyo/example
seoTitle: 固有のタイトル | ハシビロ工業 GitHub
seoDescription: 固有の検索説明
searchIntents: [具体的な用途検索]
repoCreatedAt: "2026-01-01T00:00:00Z"
repoUpdatedAt: "2026-01-01T00:00:00Z"
repoPushedAt: "2026-01-01T00:00:00Z"
primaryLanguage: TypeScript # GitHub未判定ならnull
topics: []
sourceEvidence:
  - https://github.com/HSBL-ko-gyo/example/blob/main/README.md
```

`links.app`、`links.release`、`links.article`、`links.shop`、`links.protopedia` は公開情報で確認できるHTTPS URLだけを任意で追加します。`links.protopedia` は `https://protopedia.net/prototype/<ID>` の公開作品URLに限定します。
明示許可されたforkでは `isFork: true` と `forkSourceUrl` を必須にし、本文でも派生元と独自変更の範囲を説明します。

GitHub外の作品は `sourceType: external`、`publishedAt`、`links.app`、`links.article` を必須にし、`repo`、`links.github`、GitHub日時フィールドを持たせません。`links.app` と `links.article` はポリシーの許可値に完全一致させます。

## 本文の書き方

固定の6節は使いません。各作品の内容に合わせ、2〜4個程度のH2を選びます。すべての作品を同じ見出し順にせず、`これ何`、`作った理由`、`使い方`、`中身`、`注意`、`まだできないこと`などから、その作品に必要なものだけを使います。

企業やサービスの紹介文ではなく、本人が自分で作ったものを説明する短い技術メモの温度を保ちます。機能を並べるだけで済む内容は文章で書き、一覧の方が読みやすい場合だけ箇条書きにします。本文は250〜600文字程度を目安にしますが、根拠のない説明で水増ししません。

`だるかったので作った`などの動機は、README、コード、既存資料、本人確認済みの指示に根拠がある場合だけ書きます。同じ口癖を全作品へ散らしません。READMEを丸写しせず、何をするものか、特徴、使う上で重要なこと、制限や注意を一度ずつ伝えます。確認できない機能、性能、対応環境、実績、価格、動機は書きません。

## リンクとSEO

- 「こちら」だけでなく、遷移先と行動が分かるアンカーテキストを使う
- GitHub URLは `https://github.com/HSBL-ko-gyo/<repo>` と完全一致させる
- title、description、H1を作品ごとに固有にする
- 検索語を列挙せず、用途の説明へ自然に含める
- 本番URLが確認できなければ推測せずGitHubだけを案内する
- `draft: true` は公開出力へ一切含めない

## 更新

GitHub作品は収集後、`repoCreatedAt`、`repoUpdatedAt`、`repoPushedAt`、`primaryLanguage`、`topics`、Release / Homepageの事実を同期します。外部作品は一次情報で確認した `publishedAt` を使います。作品一覧は両者の公開日時を合わせた降順です。既に本人文体で書かれた文章を無難な説明文へ戻しません。既存本文を大きく直すのは、事実誤認、リンク切れ、重大な用途不明がある場合だけです。新規作品も既存作品の文体へ合わせます。
