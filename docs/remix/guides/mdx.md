---
title: MDX
description: Remix は、組み込みのルートと "import" サポートにより、MDX をプロジェクトに簡単に統合できます。
---

# MDX

<docs-warning>このドキュメントは、[Classic Remix Compiler][classic-remix-compiler] を使用している場合にのみ関連します。Vite を使用して MDX を使用したい場合は、[MDX Rollup (および Vite) プラグイン][mdx-plugin] を使用する必要があります。</docs-warning>

データと表示を明確に分離することが重要だと考えていますが、[MDX][mdx] (JSX コンポーネントが埋め込まれた Markdown) のように、両者を混在させる形式が、開発者にとって一般的で強力なオーサリング形式になっていることも理解しています。

<docs-info>このドキュメントで説明するように、ビルド時にコンテンツをコンパイルするのではなく、<a href="https://github.com/kentcdodds/mdx-bundler">mdx-bundler</a> のようなものを使用して、実行時にこれを行う方が、通常は UX と DX が向上します。また、カスタマイズ性と機能も大幅に向上します。ただし、このコンパイルをビルド時に実行したい場合は、読み進めてください。</docs-info>

Remix には、ビルド時に MDX を使用するための組み込みサポートが 2 つの方法で用意されています。

- `.mdx` ファイルをルートモジュールの 1 つとして使用できます
- `.mdx` ファイルをルートモジュールの 1 つ ( `app/routes` 内) に `import` できます

## ルート

Remix で MDX を使い始める最も簡単な方法は、ルートモジュールを作成することです。`app/routes` ディレクトリ内の `.tsx`、`.js`、`.jsx` ファイルと同様に、`.mdx` (および `.md`) ファイルは、自動ファイルシステムベースのルーティングに参加します。

MDX ルートを使用すると、コードベースのルートであるかのように、メタとヘッダーの両方を定義できます。

```md
---
meta:
  - title: 私の最初の投稿
  - name: description
    content: これは素晴らしいと思いませんか？
headers:
  Cache-Control: no-cache
---

# こんにちはコンテンツ！
```

上記のドキュメントの `---` の間の行は「フロントマター」と呼ばれます。これらは、[YAML][yaml] としてフォーマットされたドキュメントのメタデータのようなものと考えることができます。

MDX のグローバル `attributes` 変数を通じて、フロントマターフィールドを参照できます。

```mdx
---
componentData:
  label: こんにちは、世界！
---

import SomeComponent from "~/components/some-component";

# こんにちは MDX！

<SomeComponent {...attributes.componentData} />
```

### 例

`app/routes/posts.first-post.mdx` を作成することで、ブログ投稿を書き始めることができます。

```mdx
---
meta:
  - title: 私の最初の投稿
  - name: description
    content: これは素晴らしいと思いませんか？
---

# Markdown 投稿の例

"attributes" を通じてフロントマターデータを参照できます。この投稿のタイトルは {attributes.meta.title} です！
```

### 高度な例

`loader`、`action`、`handle` のように、通常のルートモジュールでできる他のすべてのものを、mdx ファイルのこのモジュールでエクスポートすることもできます。

```mdx
---
meta:
  - title: 私の最初の投稿
  - name: description
    content: これは素晴らしいと思いませんか？

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
  return <div id="loader">マンボナンバー: {mamboNumber}</div>;
}

# これは Markdown です！

<ComponentUsingData />
```

## モジュール

ルートレベルの MDX に加えて、これらのファイルを通常の JavaScript モジュールであるかのように、どこにでも自分でインポートすることもできます。

`.mdx` ファイルを `import` すると、モジュールのエクスポートは次のようになります。

- **default**: 消費用の React コンポーネント
- **attributes**: オブジェクトとしてのフロントマターデータ
- **filename**: ソースファイルのベース名 (例: "first-post.mdx")

```tsx
import Component, {
  attributes,
  filename,
} from "./first-post.mdx";
```

## ブログの使用例

次の例は、投稿自体の個々のページと、すべての投稿を表示するインデックスページを含む、MDX を使用してシンプルなブログを構築する方法を示しています。

```tsx filename=app/routes/_index.tsx
import { json } from "@remix-run/node"; // または cloudflare/deno
import { Link, useLoaderData } from "@remix-run/react";

// app/routes/posts ディレクトリからすべての投稿をインポートします。これらは
// 通常のルートモジュールであるため、たとえば /posts/a で個別に表示できます。
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
  // 下の Index コンポーネントではなく、ここで投稿を参照すると、
  // インデックスページのバンドルに実際の投稿自体をバンドルすることを回避できます。
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

明らかに、これは数千の投稿があるブログのスケーラブルなソリューションではありません。現実的に言えば、書くことは難しいので、ブログがコンテンツ過多で苦しみ始めたら、それは素晴らしい問題です。100 件の投稿に到達したら (おめでとうございます!)、戦略を再考し、投稿をデータベースに保存されたデータに変換して、タイプミスを修正するたびにブログを再構築して再デプロイする必要がないようにすることをお勧めします。[MDX Bundler][mdx-bundler] を使用して MDX を使い続けることもできます。

## 高度な構成

独自の remark プラグインを構成したい場合は、`remix.config.js` の `mdx` エクスポートを通じて行うことができます。

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

上記の構成は、Markdown を解析して [highlight.js][highlightjs] に対応した DOM 要素を挿入します。シンタックスハイライトを表示するには、highlight.js の CSS ファイルもインクルードする必要があります。[スタイルの表示][surfacing-styles] も参照してください。

[mdx-plugin]: https://mdxjs.com/packages/rollup
[mdx]: https://mdxjs.com
[yaml]: https://yaml.org
[mdx-bundler]: https://github.com/kentcdodds/mdx-bundler
[classic-remix-compiler]: ./vite#classic-remix-compiler-vs-remix-vite
[surfacing-styles]: ../styling#surfacing-styles
[highlightjs]: https://highlightjs.org/