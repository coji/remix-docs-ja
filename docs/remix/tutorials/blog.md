---
title: ブログチュートリアル (短縮版)
order: 3
hidden: true
---

# ブログチュートリアル

このクイックスタートでは、言葉を少なく、コードを素早く進めていきます。Remixがどんなものか15分で知りたいなら、これが最適です。

<docs-info>このチュートリアルをKentと一緒に<a target="_blank" rel="noopener noreferrer" href="https://rmx.as/egghead-course">この無料のEgghead.ioコース</a>で進めてください</docs-info>

このチュートリアルではTypeScriptを使用します。RemixはTypeScriptなしでも間違いなく使用できます。私たちはTypeScriptを書くときに最も生産性が高いと感じていますが、TypeScriptの構文をスキップしたい場合は、JavaScriptでコードを書いても構いません。

<docs-info>💿 こんにちは、Remixコンパクトディスクのデリックです 👋 何かをする必要があるときは、私を見かけるでしょう</docs-info>

## 前提条件

このボタンをクリックすると、プロジェクトがセットアップされ、VS CodeまたはJetBrainsでブラウザ上またはデスクトップ上で直接実行できる状態の[Gitpod][gitpod]ワークスペースが作成されます。

[![Gitpod Ready-to-Code][gitpod-ready-to-code]][gitpod-ready-to-code-image]

このチュートリアルをローカルのコンピュータで実行する場合は、以下のものがインストールされていることが重要です。

* [Node.js][node-js] バージョン (>=18.0.0)
* [npm][npm] 7以上
* コードエディタ ([VSCode][vs-code] がおすすめです)

[gitpod]: https://www.gitpod.io/
[gitpod-ready-to-code]: https://gitpod.io/#https://github.com/your-repo-here
[gitpod-ready-to-code-image]: https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod
[node-js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[vs-code]: https://code.visualstudio.com/

## プロジェクトの作成

<docs-warning>Node v18 以上が実行されていることを確認してください</docs-warning>

💿 新しい Remix プロジェクトを初期化します。ここでは「blog-tutorial」と名付けますが、必要に応じて別の名前を付けても構いません。

```shellscript nonumber
npx create-remix@latest --template remix-run/indie-stack blog-tutorial
```

```
npm で依存関係をインストールしますか？
はい
```

利用可能なスタックの詳細については、[スタックのドキュメント][the-stacks-docs]を参照してください。

ここでは、[Indie スタック][the-indie-stack]を使用します。これは、[fly.io][fly-io]にデプロイできるフルアプリケーションです。これには、開発ツールだけでなく、本番環境に対応した認証と永続化も含まれています。使用されているツールに慣れていなくても心配しないでください。進めていく中で説明します。

<docs-info>注意: `--template` フラグなしで `npx create-remix@latest` を実行して、「基本のみ」から始めることもできます。生成されるプロジェクトは、その方がはるかに最小限です。ただし、チュートリアルのいくつかの部分が異なり、デプロイを手動で構成する必要があります。</docs-info>

💿 次に、生成されたプロジェクトを好みのエディターで開き、`README.md` ファイルの指示を確認してください。自由に読んでください。デプロイについては、チュートリアルの後半で説明します。

💿 開発サーバーを起動しましょう。

```shellscript nonumber
npm run dev
```

💿 [http://localhost:3000][http-localhost-3000] を開くと、アプリが実行されているはずです。

必要に応じて、少しUIを触ってみてください。自由にアカウントを作成し、いくつかのメモを作成/削除して、すぐに利用できるUIの概要を把握してください。

[the-stacks-docs]: https://remix.run/docs/en/main/pages/stacks
[the-indie-stack]: https://github.com/remix-run/indie-stack
[fly-io]: https://fly.io
[http-localhost-3000]: http://localhost:3000

## 初めてのルート

"/posts" URL でレンダリングする新しいルートを作成します。その前に、リンクを追加しましょう。

💿 `app/routes/_index.tsx` に投稿へのリンクを追加する

これをコピー＆ペーストしてください。

```tsx filename=app/routes/_index.tsx
<div className="mx-auto mt-16 max-w-7xl text-center">
  <Link
    to="/posts"
    className="text-xl text-blue-600 underline"
  >
    ブログ記事
  </Link>
</div>
```

どこに配置しても構いません。私はスタックで使用されているすべてのテクノロジーのアイコンのすぐ上に配置しました。

<!-- TODO: ウェブサイトが適切にデプロイできるようになったら、この画像を自己ホスト版に更新してください -->

<!-- ![ブログ記事のリンクが表示されているアプリのスクリーンショット](/blog-tutorial/blog-post-link.png) -->

![ブログ記事のリンクが表示されているアプリのスクリーンショット][screenshot-of-the-app-showing-the-blog-post-link]

<docs-info> <a href="https://tailwindcss.com">Tailwind CSS</a> クラスを使用していることにお気づきかもしれません。</docs-info>

Remix Indie スタックには、[Tailwind CSS][tailwind] のサポートが事前に設定されています。Tailwind CSS を使用したくない場合は、削除して別のものを使用しても構いません。Remix でのスタイリングオプションの詳細については、[スタイリングガイド][the-styling-guide] を参照してください。

ブラウザに戻ってリンクをクリックしてください。まだこのルートを作成していないため、404 ページが表示されるはずです。それでは、ルートを作成しましょう。

💿 `app/routes/posts._index.tsx` に新しいファイルを作成する

```shellscript nonumber
touch app/routes/posts._index.tsx
```

<docs-info>ファイルやフォルダを作成するためのターミナルコマンドが表示された場合は、もちろん好きなように作成できますが、`touch` を使用するのは、どのファイルを作成する必要があるかを明確にするためです。</docs-info>

`posts.tsx` という名前にすることもできましたが、すぐに別のルートを作成するので、それらを互いに近くに配置すると便利です。インデックスルートは、親のパスでレンダリングされます（Web サーバーの `index.html` と同様）。

`/posts` ルートに移動すると、リクエストを処理する方法がないことを示すエラーが表示されます。それは、まだそのルートで何もしていないからです！コンポーネントを追加して、デフォルトとしてエクスポートしましょう。

💿 投稿コンポーネントを作成する

```tsx filename=app/routes/posts._index.tsx
export default function Posts() {
  return (
    <main>
      <h1>投稿</h1>
    </main>
  );
}
```

新しい、簡素な投稿ルートを表示するには、ブラウザを更新する必要があるかもしれません。

[screenshot-of-the-app-showing-the-blog-post-link]: /blog-tutorial/blog-post-link.png
[tailwind]: https://tailwindcss.com
[the-styling-guide]: https://remix.run/docs/en/main/styling

## データのロード

データローディングはRemixに組み込まれています。

もしあなたのWeb開発のバックグラウンドがここ数年のものであれば、おそらくここで2つのものを作成することに慣れているでしょう。データを供給するAPIルートと、それを利用するフロントエンドコンポーネントです。Remixでは、フロントエンドコンポーネントもそれ自身のAPIルートであり、ブラウザからサーバー上の自身と通信する方法をすでに知っています。つまり、フェッチする必要はありません。

もしあなたのバックグラウンドがRailsのようなMVC Webフレームワークを使ったそれよりも少し古いものであれば、RemixのルートをReactをテンプレートに使用するバックエンドビューと考えることができます。しかし、それらはブラウザでシームレスにハイドレートして、ユーザーインタラクションを飾るために分離されたjQueryコードを書く代わりに、いくつかの華やかさを加える方法を知っています。これは、最大限に実現されたプログレッシブエンハンスメントです。さらに、ルートはそれ自身のコントローラーです。

それでは、コンポーネントにデータを提供してみましょう。

💿 postsルートの`loader`を作成する

```tsx filename=app/routes/posts._index.tsx lines=[1-2,4-17,20-21]
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  return json({
    posts: [
      {
        slug: "my-first-post",
        title: "My First Post",
      },
      {
        slug: "90s-mixtape",
        title: "A Mixtape I Made Just For You",
      },
    ],
  });
};

export default function Posts() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <main>
      <h1>Posts</h1>
    </main>
  );
}
```

`loader`関数は、コンポーネントのバックエンド「API」であり、`useLoaderData`を通じてすでに接続されています。Remixルートでは、クライアントとサーバーの境界線がどれほど曖昧であるかは少し驚きです。サーバーとブラウザの両方のコンソールを開いている場合、両方が投稿データをログに記録していることに気づくでしょう。これは、Remixが従来のWebフレームワークのように完全なHTMLドキュメントを送信するためにサーバーでレンダリングしたためですが、クライアントでもハイドレートしてログに記録したためです。

<docs-error>
ローダーから返すものは何でも、コンポーネントがレンダリングしなくてもクライアントに公開されます。ローダーは、パブリックAPIエンドポイントと同じように注意して扱ってください。
</docs-error>

💿 投稿へのリンクをレンダリングする

```tsx filename=app/routes/posts._index.tsx lines=[2,10-21] nocopy
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

// ...
export default function Posts() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to={post.slug}
              className="text-blue-600 underline"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

これはかなりクールです。すべてが同じファイルで定義されているため、ネットワークリクエストを介してもかなり高いレベルの型安全性を得ることができます。Remixがデータをフェッチしている間にネットワークがダウンしない限り、このコンポーネントとそのAPI（コンポーネントはすでにそれ自身のAPIルートであることを思い出してください）で型安全性が確保されています。

## ちょっとしたリファクタリング

特定の関心事に対処するモジュールを作成することは、確かなプラクティスです。今回のケースでは、投稿の読み書きを扱うモジュールを作成します。早速設定して、モジュールに `getPosts` エクスポートを追加しましょう。

💿 `app/models/post.server.ts` を作成します。

```shellscript nonumber
touch app/models/post.server.ts
```

ほとんどの場合、ルートからコピー＆ペーストします。

```tsx filename=app/models/post.server.ts
type Post = {
  slug: string;
  title: string;
};

export async function getPosts(): Promise<Array<Post>> {
  return [
    {
      slug: "my-first-post",
      title: "My First Post",
    },
    {
      slug: "90s-mixtape",
      title: "A Mixtape I Made Just For You",
    },
  ];
}
```

`getPosts` 関数を `async` にしていることに注意してください。現在は非同期処理を行っていませんが、すぐに非同期処理を行うようになるからです！

💿 新しい投稿モジュールを使用するように投稿ルートを更新します。

```tsx filename=app/routes/posts._index.tsx lines=[4,6-8] nocopy
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getPosts } from "~/models/post.server";

export const loader = async () => {
  return json({ posts: await getPosts() });
};

// ...
```

## データソースからの取得

Indie Stack では、SQLite データベースがすでにセットアップされ、構成されているので、SQLite を処理するようにデータベーススキーマを更新しましょう。データベースとのやり取りには [Prisma][prisma] を使用しているので、そのスキーマを更新すると、Prisma がデータベースをスキーマに合わせて更新してくれます (また、移行に必要な SQL コマンドを生成して実行してくれます)。

<docs-info>Remix を使用する際に Prisma を使用する必要はありません。Remix は、現在使用している既存のデータベースやデータ永続化サービスとうまく連携します。</docs-info>

Prisma を使用したことがない場合でも、ご心配なく。順を追って説明します。

💿 まず、Prisma スキーマを更新する必要があります。

```prisma filename=prisma/schema.prisma nocopy
// このファイルを一番下に貼り付けます。

model Post {
  slug     String @id
  title    String
  markdown String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

💿 スキーマ変更の移行ファイルを作成しましょう。これは、ローカルで開発モードで実行するだけでなく、アプリケーションをデプロイする場合に必要になります。これにより、ローカルデータベースと TypeScript の定義もスキーマの変更に合わせて更新されます。移行には「create post model」という名前を付けます。

```shellscript nonumber
npx prisma migrate dev --name "create post model"
```

💿 いくつかの投稿でデータベースをシードしましょう。`prisma/seed.ts` を開き、シード機能の最後 ( `console.log` の直前) にこれを追加します。

```ts filename=prisma/seed.ts
const posts = [
  {
    slug: "my-first-post",
    title: "My First Post",
    markdown: `
# これは私の最初の投稿です

素晴らしいでしょう？
    `.trim(),
  },
  {
    slug: "90s-mixtape",
    title: "あなたのためだけに作ったミックステープ",
    markdown: `
# 90年代ミックステープ

- I wish (Skee-Lo)
- This Is How We Do It (Montell Jordan)
- Everlong (Foo Fighters)
- Ms. Jackson (Outkast)
- Interstate Love Song (Stone Temple Pilots)
- Killing Me Softly With His Song (Fugees, Ms. Lauryn Hill)
- Just a Friend (Biz Markie)
- The Man Who Sold The World (Nirvana)
- Semi-Charmed Life (Third Eye Blind)
- ...Baby One More Time (Britney Spears)
- Better Man (Pearl Jam)
- It's All Coming Back to Me Now (Céline Dion)
- This Kiss (Faith Hill)
- Fly Away (Lenny Kravits)
- Scar Tissue (Red Hot Chili Peppers)
- Santa Monica (Everclear)
- C'mon N' Ride it (Quad City DJ's)
    `.trim(),
  },
];

for (const post of posts) {
  await prisma.post.upsert({
    where: { slug: post.slug },
    update: post,
    create: post,
  });
}
```

<docs-info>ここでは `upsert` を使用しているため、毎回同じ投稿の複数のバージョンを追加することなく、シードスクリプトを何度も実行できることに注意してください。</docs-info>

素晴らしい、シードスクリプトでこれらの投稿をデータベースに入れましょう。

```
npx prisma db seed
```

💿 次に、`app/models/post.server.ts` ファイルを更新して、SQLite データベースから読み取るようにします。

```ts filename=app/models/post.server.ts
import { prisma } from "~/db.server";

export async function getPosts() {
  return prisma.post.findMany();
}
```

<docs-success>戻り値の型を削除できますが、すべてが完全に型付けされていることに注目してください。Prisma の TypeScript 機能は、その最大の強みの 1 つです。手動での型付けが少なくなり、それでも型安全です！</docs-success>

<docs-info>`~/db.server` インポートは、`app/db.server.ts` にあるファイルをインポートしています。`~` は `app` ディレクトリへの便利なエイリアスなので、ファイルを移動するときにインポートに含める `../../` の数を気にする必要はありません。</docs-info>

`http://localhost:3000/posts` にアクセスすると、投稿はまだそこにあるはずですが、今度は SQLite から取得されています。

## 動的なルートパラメータ

それでは、実際に投稿を表示するためのルートを作成しましょう。以下のURLが機能するようにします。

```
/posts/my-first-post
/posts/90s-mixtape
```

投稿ごとにルートを作成する代わりに、URLに「動的セグメント」を使用できます。Remixが解析して渡してくれるので、投稿を動的に検索できます。

💿 `app/routes/posts.$slug.tsx` に動的ルートを作成します。

```shellscript nonumber
touch app/routes/posts.\$slug.tsx
```

```tsx filename=app/routes/posts.$slug.tsx
export default function PostSlug() {
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        何かの投稿
      </h1>
    </main>
  );
}
```

投稿のいずれかをクリックすると、新しいページが表示されるはずです。

💿 パラメータにアクセスするためのローダーを追加します。

```tsx filename=app/routes/posts.$slug.tsx lines=[1-3,5-9,12,16]
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  return json({ slug: params.slug });
};

export default function PostSlug() {
  const { slug } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        何かの投稿: {slug}
      </h1>
    </main>
  );
}
```

ファイル名の `$` に続く部分は、ローダーに渡される `params` オブジェクトの名前付きキーになります。これがブログ記事を検索する方法です。

それでは、実際にデータベースからスラッグで投稿内容を取得しましょう。

💿 `getPost` 関数を投稿モジュールに追加します。

```tsx filename=app/models/post.server.ts lines=[7-9]
import { prisma } from "~/db.server";

export async function getPosts() {
  return prisma.post.findMany();
}

export async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}
```

💿 新しい `getPost` 関数をルートで使用します。

```tsx filename=app/routes/posts.$slug.tsx lines=[5,10-11,15,19]
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getPost } from "~/models/post.server";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  const post = await getPost(params.slug);
  return json({ post });
};

export default function PostSlug() {
  const { post } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        {post.title}
      </h1>
    </main>
  );
}
```

見てください！JavaScriptとしてブラウザにすべてを含めるのではなく、データソースから投稿を取得するようになりました。

TypeScriptでコードを満足させましょう。

```tsx filename=app/routes/posts.$slug.tsx lines=[4,11,14]
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getPost } from "~/models/post.server";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.slug, "params.slug is required");

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  return json({ post });
};

export default function PostSlug() {
  const { post } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        {post.title}
      </h1>
    </main>
  );
}
```

パラメータの `invariant` について簡単に説明します。`params` はURLから取得されるため、`params.slug` が定義されているとは限りません。たとえば、ファイル名を `posts.$postId.ts` に変更するかもしれません。`invariant` で検証するのは良い習慣であり、TypeScriptも満足させます。

投稿にもinvariantがあります。`404` のケースは後でより適切に処理します。このまま進みましょう！

次に、マークダウンを解析してHTMLにレンダリングしてページに表示しましょう。マークダウンパーサーはたくさんありますが、このチュートリアルでは `marked` を使用します。これは非常に簡単に動作させることができるからです。

💿 マークダウンをHTMLに解析します。

```shellscript nonumber
npm add marked@^4.3.0
# additionally, if using typescript
npm add @types/marked@^4.3.1 -D
```

`marked` がインストールされたので、サーバーを再起動する必要があります。したがって、開発サーバーを停止し、`npm run dev` で再度起動します。

```tsx filename=app/routes/posts.$slug.tsx lines=[4,17-18,22,28]
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import invariant from "tiny-invariant";

import { getPost } from "~/models/post.server";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.slug, "params.slug is required");

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  const html = marked(post.markdown);
  return json({ html, post });
};

export default function PostSlug() {
  const { html, post } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        {post.title}
      </h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
```

すごい、できました。ブログができました。確認してみてください！次に、新しいブログ記事を簡単に作成できるようにします📝

## ネストされたルーティング

現在、ブログ記事はデータベースのシードから取得しているだけです。これは現実的な解決策ではないため、データベースに新しいブログ記事を作成する方法が必要です。そのためにアクションを使用します。

アプリに新しい「admin」セクションを作成しましょう。

💿 まず、投稿インデックスルートにadminセクションへのリンクを追加しましょう。

```tsx filename=app/routes/posts._index.tsx
// ...
<Link to="admin" className="text-red-600 underline">
  Admin
</Link>
// ...
```

コンポーネント内の任意の場所に配置してください。私は`<h1>`のすぐ下に配置しました。

<docs-info> `to`プロパティが単に「admin」であり、`/posts/admin`にリンクしていることに気づきましたか？Remixでは、相対リンクを使用できます。</docs-info>

💿 `app/routes/posts.admin.tsx`にadminルートを作成します。

```shellscript nonumber
touch app/routes/posts.admin.tsx
```

```tsx filename=app/routes/posts.admin.tsx
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getPosts } from "~/models/post.server";

export const loader = async () => {
  return json({ posts: await getPosts() });
};

export default function PostAdmin() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="my-6 mb-2 border-b-2 text-center text-3xl">
        Blog Admin
      </h1>
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  to={post.slug}
                  className="text-blue-600 underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="col-span-4 md:col-span-3">
          ...
        </main>
      </div>
    </div>
  );
}
```

ここで行っていることのいくつかは、これまでに行ってきたことから認識できるはずです。これで、左側に投稿、右側にプレースホルダーが表示された、見栄えの良いページが表示されるはずです。
Adminリンクをクリックすると、[http://localhost:3000/posts/admin][http-localhost-3000-posts-admin]に移動します。

### インデックスルート

プレースホルダーをadmin用のインデックスルートで埋めましょう。ここで「ネストされたルート」を紹介します。ルートファイルのネストがUIコンポーネントのネストになるものです。

💿 `posts.admin.tsx` の子ルート用のインデックスルートを作成します。

```shellscript nonumber
touch app/routes/posts.admin._index.tsx
```

```tsx filename=app/routes/posts.admin._index.tsx
import { Link } from "@remix-run/react";

export default function AdminIndex() {
  return (
    <p>
      <Link to="new" className="text-blue-600 underline">
        新しい投稿を作成
      </Link>
    </p>
  );
}
```

リフレッシュしてもまだ表示されません。`app/routes/posts.admin.` で始まるすべてのルートは、URLが一致すると `app/routes/posts.admin.tsx` の*内部*にレンダリングできるようになりました。子ルートをレンダリングする `posts.admin.tsx` レイアウトのどの部分を制御するかを決定できます。

💿 adminページにアウトレットを追加します。

```tsx filename=app/routes/posts.admin.tsx lines=[4,37]
import { json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";

import { getPosts } from "~/models/post.server";

export const loader = async () => {
  return json({ posts: await getPosts() });
};

export default function PostAdmin() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="my-6 mb-2 border-b-2 text-center text-3xl">
        ブログ管理
      </h1>
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  to={post.slug}
                  className="text-blue-600 underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="col-span-4 md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

少しの間お付き合いください。インデックスルートは最初は混乱するかもしれません。URLが親ルートのパスと一致すると、インデックスが `Outlet` の内部にレンダリングされることを知っておいてください。

これが役立つかもしれません。`/posts/admin/new` ルートを追加して、リンクをクリックしたときに何が起こるかを見てみましょう。

💿 `app/routes/posts.admin.new.tsx` ファイルを作成します。

```shellscript nonumber
touch app/routes/posts.admin.new.tsx
```

```tsx filename=app/routes/posts.admin.new.tsx
export default function NewPost() {
  return <h2>新しい投稿</h2>;
}
```

インデックスルートのリンクをクリックすると、`<Outlet/>` が自動的にインデックスルートを「new」ルートに置き換えるのを見てください！

## アクション

ここからが本番です。新しい「new」ルートに新しい投稿を作成するためのフォームを作成しましょう。

💿 newルートにフォームを追加する

```tsx filename=app/routes/posts.admin.new.tsx
import { Form } from "@remix-run/react";

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function NewPost() {
  return (
    <Form method="post">
      <p>
        <label>
          投稿タイトル:{" "}
          <input
            type="text"
            name="title"
            className={inputClassName}
          />
        </label>
      </p>
      <p>
        <label>
          投稿スラッグ:{" "}
          <input
            type="text"
            name="slug"
            className={inputClassName}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown: </label>
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
        >
          投稿を作成
        </button>
      </p>
    </Form>
  );
}
```

もしあなたが私たちのようにHTMLを愛しているなら、かなり興奮しているはずです。もしあなたが`<form onSubmit>`や`<button onClick>`をたくさん使ってきたなら、HTMLによってあなたの考え方が変わるでしょう。

このような機能に必要なのは、ユーザーからデータを取得するためのフォームと、それを処理するためのバックエンドアクションだけです。そしてRemixでは、それだけですべてが完了します。

まず、`post.ts`モジュールで投稿を保存する方法を知っている必須のコードを作成しましょう。

💿 `app/models/post.server.ts`内の任意の場所に`createPost`を追加する

```tsx filename=app/models/post.server.ts nocopy
// ...
export async function createPost(post) {
  return prisma.post.create({ data: post });
}
```

💿 新しい投稿ルートのアクションから`createPost`を呼び出す

```tsx filename=app/routes/posts.admin.new.tsx lines=[1-2,5,7-19] nocopy
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

import { createPost } from "~/models/post.server";

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  await createPost({ title, slug, markdown });

  return redirect("/posts/admin");
};

// ...
```

これで完了です。Remix（とブラウザ）が残りの処理を行います。送信ボタンをクリックすると、投稿を一覧表示するサイドバーが自動的に更新されるのを確認してください。

HTMLでは、入力の`name`属性がネットワーク経由で送信され、リクエストの`formData`で同じ名前で利用できます。ああ、それと、`request`と`formData`オブジェクトはどちらもWeb仕様から直接取得したものであることを忘れないでください。したがって、どちらかについて詳しく知りたい場合は、MDNにアクセスしてください。

* [`Request`][mdn-request]
* [`Request.formData`][mdn-request-form-data].

TypeScriptがまた怒っているので、型を追加しましょう。

💿 `app/models/post.server.ts`に型を追加する

```tsx filename=app/models/post.server.ts lines=[2,7]
// ...
import type { Post } from "@prisma/client";

// ...

export async function createPost(
  post: Pick<Post, "slug" | "title" | "markdown">
) {
  return prisma.post.create({ data: post });
}
```

TypeScriptを使用しているかどうかに関わらず、ユーザーがこれらのフィールドに値を指定しない場合に問題が発生します（そしてTSは`createPost`の呼び出しについてまだ怒っています）。

投稿を作成する前に、いくつかの検証を追加しましょう。

💿 フォームデータに必要なものが含まれているかどうかを検証し、そうでない場合はエラーを返す

```tsx filename=app/routes/posts.admin.new.tsx lines=[2,16-26]
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

import { createPost } from "~/models/post.server";

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors = {
    title: title ? null : "タイトルは必須です",
    slug: slug ? null : "スラッグは必須です",
    markdown: markdown ? null : "Markdownは必須です",
  };
  const hasErrors = Object.values(errors).some(
    (errorMessage) => errorMessage
  );
  if (hasErrors) {
    return json(errors);
  }

  await createPost({ title, slug, markdown });

  return redirect("/posts/admin");
};

// ...
```

今回はリダイレクトを返さず、実際にはエラーを返していることに注意してください。これらのエラーは、`useActionData`を介してコンポーネントで利用できます。これは`useLoaderData`と似ていますが、データはフォームPOST後のアクションから取得されます。

💿 UIに検証メッセージを追加する

```tsx filename=app/routes/posts.admin.new.tsx lines=[3,11,18-20,27-29,36-40]
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

// ...

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function NewPost() {
  const errors = useActionData<typeof action>();

  return (
    <Form method="post">
      <p>
        <label>
          投稿タイトル:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input type="text" name="title" className={inputClassName} />
        </label>
      </p>
      <p>
        <label>
          投稿スラッグ:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input type="text" name="slug" className={inputClassName} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown:{" "}
          {errors?.markdown ? (
            <em className="text-red-600">
              {errors.markdown}
            </em>
          ) : null}
        </label>
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
        >
          投稿を作成
        </button>
      </p>
    </Form>
  );
}
```

TypeScriptはまだ怒っています。なぜなら、誰かが文字列以外の値でAPIを呼び出す可能性があるからです。そのため、それを満足させるためにいくつかの不変条件を追加しましょう。

```tsx filename=app/routes/posts.admin.new.tsx nocopy
//...
import invariant from "tiny-invariant";
// ..

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  // ...
  invariant(
    typeof title === "string",
    "title must be a string"
  );
  invariant(
    typeof slug === "string",
    "slug must be a string"
  );
  invariant(
    typeof markdown === "string",
    "markdown must be a string"
  );

  await createPost({ title, slug, markdown });

  return redirect("/posts/admin");
};
```

## プログレッシブエンハンスメント

ちょっとした楽しみとして、開発者ツールで[JavaScriptを無効化][disable-java-script]して試してみてください。RemixはHTTPとHTMLの基本に基づいて構築されているため、ブラウザでJavaScriptがなくてもすべて機能します🤯 しかし、それがポイントではありません。重要なのは、これによりUIがネットワークの問題に対して回復力を持つということです。しかし、私たちはブラウザでJavaScriptを使用するのが好きですし、JavaScriptがあるときにはできるクールなことがたくさんあります。そのため、次にユーザーエクスペリエンスを*プログレッシブに拡張*するために必要になるので、続行する前にJavaScriptを再度有効にしてください。

少しペースを落として、フォームに「保留中のUI」を追加しましょう。

💿 フェイクの遅延でアクションを遅くする

```tsx filename=app/routes/posts.admin.new.tsx lines=[5-6]
// ...
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  // TODO: remove me
  await new Promise((res) => setTimeout(res, 1000));

  // ...
};
//...
```

💿 `useNavigation`で保留中のUIを追加する

```tsx filename=app/routes/posts.admin.new.tsx lines=[6,14-17,26,28]
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigation,
} from "@remix-run/react";

// ..

export default function NewPost() {
  const errors = useActionData<typeof action>();

  const navigation = useNavigation();
  const isCreating = Boolean(
    navigation.state === "submitting"
  );

  return (
    <Form method="post">
      {/* ... */}
      <p className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating}
        >
          {isCreating ? "作成中..." : "投稿を作成"}
        </button>
      </p>
    </Form>
  );
}
```

はい、これでJavaScript対応のプログレッシブエンハンスメントを実装しました！🥳 これまでに行ったことで、エクスペリエンスはブラウザ単独でできることよりも優れています。多くのアプリはJavaScriptを使用してエクスペリエンスを*有効に*しています（そして、実際に動作するためにJavaScriptを必要とするアプリも少数あります）が、私たちはベースラインとして動作するエクスペリエンスを持ち、JavaScriptを使用してそれを*拡張*しただけです。

[disable-java-script]: https://developer.chrome.com/docs/devtools/javascript/

## 宿題

今日のところは以上です！さらに深く掘り下げたい場合は、以下の宿題を実装してみてください。

**投稿の更新/削除:** 投稿用の `posts.admin.$slug.tsx` ページを作成してください。これは、投稿を更新したり、削除したりできる編集ページを開く必要があります。リンクはすでにサイドバーにありますが、404を返します！投稿を読み込み、フィールドに入れる新しいルートを作成してください。必要なコードはすべて `app/routes/posts.$slug.tsx` と `app/routes/posts.admin.new.tsx` にあります。それらを組み合わせるだけです。

**楽観的UI:** ツイートをお気に入りに追加すると、ハートがすぐに赤くなり、ツイートが削除されると元に戻るのをご存知ですか？それが楽観的UIです。リクエストが成功すると仮定し、成功した場合にユーザーに表示されるものをレンダリングします。したがって、宿題は、「作成」を押すと、左側のナビゲーションに投稿がレンダリングされ、「新しい投稿を作成」リンクがレンダリングされるようにすることです（または、更新/削除を追加する場合は、それらも同様に）。そこにたどり着くのに少し時間がかかったとしても、これは思ったよりも簡単であることがわかるでしょう（そして、過去にこのパターンを実装したことがある場合は、Remixがこれをはるかに簡単にするでしょう）。詳細については、[保留中のUIガイド][the-pending-ui-guide]を参照してください。

**認証済みユーザーのみ:** もう1つクールな宿題は、認証済みユーザーのみが投稿を作成できるようにすることです。Indie Stackのおかげで、認証はすでにすべて設定されています。ヒント：自分だけが投稿できるようにしたい場合は、ローダーとアクションでユーザーのメールアドレスを確認し、自分のメールアドレスでない場合は、[どこか][somewhere]にリダイレクトするだけです😈

**アプリのカスタマイズ:** Tailwind CSSに満足している場合は、そのまま使用してください。それ以外の場合は、[スタイリングガイド][the-styling-guide]で他のオプションについて学んでください。`Notes`モデルとルートなどを削除します。このアプリを自分のものにするために、好きなようにしてください。

**アプリのデプロイ:** プロジェクトのREADMEを確認してください。Fly.ioにアプリをデプロイするための手順が記載されています。そうすれば、実際にブログを始めることができます！

Remixを気に入っていただければ幸いです！💿 👋

[gitpod]: https://gitpod.io

[gitpod-ready-to-code-image]: https://gitpod.io/#https://github.com/remix-run/indie-stack

[gitpod-ready-to-code]: https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod

[node-js]: https://nodejs.org

[npm]: https://www.npmjs.com

[vs-code]: https://code.visualstudio.com

[the-stacks-docs]: ../guides/templates#stacks

[the-indie-stack]: https://github.com/remix-run/indie-stack

[fly-io]: https://fly.io

[http-localhost-3000]: http://localhost:3000

[screenshot-of-the-app-showing-the-blog-post-link]: https://user-images.githubusercontent.com/1500684/160208939-34fe20ed-3146-4f4b-a68a-d82284339c47.png

[tailwind]: https://tailwindcss.com

[the-styling-guide]: ../styling/tailwind

[prisma]: https://prisma.io

[http-localhost-3000-posts-admin]: http://localhost:3000/posts/admin

[mdn-request]: https://developer.mozilla.org/en-US/docs/Web/API/Request

[mdn-request-form-data]: https://developer.mozilla.org/en-US/docs/Web/API/Request/formData

[disable-java-script]: https://developer.chrome.com/docs/devtools/javascript/disable

[the-pending-ui-guide]: ../discussion/pending-ui

[somewhere]: https://www.youtube.com/watch?v=dQw4w9WgXcQ

