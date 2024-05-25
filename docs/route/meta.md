---
title: meta
---

# `meta`

`meta`エクスポートを使用すると、アプリケーションのすべてのルートにメタデータHTMLタグを追加できます。これらのタグは、検索エンジン最適化（SEO）や、特定の動作を決定するためのブラウザディレクティブなど、重要な役割を果たします。また、ソーシャルメディアサイトがアプリのリッチプレビューを表示するためにも使用できます。

`meta`関数は、`MetaDescriptor`オブジェクトの配列を返す必要があります。これらのオブジェクトはHTMLタグと1対1に対応します。そのため、次の`meta`関数：

```tsx
export const meta: MetaFunction = () => {
  return [
    { title: "Very cool app | Remix" },
    {
      property: "og:title",
      content: "Very cool app",
    },
    {
      name: "description",
      content: "This app is the best",
    },
  ];
};
```

は、次のHTMLを生成します。

```html
<title>Very cool app | Remix</title>
<meta property="og:title" content="Very cool app" />;
<meta name="description" content="This app is the best" />
```

デフォルトでは、メタ記述子はほとんどの場合、[`<meta>`タグ][meta-element]をレンダリングします。2つの例外は次のとおりです。

- `{ title }`は`<title>`タグをレンダリングします。
- `{ "script:ld+json" }`は`<script type="application/ld+json">`タグをレンダリングし、その値はシリアライズ可能なオブジェクトである必要があります。オブジェクトは文字列化され、タグに挿入されます。

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

メタ記述子は、`tagName`プロパティを`"link"`に設定することで、[`<link>`タグ][link-element]をレンダリングすることもできます。これは、`canonical`URLなどのSEOに関連する`<link>`タグに役立ちます。スタイルシートやファビコンなどのアセットリンクについては、[`links`エクスポート][links]を使用する必要があります。

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

## `meta`関数の引数

### `location`

これは現在のルーター`Location`オブジェクトです。これは、特定のパスまたはクエリパラメータのルートのタグを生成するのに役立ちます。

```tsx
export const meta: MetaFunction = ({ location }) => {
  const searchQuery = new URLSearchParams(
    location.search
  ).get("q");
  return [{ title: `Search results for "${searchQuery}"` }];
};
```

### `matches`

これは、現在のルートのマッチングの配列です。多くの情報にアクセスできますが、特に親のマッチングからメタデータとデータにアクセスできます。

`matches`のインターフェースは[`useMatches`][use-matches]の戻り値に似ていますが、各マッチングにはその`meta`関数の出力が含まれます。これは、[ルート階層全体でメタデータをマージする][merging-metadata-across-the-route-hierarchy]のに役立ちます。

### `data`

これは、ルートの[`loader`][loader]からのデータです。

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

ルートのURLパラメータです。[ルーティングガイドの動的セグメント][url-params]を参照してください。

### `error`

エラー境界をトリガーするスローされたエラーは、`meta`関数に渡されます。これは、エラーページのメタデータを生成するのに役立ちます。

```tsx
export const meta: MetaFunction = ({ error }) => {
  return [{ title: error ? "oops!" : "Actual title" }];
};
```

## 親ルートのローダーからデータにアクセスする

現在のルートのデータに加えて、多くの場合、ルート階層の上位のルートのデータにアクセスしたいことがあります。[`matches`][matches]でルートIDを検索して、データにアクセスできます。

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

## `meta`とネストされたルートに関する注意点

複数のネストされたルートが同時にレンダリングされるため、最終的にレンダリングされるメタタグを決定するために、マージする必要があります。Remixでは、明らかなデフォルトがないため、このマージを完全に制御できます。

Remixは、メタエクスポートを持つ最後のマッチングルートを使用します。これにより、`title`をオーバーライドしたり、親ルートが追加した`og:image`のようなものを削除したり、親のすべてを保持して子ルートに新しいメタを追加したりできます。

これは、初心者にとってはかなり難しい場合があります。

`/projects/123`のようなルートを考えてみましょう。このルートには、`app/root.tsx`、`app/routes/projects.tsx`、`app/routes/projects.$id.tsx`という3つのマッチングルートがある可能性があります。これら3つのルートはすべて、メタ記述子をエクスポートしている可能性があります。

```tsx bad filename=app/root.tsx
export const meta: MetaFunction = () => {
  return [
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1",
    },
    { title: "New Remix App" },
  ];
};
```

```tsx bad filename=app/routes/projects.tsx
export const meta: MetaFunction = () => {
  return [{ title: "Projects" }];
};
```

```tsx bad filename=app/routes/projects.$id.tsx
export const meta: MetaFunction<typeof loader> = ({
  data,
}) => {
  return [{ title: data.project.name }];
};
```

このコードでは、`/projects`と`/projects/123`では`viewport`メタタグが失われます。これは、最後のメタのみが使用され、コードが親とマージされないためです。

### グローバル`meta`

ほとんどのアプリケーションでは、`viewport`や`charSet`のようなグローバルメタを使用します。`meta`エクスポートではなく、[ルートルート][root-route]内の通常の[`<meta>`タグ][meta-element]を使用することをお勧めします。これにより、マージする必要がなくなり、処理が簡単になります。

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

### 親ルートでの`meta`の回避

親ルートからオーバーライドする必要がある`meta`をエクスポートしないことで、マージの問題を回避することもできます。親ルートに`meta`を定義するのではなく、[インデックスルート][index-route]を使用します。これにより、タイトルなどの複雑なマージロジックを回避できます。そうでなければ、親のタイトル記述子を検索して、子のタイトルに置き換える必要があります。インデックスルートを使用すれば、オーバーライドする必要がなくなり、はるかに簡単になります。

### 親`meta`とのマージ

通常は、親がすでに定義している`meta`に`meta`を追加するだけです。スプレッド演算子と[`matches`][matches]引数を使用して、親`meta`をマージできます。

```tsx
export const meta: MetaFunction = ({ matches }) => {
  const parentMeta = matches.flatMap(
    (match) => match.meta ?? []
  );
  return [...parentMeta, { title: "Projects" }];
};
```

ただし、`title`のようなものをオーバーライドすることはできません。これは単に追加するだけです。継承されたルートのメタに`title`タグが含まれている場合は、[`Array.prototype.filter`][array-filter]を使用してオーバーライドできます。

```tsx
export const meta: MetaFunction = ({ matches }) => {
  const parentMeta = matches
    .flatMap((match) => match.meta ?? [])
    .filter((meta) => !("title" in meta));
  return [...parentMeta, { title: "Projects" }];
};
```

### `meta`マージヘルパー

グローバルメタまたはインデックスルートを使用してマージの問題を回避できない場合は、親メタを簡単にオーバーライドして追加できるヘルパーをアプリケーションに置くことができます。

- [`merge-meta.ts`のGistを見る][merge-meta]

[meta-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta
[link-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
[links]: ./links
[use-matches]: ../hooks/use-matches
[merging-metadata-across-the-route-hierarchy]: #親メタとのマージ
[loader]: ./loader
[url-params]: ../file-conventions/routes#動的セグメント
[matches]: #matches
[root-route]: ../file-conventions/root
[index-route]: ../discussion/routes#index-routes
[array-filter]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
[merge-meta]: https://gist.github.com/ryanflorence/ec1849c6d690cfbffcb408ecd633e069


