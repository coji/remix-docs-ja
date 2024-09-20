---
title: Markdown 要素
hidden: true
---

# Markdown 要素

これは、存在する可能性のあるあらゆる種類のマークダウンをテストするためのものです。スタイリングの境界ケースが見つかるたびに、このドキュメントに追加します。これは、さまざまなコンテキストでスタイルを設定する必要があるさまざまな種類の要素に対する、私のビジュアル回帰の一種です。

## 見出し

サイズ 4、5、および 6 の見出しはすべて同じように扱われます。これらの見出しが必要な散文を書き始めたら、人生を再評価する必要があります。

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

コールアウトは、`<docs-*>`要素で使用できます。これらは、ドキュメントの通常のフローの外にある情報の断片に特別な注意を呼びかけるために、特に使用されます。

これらの要素には、3 つのサポートされているバリエーションがあります。

1. `<docs-info>` - 情報の断片に関する一般的なコールアウト用。
2. `<docs-warning>` - 読者に、彼らが知っておくべきことの警告用。
3. `<docs-error>` - ユーザーに、何かをしてはいけないことを伝えるため。

例：

<docs-info>`<Link to>` with a `..` behaves differently from a normal `<a href>` when the current URL ends with `/`. `<Link to>` ignores the trailing slash, and removes one URL segment for each `..`. But an `<a href>` value handles `..` differently when the current URL ends with `/` vs when it does not.</docs-info>

<docs-warning>`useMatches` only works with a data router like [`createBrowserRouter`][createbrowserrouter], since they know the full route tree up front and can provide all of the current matches. Additionally, `useMatches` will not match down into any descendant route trees since the router isn't aware of the descendant routes.</docs-warning>

<docs-error>Do not do this</docs-error>

<docs-info>The markup for this is kind of ugly, because (currently) these all have to be inside the `<docs-*>` element without any line breaks _but_ it is possible there could be an image inside these. <img src="https://picsum.photos/480/270" width="480" height="270" /></docs-info>

注：これらの意味は必ずしも正しいとは限りません。ドキュメントの場合、意味が通る名詞が他にいくつかあるかもしれません。

- `<docs-info>` は `<docs-tip>` になる可能性があります
- `<docs-warning>` は `<docs-important>` になる可能性があります
- `<docs-error>` は `<docs-warning>` または `<docs-danger>` になる可能性があります

## 引用

これは、複数の行とスタイルを含む `<blockquote>` です。

> これは私の引用です。
>
> [リンク]($link)、**太字テキスト**、_イタリックテキスト_、さらには `<code>` も含めることができます。これらのすべてが考慮されるはずです。そして、リストを忘れないでください。
>
> - リスト項目 1
> - リスト項目 2
> - リスト項目 3
>
> 順序なし、または順序あり：
>
> 1. リスト項目
> 2. 別のリスト項目
> 3. もう1つのリスト項目

## リスト

これは、いくつかのコードがリンクされたリストです。

- これは私の最初のリスト項目です
- [これはリンクになっている2番目のリスト項目です][$link]
- これは、`<code>` と [`<LinkedCode>` がテキストと混ざっている3番目の項目です][$link]

そして、`href` がない `<a>` タグの適切なスタイリングを忘れないでください。 <a>このリンクのように</a>。

そして、`<dl>` リストがあります。

<dl>
  <dt>React</dt>
  <dd>何かに対して特定の方法で応答または行動する</dd>
  <dt>Router</dt>
  <dd>コンピューターネットワークの適切な部分にデータパケットを転送するデバイス。</dd>
  <dt>Library</dt>
  <dd>人々が読み、借りたり、参照したりするための本のコレクション、定期刊行物、時には映画や録音された音楽を含む建物または部屋。</dd>
  <dd>一般に公開されているプログラムとソフトウェアパッケージのコレクション。通常は、すぐに使用できるようにディスクにロードして保存します。</dd>
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

悪いコード：

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

強調表示された行とファイル名を持つ悪いコード：

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
<!-- Other HTML for your app goes here -->
<!-- prettier-ignore -->
<script src="https://unpkg.com/react@>=16.8/umd/react.development.js" crossorigin></script>
```

---

[$link]: https://www.youtube.com/watch?v=dQw4w9WgXcQ
[createbrowserrouter]: ./routers/create-browser-router



