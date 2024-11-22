---
title: ブログチュートリアル（短縮版）
order: 3
hidden: true
---

# ブログチュートリアル

このクイックスタートでは、コードを短く、説明を簡潔に記述します。Remixの概要を15分で知りたい方は、このチュートリアルが最適です。

<docs-info>このチュートリアルは、Kentが作成した<a target="_blank" rel="noopener noreferrer" href="https://rmx.as/egghead-course">無料のEgghead.ioコース</a>と併せて行うことをお勧めします。</docs-info>

このチュートリアルではTypeScriptを使用しています。RemixはTypeScriptなしでも使用できます。TypeScriptで記述すると生産性が向上しますが、TypeScript構文をスキップしたい場合は、JavaScriptでコードを記述することもできます。

<docs-info>💿 こんにちは、RemixコンパクトディスクのDerrickです 👋  何かを実行する必要がある場合は、私が表示されます。</docs-info>

## 前提条件

このボタンをクリックして、プロジェクトが設定され、VS CodeまたはJetBrainsで直接ブラウザまたはデスクトップで実行できる状態の[Gitpod][gitpod]ワークスペースを作成します。

[![Gitpodの準備完了][gitpod-ready-to-code]][gitpod-ready-to-code-image]

このチュートリアルを自分のコンピュータでローカルに実行する場合は、以下のものがインストールされている必要があります。

- [Node.js][node-js]バージョン（>=18.0.0）
- [npm][npm] 7以上
- コードエディタ（[VSCode][vs-code]がお勧めです）

## プロジェクトの作成

<docs-warning>Node v18以上を実行していることを確認してください。</docs-warning>

💿 Remixプロジェクトを初期化します。ここでは「blog-tutorial」という名前をつけますが、必要に応じて別の名前をつけることもできます。

```shellscript nonumber
npx create-remix@latest --template remix-run/indie-stack blog-tutorial
```

```
Install dependencies with npm?
Yes
```

[スタックのドキュメント][the-stacks-docs]で、使用可能なスタックについて詳しく読むことができます。

ここでは、[Indieスタック][the-indie-stack]を使用します。これは、[fly.io][fly-io]にデプロイする準備ができたフルアプリケーションです。開発ツールに加えて、本番環境対応の認証と永続化が含まれています。使用するツールに不慣れな場合でも心配しないでください。順を追って説明していきます。

<docs-info>注記：`--template`フラグなしで`npx create-remix@latest`を実行することで、「Just the basics」から始めることもできます。生成されるプロジェクトは、その場合、はるかに最小限のものになります。ただし、チュートリアルの一部は異なるものになり、デプロイ用の設定を手動で行う必要があります。</docs-info>

💿 次に、生成されたプロジェクトをお気に入りのエディタで開き、`README.md`ファイルの指示を確認してください。このファイルをよく読んでください。デプロイについては、チュートリアルの後半で説明します。

💿 開発サーバーを起動しましょう。

```shellscript nonumber
npm run dev
```

💿 [http://localhost:3000][http-localhost-3000]を開くと、アプリケーションが実行されているはずです。

時間があれば、UIを少し見てみてください。アカウントを作成して、ノートを作成したり削除したりして、UIで最初から使用できるものを確認してください。

## 最初のルート

`/posts`のURLでレンダリングされる新しいルートを作成します。その前に、ルートへのリンクを作成しましょう。

💿 `app/routes/_index.tsx`に投稿へのリンクを追加します。

以下をコピーして貼り付けます。

```tsx filename=app/routes/_index.tsx
<div className="mx-auto mt-16 max-w-7xl text-center">
  <Link
    to="/posts"
    className="text-xl text-blue-600 underline"
  >
    Blog Posts
  </Link>
</div>
```

どこにでも配置できます。私は、スタックで使用されているすべてのテクノロジーのアイコンのすぐ上に配置しました。

<!-- TODO: ウェブサイトが適切にデプロイされたら、この画像を自己ホスト型バージョンに更新します -->

<!-- ![ブログ投稿リンクを表示するアプリのスクリーンショット](/blog-tutorial/blog-post-link.png) -->

![ブログ投稿リンクを表示するアプリのスクリーンショット][screenshot-of-the-app-showing-the-blog-post-link]

<docs-info><a href="https://tailwindcss.com">Tailwind CSS</a>のクラスを使用していることに気づいたかもしれません。</docs-info>

Remix Indieスタックには、[Tailwind CSS][tailwind]のサポートが事前設定されています。Tailwind CSSを使用しない場合は、削除して別のものを使用することもできます。Remixでのスタイリングオプションの詳細については、[スタイリングガイド][the-styling-guide]をご覧ください。

ブラウザに戻ってリンクをクリックしてください。まだルートを作成していないため、404ページが表示されます。ルートを作成しましょう。

💿 `app/routes/posts._index.tsx`に新しいファイルを作成します。

```shellscript nonumber
touch app/routes/posts._index.tsx
```

<docs-info>ファイルやフォルダを作成するためのターミナルコマンドが表示された場合は、好きな方法で作成できますが、`touch`を使用すると、作成する必要があるファイルが明確になります。</docs-info>

ファイル名を`posts.tsx`にすることもできますが、すぐに別のルートを作成する予定なので、ファイルを隣り合わせに配置する方が便利です。インデックスルートは、親のパスでレンダリングされます（ウェブサーバーの`index.html`と同じです）。

これで、`/posts`ルートに移動すると、リクエストを処理する方法がないというエラーが表示されます。これは、まだそのルートで何もしていないからです。コンポーネントを追加して、デフォルトとしてエクスポートしましょう。

💿 投稿コンポーネントを作成します。

```tsx filename=app/routes/posts._index.tsx
export default function Posts() {
  return (
    <main>
      <h1>Posts</h1>
    </main>
  );
}
```

ブラウザを更新すると、新しい、シンプルな投稿ルートが表示されるはずです。

## データの読み込み

Remixにはデータ読み込み機能が組み込まれています。

最近の数年でウェブ開発を主に経験している場合は、おそらくここで2つのものを作成しているはずです。APIルートでデータを提供し、そのデータを利用するフロントエンドコンポーネントです。Remixでは、フロントエンドコンポーネントは独自のAPIルートでもあり、すでにサーバーからブラウザへの通信方法を認識しています。つまり、フェッチする必要はありません。

MVCウェブフレームワーク（Railsなど）でより以前から開発を行っている場合は、RemixルートをReactをテンプレートとして使用するバックエンドビューと考えることができます。ただし、分離されたjQueryコードでユーザーインタラクションを飾り立てる代わりに、ブラウザでシームレスにハイドレートして、華やかさを加えることができます。これは、完全な実現を遂げたプログレッシブエンハンスメントです。さらに、ルートは独自のコントローラです。

では、コンポーネントにデータを提供してみましょう。

💿 投稿ルートの`loader`を作成します。

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

`loader`関数は、コンポーネントのバックエンド「API」であり、`useLoaderData`によってすでに接続されています。Remixルートでは、クライアントとサーバーの境界線がぼやけているのは本当にすごいことです。サーバーとブラウザのコンソールを両方とも開いている場合は、両方に投稿データがログ出力されていることに気づきます。これは、Remixがサーバー上でレンダリングして従来のウェブフレームワークのように完全なHTMLドキュメントを送信しますが、クライアントでもハイドレートしてログ出力もしているためです。

<docs-error>
ローダーから返されるものは、コンポーネントがレンダリングしていなくても、クライアントに公開されます。ローダーは、公開APIエンドポイントと同じように慎重に扱ってください。
</docs-error>

💿 投稿へのリンクをレンダリングします。

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

素晴らしいですね。すべてが同じファイルで定義されているため、ネットワークリクエストでも非常に高いレベルの型安全性を実現しています。Remixがデータをフェッチしている最中にネットワークがダウンしない限り、このコンポーネントとそのAPI（コンポーネントはすでに独自のAPIルートであることを覚えておいてください）には型安全性があります。

## リファクタリング

良い慣習として、特定の懸念事項を扱うモジュールを作成することをお勧めします。ここでは、投稿の読み書きを扱うモジュールを作成します。モジュールを設定し、モジュールに`getPosts`エクスポートを追加します。

💿 `app/models/post.server.ts`を作成します。

```shellscript nonumber
touch app/models/post.server.ts
```

ほとんどのコードは、ルートからコピーして貼り付けるだけです。

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

`getPosts`関数を`async`にしています。現在非同期処理を行っていませんが、すぐに非同期処理を行うようになるためです。

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

Indie Stackを使用すると、SQLiteデータベースがすでに設定され、使用できるようになっているため、データベーススキーマをSQLiteに対応するように更新しましょう。データベースとのやり取りには[Prisma][prisma]を使用するため、スキーマを更新すると、Prismaがスキーマに合わせてデータベースを更新し、必要なSQLコマンドを生成して実行し、マイグレーションを実行します。

<docs-info>Remixを使用する場合、Prismaを使用する必要はありません。Remixは、現在使用しているデータベースやデータ永続化サービスと連携できます。</docs-info>

Prismaを初めて使用する場合は、心配しないでください。手順を説明していきます。

💿 まず、Prismaスキーマを更新する必要があります。

```prisma filename=prisma/schema.prisma nocopy
// このコードをファイルの最後に追加します。

model Post {
  slug     String @id
  title    String
  markdown String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

💿 スキーマの変更に合わせてマイグレーションファイルを作成しましょう。これは、ローカルで開発モードで実行するのではなく、アプリケーションをデプロイする場合に必要です。これにより、ローカルデータベースとTypeScript定義がスキーマの変更に合わせて更新されます。マイグレーションの名前は「create post model」とします。

```shellscript nonumber
npx prisma migrate dev --name "create post model"
```

💿 いくつかの投稿でデータベースをシードしましょう。`prisma/seed.ts`を開いて、シード機能の最後に（`console.log`の直前に）以下を追加します。

```ts filename=prisma/seed.ts
const posts = [
  {
    slug: "my-first-post",
    title: "My First Post",
    markdown: `
# This is my first post

Isn't it great?
    `.trim(),
  },
  {
    slug: "90s-mixtape",
    title: "A Mixtape I Made Just For You",
    markdown: `
# 90s Mixtape

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

<docs-info>注記：`upsert`を使用しているので、シードスクリプトを何度も実行しても、同じ投稿が複数回追加されることはありません。</docs-info>

シードスクリプトを使用して、投稿をデータベースに登録しましょう。

```
npx prisma db seed
```

💿 これで、`app/models/post.server.ts`ファイルを更新して、SQLiteデータベースから読み込めるようになりました。

```ts filename=app/models/post.server.ts
import { prisma } from "~/db.server";

export async function getPosts() {
  return prisma.post.findMany();
}
```

<docs-success>注記：返り値の型を削除できますが、それでもすべて型付けされています。PrismaのTypeScript機能は、最大の強みの1つです。手動で型付けする必要が少なくなり、それでも型安全性は維持されます。</docs-success>

<docs-info>`~/db.server`のインポートは、`app/db.server.ts`のファイルをインポートしています。`~`は`app`ディレクトリへの便利なエイリアスなので、ファイルの移動時に`../../`をいくつ含めるか考える必要はありません。</docs-info>

`http://localhost:3000/posts`にアクセスすると、投稿はまだ存在しているはずです。ただし、今回はSQLiteから取得されています。

## 動的ルートパラメータ

次に、投稿を実際に表示するルートを作成しましょう。以下のURLが動作するようにします。

```
/posts/my-first-post
/posts/90s-mixtape
```

投稿ごとにルートを作成するのではなく、URLに「動的セグメント」を使用できます。Remixが解析して渡すので、動的に投稿を検索できます。

💿 `app/routes/posts.$slug.tsx`に動的ルートを作成します。

```shellscript nonumber
touch app/routes/posts.\$slug.tsx
```

```tsx filename=app/routes/posts.$slug.tsx
export default function PostSlug() {
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        Some Post
      </h1>
    </main>
  );
}
```

投稿のいずれかをクリックすると、新しいページが表示されます。

💿 パラメータにアクセスするローダーを追加します。

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
        Some Post: {slug}
      </h1>
    </main>
  );
}
```

ファイル名に`$`が付いている部分は、ローダーに渡される`params`オブジェクトのキー名になります。これを使って投稿を検索します。

では、実際にスラグで投稿のコンテンツをデータベースから取得してみましょう。

💿 投稿モジュールに`getPost`関数を追加します。

```tsx filename=app/models/post.server.ts lines=[7-9]
import { prisma } from "~/db.server";

export async function getPosts() {
  return prisma.post.findMany();
}

export async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}
```

💿 ルートで新しい`getPost`関数を使用します。

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

確認してください。これで、投稿はJavaScriptとしてブラウザにすべて含めるのではなく、データソースから取得されるようになりました。

TypeScriptにコードを認識させましょう。

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

`params`の`invariant`について簡単に説明します。`params`はURLから取得されるため、`params.slug`が必ず定義されるとは限りません。ファイルの名前を`posts.$postId.ts`に変更したかもしれません！`invariant`を使用して検証すると良い習慣になり、TypeScriptも満足します。

投稿の`invariant`も追加しました。`404`のケースは後で適切に処理します。続行しましょう。

次に、マークダウンを解析してHTMLに変換し、ページにレンダリングしましょう。マークダウンパーサはたくさんありますが、このチュートリアルでは`marked`を使用します。これは非常に簡単に動作させることができるからです。

💿 マークダウンをHTMLに解析します。

```shellscript nonumber
npm add marked@^4.3.0
# さらに、TypeScriptを使用する場合は
npm add @types/marked@^4.3.1 -D
```

`marked`がインストールされたら、サーバーを再起動する必要があります。開発サーバーを停止し、`npm run dev`で再起動します。

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

すごいですね。これでブログができました。確認してみましょう。次は、新しいブログ投稿を作成しやすくします📝。

## ネストされたルーティング

現在、ブログ投稿はデータベースのシードから取得するだけです。これは現実的な解決策ではないため、データベースに新しいブログ投稿を作成する方法が必要です。ここでは、アクションを使用します。

アプリの新しい「admin」セクションを作成します。

💿 まず、投稿のインデックスルートに管理セクションへのリンクを追加します。

```tsx filename=app/routes/posts._index.tsx
// ...
<Link to="admin" className="text-red-600 underline">
  Admin
</Link>
// ...
```

コンポーネントのどこにでも配置できます。私は`<h1>`のすぐ下に配置しました。

<docs-info>`to`プロパティが「admin」で、`/posts/admin`にリンクしていることに気づいたでしょうか。Remixでは、相対リンクが使用されます。</docs-info>

💿 `app/routes/posts.admin.tsx`に管理ルートを作成します。

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

これまでの処理と似たものがいくつかあるはずです。これにより、左側に投稿が表示され、右側にプレースホルダーが表示されるページが作成されます。
管理者リンクをクリックすると、[http://localhost:3000/posts/admin][http-localhost-3000-posts-admin]に移動します。

### インデックスルート

そのプレースホルダーを、管理者のインデックスルートで埋めてみましょう。もう少し説明しますが、ルートファイルのネストがUIコンポーネントのネストになる「ネストされたルート」を導入します。

💿 `posts.admin.tsx`の子ルートのインデックスルートを作成します。

```shellscript nonumber
touch app/routes/posts.admin._index.tsx
```

```tsx filename=app/routes/posts.admin._index.tsx
import { Link } from "@remix-run/react";

export default function AdminIndex() {
  return (
    <p>
      <Link to="new" className="text-blue-600 underline">
        Create a New Post
      </Link>
    </p>
  );
}
```

ブラウザを更新しても、まだ表示されません。`app/routes/posts.admin.`で始まるすべてのルートは、URLが一致した場合、`app/routes/posts.admin.tsx`の_内部_でレンダリングできるようになりました。どの部分の`posts.admin.tsx`レイアウトに子ルートをレンダリングするかを制御できます。

💿 管理ページにアウトレットを追加します。

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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

少しお待ちください。インデックスルートは最初はわかりにくいかもしれません。URLが親ルートのパスに一致する場合、インデックスが`Outlet`の内部にレンダリングされることを覚えておいてください。

これが理解しやすいかもしれません。`/posts/admin/new`ルートを追加して、リンクをクリックしたときに何が起こるかを確認してみましょう。

💿 `app/routes/posts.admin.new.tsx`ファイルを作成します。

```shellscript nonumber
touch app/routes/posts.admin.new.tsx
```

```tsx filename=app/routes/posts.admin.new.tsx
export default function NewPost() {
  return <h2>New Post</h2>;
}
```

これで、インデックスルートからリンクをクリックすると、`<Outlet/>`が自動的にインデックスルートを「new」ルートに切り替えます。

## アクション

本格的に取り組みましょう。新しい「new」ルートに新しい投稿を作成するためのフォームを作成します。

💿 新しいルートにフォームを追加します。

```tsx filename=app/routes/posts.admin.new.tsx
import { Form } from "@remix-run/react";

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function NewPost() {
  return (
    <Form method="post">
      <p>
        <label>
          Post Title:{" "}
          <input
            type="text"
            name="title"
            className={inputClassName}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
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
          Create Post
        </button>
      </p>
    </Form>
  );
}
```

HTMLが好きな方は、ワクワクしているはずです。`<form onSubmit>`や`<button onClick>`をたくさん使用してきた方は、HTMLに驚かれるでしょう。

この機能に必要なものは、ユーザーからデータを取得するためのフォームと、それを処理するバックエンドアクションだけです。Remixでは、これだけです。

投稿を保存する方法の基本的なコードを、まず`post.ts`モジュールに作成しましょう。

💿 `app/models/post.server.ts`のどこにでも`createPost`を追加します。

```tsx filename=app/models/post.server.ts nocopy
// ...
export async function createPost(post) {
  return prisma.post.create({ data: post });
}
```

💿 新しい投稿ルートのアクションから`createPost`を呼び出します。

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

これで完了です。Remix（およびブラウザ）が、残りの処理を行います。送信ボタンをクリックすると、投稿がリストされているサイドバーが自動的に更新されます。

HTMLでは、入力の`name`属性はネットワーク経由で送信され、リクエストの`formData`で同じ名前で利用できます。ちなみに、`request`と`formData`のオブジェクトは、どちらもウェブ仕様のものです。どちらかのオブジェクトについて詳しく知りたい場合は、MDNをご覧ください。

- [`Request`][mdn-request]
- [`Request.formData`][mdn-request-form-data]。

TypeScriptはまた、怒っています。いくつかのフィールドに値が提供されなかった場合、APIを呼び出すことができるため、`createPost`の呼び出しに対してTypeScriptは怒っています。

投稿を作成する前に、バリデーションを追加しましょう。

💿 フォームデータに必要なものが含まれているかどうかを検証し、含まれていない場合はエラーを返します。

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
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
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

今回は、リダイレクトを返さずに、エラーを返します。これらのエラーは、`useActionData`によってコンポーネントから利用できます。`useLoaderData`に似ていますが、このデータはフォームPOSTの後、アクションから取得されます。

💿 UIにバリデーションメッセージを追加します。

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
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input type="text" name="title" className={inputClassName} />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input type="text" name="slug" className={