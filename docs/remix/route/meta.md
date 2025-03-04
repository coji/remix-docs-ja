---
title: meta
---

# `meta`

`meta` エクスポートを使用すると、アプリ内のすべてのルートに対してメタデータ HTML タグを追加できます。これらのタグは、検索エンジン最適化 (SEO) や、特定の動作を決定するためのブラウザディレクティブなど、さまざまな点で重要です。また、ソーシャルメディアサイトでアプリのリッチプレビューを表示するためにも使用できます。

`meta` 関数は、`MetaDescriptor` オブジェクトの配列を返す必要があります。これらのオブジェクトは、HTML タグと 1 対 1 で対応します。したがって、次の `meta` 関数は、

```tsx
export const meta: MetaFunction = () => {
  return [
    { title: "非常にクールなアプリ | Remix" },
    {
      property: "og:title",
      content: "非常にクールなアプリ",
    },
    {
      name: "description",
      content: "このアプリは最高です",
    },
  ];
};
```

次の HTML を生成します。

```html
<title>非常にクールなアプリ | Remix</title>
<meta property="og:title" content="非常にクールなアプリ" />;
<meta name="description" content="このアプリは最高です" />
```

デフォルトでは、メタ記述子はほとんどの場合、[`<meta>` タグ][meta-element] をレンダリングします。ただし、次の 2 つの例外があります。

- `{ title }` は `<title>` タグをレンダリングします。
- `{ "script:ld+json" }` は `<script type="application/ld+json">` タグをレンダリングし、その値はシリアライズ可能なオブジェクトである必要があり、文字列化されてタグに挿入されます。

```tsx
export const meta: MetaFunction = () => {
  return [
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Remix",
        url: "https://remix.run",
      },
    },
  ];
};
```

メタ記述子は、`tagName` プロパティを `"link"` に設定することで、[`<link>` タグ][link-element] をレンダリングすることもできます。これは、`canonical` URL のような SEO に関連付けられた `<link>` タグに役立ちます。スタイルシートやファビコンなどのアセットリンクには、代わりに [`links` エクスポート][links] を使用する必要があります。

```tsx
export const meta: MetaFunction = () => {
  return [
    {
      tagName: "link",
      rel: "canonical",
      href: "https://remix.run",
    },
  ];
};
```

## `meta` 関数のパラメータ

### `location`

これは、現在のルーターの `Location` オブジェクトです。これは、特定のパスまたはクエリパラメータのルートのタグを生成するのに役立ちます。

```tsx
export const meta: MetaFunction = ({ location }) => {
  const searchQuery = new URLSearchParams(
    location.search
  ).get("q");
  return [{ title: `"${searchQuery}" の検索結果` }];
};
```

### `matches`

これは、現在のルートマッチの配列です。多くのもの、特に親マッチからのメタデータとデータにアクセスできます。

`matches` のインターフェースは、[`useMatches`][use-matches] の戻り値に似ていますが、各マッチにはその `meta` 関数の出力が含まれます。これは、[ルート階層全体でメタデータをマージする][merging-metadata-across-the-route-hierarchy]のに役立ちます。

### `data`

これは、ルートの [`loader`][loader] からのデータです。

```tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  return json({
    task: await getTask(params.projectId, params.taskId),
  });
}

export const meta: MetaFunction<typeof loader> = ({
  data,
}) => {
  return [{ title: data.task.name }];
};
```

### `params`

ルートの URL パラメータ。[ルーティングガイドの動的セグメント][url-params]を参照してください。

### `error`

エラー境界をトリガーするスローされたエラーは、`meta` 関数に渡されます。これは、エラーページのメタデータを生成するのに役立ちます。

```tsx
export const meta: MetaFunction = ({ error }) => {
  return [{ title: error ? "おっと!" : "実際のタイトル" }];
};
```

## 親ルートローダーからのデータへのアクセス

現在のルートのデータに加えて、多くの場合、ルート階層の上位にあるルートからのデータにアクセスする必要があります。[`matches`][matches] でルート ID で検索できます。

```tsx filename=app/routes/project.$pid.tasks.$tid.tsx
import type { loader as projectDetailsLoader } from "./project.$pid";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  return json({ task: await getTask(params.tid) });
}

export const meta: MetaFunction<
  typeof loader,
  { "routes/project.$pid": typeof projectDetailsLoader }
> = ({ data, matches }) => {
  const project = matches.find(
    (match) => match.id === "routes/project.$pid"
  ).data.project;
  const task = data.task;
  return [{ title: `${project.name}: ${task.name}` }];
};
```

## `meta` とネストされたルートに関する注意点

複数のネストされたルートが同時にレンダリングされるため、最終的にレンダリングされるメタタグを決定するために、いくつかのマージを行う必要があります。Remix は、明らかなデフォルトがないため、このマージを完全に制御できます。

Remix は、`meta` エクスポートを持つ最後に一致したルートを取得して使用します。これにより、`title` のようなものをオーバーライドしたり、親ルートが追加した `og:image` のようなものを削除したり、親からのすべてを保持して子ルートの新しいメタを追加したりできます。

これは、慣れていないと非常に複雑になる可能性があります。

`/projects/123` のようなルートを考えてみましょう。おそらく、`app/root.tsx`、`app/routes/projects.tsx`、および `app/routes/projects.$id.tsx` の 3 つの一致するルートがあります。3 つすべてがメタ記述子をエクスポートする可能性があります。

```tsx bad filename=app/root.tsx
export const meta: MetaFunction = () => {
  return [
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1",
    },
    { title: "新しい Remix アプリ" },
  ];
};
```

```tsx bad filename=app/routes/projects.tsx
export const meta: MetaFunction = () => {
  return [{ title: "プロジェクト" }];
};
```

```tsx bad filename=app/routes/projects.$id.tsx
export const meta: MetaFunction<typeof loader> = ({
  data,
}) => {
  return [{ title: data.project.name }];
};
```

このコードでは、`/projects` および `/projects/123` で `viewport` メタタグが失われます。これは、最後のメタのみが使用され、コードが親とマージされないためです。

### グローバル `meta`

ほぼすべてのアプリには、`viewport` や `charSet` のようなグローバルメタがあります。`meta` エクスポートの代わりに、[ルートルート][root-route] 内で通常の [`<meta>` タグ][meta-element] を使用することをお勧めします。これにより、マージを処理する必要がなくなります。

```tsx filename=app/root.tsx lines=[12-16]
import {
  Links,
  Meta,
  Outlet,
  Scripts,
} from "@remix-run/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

### 親ルートでの `meta` の回避

親ルートからオーバーライドしたい `meta` をエクスポートしないことで、マージの問題を回避することもできます。親ルートで `meta` を定義する代わりに、[インデックスルート][index-route] を使用します。これにより、タイトルのようなものの複雑なマージロジックを回避できます。それ以外の場合は、親のタイトル記述子を見つけて、子タイトルに置き換える必要があります。インデックスルートを使用することで、オーバーライドする必要がないようにする方がはるかに簡単です。

### 親 `meta` とのマージ

通常、親がすでに定義しているものに `meta` を追加するだけで済みます。スプレッド演算子と [`matches`][matches] 引数を使用して、親 `meta` をマージできます。

```tsx
export const meta: MetaFunction = ({ matches }) => {
  const parentMeta = matches.flatMap(
    (match) => match.meta ?? []
  );
  return [...parentMeta, { title: "プロジェクト" }];
};
```

これは、`title` のようなものをオーバーライド _しない_ ことに注意してください。これは追加のみです。継承されたルートメタに `title` タグが含まれている場合は、[`Array.prototype.filter`][array-filter] でオーバーライドできます。

```tsx
export const meta: MetaFunction = ({ matches }) => {
  const parentMeta = matches
    .flatMap((match) => match.meta ?? [])
    .filter((meta) => !("title" in meta));
  return [...parentMeta, { title: "プロジェクト" }];
};
```

### `meta` マージヘルパー

グローバルメタまたはインデックスルートでマージの問題を回避できない場合は、親メタを簡単にオーバーライドおよび追加できるヘルパーをアプリに配置しました。

- [`merge-meta.ts` の Gist を表示][merge-meta]

[meta-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta
[link-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
[links]: ./links
[use-matches]: ../hooks/use-matches
[merging-metadata-across-the-route-hierarchy]: #merging-with-parent-meta
[loader]: ./loader
[url-params]: ../file-conventions/routes#dynamic-segments
[matches]: #matches
[root-route]: ../file-conventions/root
[index-route]: ../discussion/routes#index-routes
[array-filter]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
[merge-meta]: https://gist.github.com/ryanflorence/ec1849c6d690cfbffcb408ecd633e069

