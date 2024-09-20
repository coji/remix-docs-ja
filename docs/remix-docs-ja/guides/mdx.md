---
title: MDX
description: Remix によって、組み込みのルートと「import」サポートにより、プロジェクトへの MDX の統合が容易になります。
---

# MDX

<docs-warning>このドキュメントは、[クラシック Remix コンパイラ][classic-remix-compiler] を使用する場合にのみ関連します。 MDX を使用したい Vite ユーザーは、[MDX Rollup (および Vite) プラグイン][mdx-plugin] を使用してください。</docs-warning>

データと表示の明確な分離は重要であると考えていますが、[MDX][mdx] (埋め込み JSX コンポーネントを含む Markdown) のように、データを組み合わせる形式が、開発者にとって人気のある強力なオーサリング形式になっていることを理解しています。

<docs-info>このドキュメントで示されているように、コンテンツをビルド時にコンパイルするのではなく、<a href="https://github.com/kentcdodds/mdx-bundler">mdx-bundler</a> のようなものを使用してランタイムでこれを行う方が、通常は UX と DX が優れています。また、はるかにカスタマイズ可能で強力です。ただし、ビルド時にコンパイルすることを好む場合は、読み続けてください。</docs-info>

Remix は、ビルド時に MDX を 2 つの方法で使用するための組み込みサポートを提供しています。

- `.mdx` ファイルをルートモジュールの 1 つとして使用できます。
- `app/routes` 内のルートモジュールに `.mdx` ファイルを `import` できます。

## ルート

Remix で MDX を始める最も簡単な方法は、ルートモジュールを作成することです。 `app/routes` ディレクトリ内の `.tsx`、`.js`、`.jsx` ファイルと同様に、`.mdx` (および `.md`) ファイルは、自動ファイルシステムベースのルーティングに参加します。

MDX ルートを使用すると、コードベースのルートと同じように、メタデータとヘッダーを定義できます。

```md
---
meta:
  - title: My First Post
  - name: description
    content: Isn't this awesome?
headers:
  Cache-Control: no-cache
---

# Hello Content!
```

上記のドキュメントの `---` 間の行は、"フロントマター" と呼ばれます。[YAML][yaml] としてフォーマットされたドキュメントのメタデータと考えることができます。

MDX でグローバルな `attributes` 変数を使用して、フロントマターのフィールドを参照できます。

```mdx
---
componentData:
  label: Hello, World!
---

import SomeComponent from "~/components/some-component";

# Hello MDX!

<SomeComponent {...attributes.componentData} />
```

### 例

`app/routes/posts.first-post.mdx` を作成することで、ブログ投稿を書き始めることができます。

```mdx
---
meta:
  - title: My First Post
  - name: description
    content: Isn't this just awesome?
---

# Example Markdown Post

"attributes" を使用してフロントマターデータを参照できます。この投稿のタイトルは {attributes.meta.title} です!
```

### 詳細例

通常のルートモジュールで可能なすべてのものを、`loader`、`action`、`handle` などの mdx ファイルにエクスポートすることもできます。

```mdx
---
meta:
  - title: My First Post
  - name: description
    content: Isn't this awesome?

headers:
  Cache-Control: no-cache

handle:
  someData: abc
---

import styles from "./first-post.css";

export const links = () => [
  { rel: "stylesheet", href: styles },
];

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  return json({ mamboNumber: 5 });
};

export function ComponentUsingData() {
  const { mamboNumber } = useLoaderData<typeof loader>();
  return <div id="loader">Mambo Number: {mamboNumber}</div>;
}

# This is some markdown!

<ComponentUsingData />
```

## モジュール

ルートレベルの MDX だけでなく、通常の JavaScript モジュールのように、これらのファイルをどこでも自分でインポートできます。

`.mdx` ファイルを `import` すると、モジュールのエクスポートは次のようになります。

- **default**: 消費のための React コンポーネント
- **attributes**: フロントマターデータのオブジェクト
- **filename**: ソースファイルのベース名 (例: "first-post.mdx")

```tsx
import Component, {
  attributes,
  filename,
} from "./first-post.mdx";
```

## ブログの使用例

次の例は、MDX を使用して簡単なブログを構築する方法を示しています。これには、投稿自体の個別ページと、すべての投稿を表示するインデックスページが含まれています。

```tsx filename=app/routes/_index.tsx
import { json } from "@remix-run/node"; // or cloudflare/deno
import { Link, useLoaderData } from "@remix-run/react";

// app/routes/posts ディレクトリからすべての投稿をインポートします。これらは
// 通常のルートモジュールなので、たとえば /posts/a で個別に表示できます。
import * as postA from "./posts/a.mdx";
import * as postB from "./posts/b.md";
import * as postC from "./posts/c.md";

function postFromModule(mod) {
  return {
    slug: mod.filename.replace(/\.mdx?$/, ""),
    ...mod.attributes.meta,
  };
}

export async function loader() {
  // インデックスページに表示するための各投稿に関するメタデータを返します。
  // 以下にある Index コンポーネントではなく、ここで投稿を参照することで、
  // インデックスページのバンドルに実際の投稿自体をバンドルすることを避けられます。
  return json([
    postFromModule(postA),
    postFromModule(postB),
    postFromModule(postC),
  ]);
}

export default function Index() {
  const posts = useLoaderData<typeof loader>();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link to={post.slug}>{post.title}</Link>
          {post.description ? (
            <p>{post.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
```

明らかに、これは何千もの投稿があるブログに対してはスケーラブルなソリューションではありません。現実的には、書くことは難しいので、ブログがコンテンツ過多で苦しむようになった場合は、素晴らしい問題です。投稿が 100 件に達したら（おめでとうございます！）、戦略を見直し、投稿をデータベースに格納されたデータに変換して、タイプミスを修正するたびにブログを再構築して再展開する必要がなくなります。[MDX Bundler][mdx-bundler] を使用して、MDX を使い続けることもできます。

## 詳細設定

独自の remark プラグインを構成する場合は、`remix.config.js` の `mdx` エクスポートを使用して行うことができます。

```js filename=remix.config.js
const {
  remarkMdxFrontmatter,
} = require("remark-mdx-frontmatter");

// 同期/非同期関数またはオブジェクトにすることができます
exports.mdx = async (filename) => {
  const [rehypeHighlight, remarkToc] = await Promise.all([
    import("rehype-highlight").then((mod) => mod.default),
    import("remark-toc").then((mod) => mod.default),
  ]);

  return {
    remarkPlugins: [remarkToc],
    rehypePlugins: [rehypeHighlight],
  };
};
```

[mdx-plugin]: https://mdxjs.com/packages/rollup
[mdx]: https://mdxjs.com
[yaml]: https://yaml.org
[mdx-bundler]: https://github.com/kentcdodds/mdx-bundler
[classic-remix-compiler]: ./vite#classic-remix-compiler-vs-remix-vite


