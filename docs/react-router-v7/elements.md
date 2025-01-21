---
title: Markdown Elements
hidden: true
---

# Markdown 要素

これは、存在しうるさまざまな種類の Markdown をすべてテストするためのものです。スタイリングの際に見つかったエッジケースは、すべてこのドキュメントに追加しています。これは、さまざまなコンテキストでスタイルを設定する必要があるさまざまな種類の要素に対する、私の視覚的な回帰テストの形式です。

## 見出し

サイズ 4、5、および 6 の見出しはすべて同じように扱われます。これらの見出しが必要な散文を書き始めたら、私たちの生活を見直すべきです。

# 見出し 1

## 見出し 2

### 見出し 3

#### 見出し 4

##### 見出し 5

###### 見出し 6

## テーブル

| 構文 | 説明 |
| ------ | ----------- |
| 行 1  | 列 2    |
| 行 2  | 列 2    |
| 行 3  | 列 2    |

## コールアウト

コールアウトは `<docs-*>` 要素で使用できます。これらは、ドキュメントの通常の流れの外にある情報に特別な注意を引くためのものです。

これらの要素には、3 つのサポートされているバリエーションがあります。

1. `<docs-info>` - 情報の断片への一般的なコールアウト用。
2. `<docs-warning>` - 読者に知っておくべきことを警告するため。
3. `<docs-error>` - ユーザーに何かをしてはいけないことを伝えるため。

例：

<docs-info>`<Link to>` と `..` は、現在の URL が `/` で終わる場合、通常の `<a href>` とは異なる動作をします。`<Link to>` は末尾のスラッシュを無視し、`..` ごとに 1 つの URL セグメントを削除します。ただし、`<a href>` 値は、現在の URL が `/` で終わる場合とそうでない場合で、`..` を異なる方法で処理します。</docs-info>

<docs-warning>`useMatches` は、[`createBrowserRouter`][createbrowserrouter] のようなデータルーターでのみ機能します。これは、それらが完全なルートツリーを事前に把握しており、現在のすべての一致を提供できるためです。さらに、`useMatches` は、ルーターが子孫ルートを認識していないため、子孫ルートツリーに一致することはありません。</docs-warning>

<docs-error>これをしてはいけません</docs-error>

<docs-info>これのマークアップは少し醜いです。なぜなら、（現在）これらはすべて、改行なしで `<docs-*>` 要素内にある必要があるからです。_しかし_、これらの内部に画像が存在する可能性があります。<img src="https://picsum.photos/480/270" width="480" height="270" /></docs-info>

注：これらのセマンティクスは、必ずしも正しいとは限りません。ドキュメントの場合に意味をなす他の名詞があるかもしれません。例：

- `<docs-info>` は `<docs-tip>` になる可能性があります
- `<docs-warning>` は `<docs-important>` になる可能性があります
- `<docs-error>` は `<docs-warning>` または `<docs-danger>` になる可能性があります

## 引用

これは、複数行とスタイルを含む `<blockquote>` です。

> これは私の引用です。
>
> [リンク]($link)、**太字テキスト**、_斜体テキスト_、さらには `<code>` を含めることができ、これらはすべて考慮する必要があります。ああ、リストも忘れないでください。
>
> - リスト項目 1
> - リスト項目 2
> - リスト項目 3
>
> 順序なし、または順序付き：
>
> 1. リスト項目
> 2. 別のリスト項目
> 3. さらに別のリスト項目

## リスト

これはリンクのリストで、一部はコードです。

- これは私の最初のリスト項目です
- [これはリンクである私の 2 番目のリスト項目です]($link)
- これは、`<code>` と [`<LinkedCode>` がテキストと混ざった 3 番目の項目です]($link)

また、`href` を持たない `<a>` タグの適切なスタイル設定も忘れないでください。<a>ここにあるこのリンクのように</a>。

そして、`<dl>` リストがあります。

<dl>
  <dt>React</dt>
  <dd>何かに反応して、特定の方法で応答または動作する</dd>
  <dt>ルーター</dt>
  <dd>データパケットをコンピューターネットワークの適切な部分に転送するデバイス。</dd>
  <dt>ライブラリ</dt>
  <dd>人々が読んだり、借りたり、参照したりするための書籍、定期刊行物、場合によっては映画や録音された音楽のコレクションを収容する建物または部屋。</dd>
  <dd>一般的に利用可能で、多くの場合、すぐに使用できるようにディスクにロードおよび保存されるプログラムとソフトウェアパッケージのコレクション。</dd>
</dl>

## コード

通常のコード：

```tsx
<WhateverRouter initialEntries={["/events/123"]}>
  <Route path="/" element={<Root />} loader={rootLoader}>
    <Route
      path="events/:id"
      element={<Event />}
      loader={eventLoader}
    />
  </Route>
</WhateverRouter>
```

複数の強調表示された行：

```tsx lines=[1-2,5]
<WhateverRouter initialEntries={["/events/123"]}>
  <Route path="/" element={<Root />} loader={rootLoader}>
    <Route
      path="events/:id"
      element={<Event />}
      loader={eventLoader}
    />
  </Route>
</WhateverRouter>
```

ファイル名付き：

```tsx filename=src/main.jsx
<WhateverRouter initialEntries={["/events/123"]}>
  <Route path="/" element={<Root />} loader={rootLoader}>
    <Route
      path="events/:id"
      element={<Event />}
      loader={eventLoader}
    />
  </Route>
</WhateverRouter>
```

不正なコード：

```tsx bad
<WhateverRouter initialEntries={["/events/123"]}>
  <Route path="/" element={<Root />} loader={rootLoader}>
    <Route
      path="events/:id"
      element={<Event />}
      loader={eventLoader}
    />
  </Route>
</WhateverRouter>
```

強調表示された行とファイル名を含む不正なコード：

```tsx filename=src/main.jsx bad lines=[2-5]
<WhateverRouter initialEntries={["/events/123"]}>
  <Routes>
    <Route path="/" element={<Root />} loader={rootLoader}>
      <Route
        path="events/:id"
        element={<Event />}
        loader={eventLoader}
      />
    </Route>
  </Routes>
</WhateverRouter>
```

オーバーフローする行：

```html
<!-- アプリのその他の HTML はここにあります -->
<!-- prettier-ignore -->
<script src="https://unpkg.com/react@>=16.8/umd/react.development.js" crossorigin></script>
```

---

[$link]: https://www.youtube.com/watch?v=dQw4w9WgXcQ
[createbrowserrouter]: ./routers/create-browser-router

