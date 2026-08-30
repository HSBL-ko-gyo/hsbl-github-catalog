# Google Sites側の組み込み方

## ナビゲーション

Google Sitesの上部メニューに、外部リンクとして次を追加します。

```text
GitHub
→ https://github.hsbl-ko-gyo.com/
```

## トップページ

iframeだけにせず、Google Sitesの通常テキストと通常リンクで次を置きます。

見出し:

```text
GitHub
```

説明文:

```text
ブラウザツール、電子回路設計支援ソフト、実験的なアプリなど、GitHubで公開している制作物をまとめています。
```

ボタン:

```text
GitHub作品一覧を見る
```

代表カードは4〜6件だけ置きます。完全一覧はカタログへ任せます。

推奨代表作:

- MD Table Shot
- EasyEDA to KiCad GUI
- Google Drive PDF Ctrl+Wheel Zoom
- UNO Q Codex Matrix
- 炎添 enso
- ステレオマイク・テスター

## 埋め込み

見た目の補助として一覧を埋め込むのは構いませんが、次を守ります。

- 埋め込みの上に通常リンクを置く
- 主要説明をGoogle Sites側にも短く書く
- 検索用の本文はカタログの静的HTMLに持たせる
- スマートフォンでiframeが窮屈なら埋め込みをやめ、代表カードとリンクだけにする

## ドメイン

`hsbl-ko-gyo.com` のルートをGoogle Sitesへ送る設定と、`github.hsbl-ko-gyo.com` のDNSは別に管理します。

ルート転送を設定する際は、既存のパス配下を一括転送しません。他の公開物を壊さないよう、転送条件は `/` と必要なルート入口だけに限定します。
