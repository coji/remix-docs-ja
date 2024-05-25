---
title: ブログチュートリアル（短縮版）
order: 3
hidden: true
---

# ブログチュートリアル

このクイックスタートでは、コードを短く、説明は簡潔に説明します。 Remixの概要を15分で理解したいなら、これを見るのがおすすめです。

<docs-info>Kentと一緒にこのチュートリアルをやってみましょう。 <a target="_blank" rel="noopener noreferrer" href="https://rmx.as/egghead-course">この無料のEgghead.ioコース</a></docs-info>

このチュートリアルではTypeScriptを使用しています。RemixはTypeScriptなしでも使用できます。私たちとしてはTypeScriptで記述した方が生産性が高いと感じていますが、TypeScriptの構文をスキップしたい場合は、JavaScriptでコードを書いても構いません。

<docs-info>💿 はい、僕はRemixのコンパクトディスクのDerrickです 👋 何らかの作業を行う必要がある場合は、僕のアイコンが表示されます。</docs-info>

## 事前準備

このボタンをクリックして、プロジェクトが設定され、VS CodeまたはJetBrainsで実行できる[Gitpod][gitpod]ワークスペースを作成します。ブラウザまたはデスクトップで直接使用できます。

[![Gitpod Ready-to-Code][gitpod-ready-to-code]][gitpod-ready-to-code-image]

このチュートリアルを自分のコンピュータでローカルに実行したい場合は、以下のものをインストールしておく必要があります。

- [Node.js][node-js]バージョン（>=18.0.0）
- [npm][npm]7以上
- コードエディタ（[VSCode][vs-code]がおすすめです）

## プロジェクトの作成

<docs-warning>Node v18以上を実行していることを確認してください。</docs-warning>

💿 Remixプロジェクトを初期化します。ここでは "blog-tutorial" としますが、必要に応じて別の名前を付けることができます。

```shellscript nonumber
npx create-remix@latest --template remix-run/indie-stack blog-tutorial
```

```
npmで依存関係をインストールしますか？
はい
```

[スタックのドキュメント][the-stacks-docs]で、利用可能なスタックの詳細を確認できます。

[Indieスタック][the-indie-stack]を使用しています。これは、[fly.io][fly-io]にデプロイできる完全なアプリケーションです。開発ツールに加えて、本番環境対応の認証と永続化が含まれています。使用されるツールに慣れていない場合でも心配しないでください。順を追って説明します。

<docs-info>「Just the basics」から始めたい場合は、`--template`フラグなしで`npx create-remix@latest`を実行することもできます。その場合、生成されるプロジェクトははるかに簡素化されます。ただし、チュートリアルのいくつかの部分は異なります。デプロイメントを自分で手動で構成する必要があります。</docs-info>

💿 生成されたプロジェクトを好みのエディタで開き、`README.md`ファイルの指示を確認します。これを読んでも構いません。チュートリアルでは後でデプロイメントについて説明します。

💿 デベロッパーサーバーを起動しましょう。

```shellscript nonumber
npm run dev
```

💿 [http://localhost:3000][http-localhost-3000]を開くと、アプリケーションが実行されます。

時間があれば、UIを少し見てみましょう。アカウントを作成して、ノートを作成したり削除したりして、すぐに使えるUIの機能を理解しましょう。

## 最初のルート

"/posts" URLでレンダリングされる新しいルートを作成します。その前に、そのルートへのリンクを追加します。

💿 `app/routes/_index.tsx`に投稿へのリンクを追加します。

次のコードをコピーして貼り付けてください。

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

どこに配置しても構いません。僕は、スタックで使用されているすべてのテクノロジーのアイコンのすぐ上に配置しました。

<!-- TODO: ウェブサイトが正常にデプロイされたら、この画像を自己ホストバージョンに変更します。 -->

<!-- ![投稿リンクが表示されたアプリのスクリーンショット](/blog-tutorial/blog-post-link.png) -->

![投稿リンクが表示されたアプリのスクリーンショット][screenshot-of-the-app-showing-the-blog-post-link]

<docs-info><a href="https://tailwindcss.com">Tailwind CSS</a>のクラスを使用していることに気付いたかもしれません。</docs-info>

Remix Indieスタックには、[Tailwind CSS][tailwind]のサポートが事前に設定されています。Tailwind CSSを使用しない場合は、削除して別のものを使用しても構いません。Remixでのスタイリングオプションの詳細については、[スタイリングガイド][the-styling-guide]をご覧ください。

ブラウザに戻って、リンクをクリックしてください。まだこのルートを作成していないため、404ページが表示されます。このルートを作成しましょう。

💿 `app/routes/posts._index.tsx`に新しいファイルを作成します。

```shellscript nonumber
touch app/routes/posts._index.tsx
```

<docs-info>ファイルやフォルダを作成するためのターミナルコマンドが表示された場合は、必要に応じてさまざまな方法で実行できますが、`touch`を使用することで、どのファイルを作成する必要があるのかを明確に示しています。</docs-info>

ファイル名を `posts.tsx` にすることもできますが、すぐに別のルートを作成するため、まとめておくと便利です。インデックスルートは親のパスでレンダリングされます（ウェブサーバーの `index.html` と同じように）。

これで、`/posts` ルートに移動すると、リクエストを処理する方法がないことを示すエラーが表示されます。これは、このルートでまだ何も行っていないためです！コンポーネントを追加して、デフォルトとしてエクスポートしましょう。

💿 投稿のコンポーネントを作成します。

```tsx filename=app/routes/posts._index.tsx
export default function Posts() {
  return (
    <main>
      <h1>Posts</h1>
    </main>
  );
}
```

ブラウザを更新すると、新しい投稿ルートが表示されます。

## データの読み込み

Remixにはデータ読み込み機能が組み込まれています。

ウェブ開発の経験が近年のものであれば、おそらくここで2つのものを作成していると思います。データを提供するAPIルートと、そのデータを利用するフロントエンドコンポーネントです。Remixでは、フロントエンドコンポーネントはAPIルートそのものであり、ブラウザからサーバーと通信する方法がすでに分かっています。つまり、フェッチする必要はありません。

RailsなどのMVCウェブフレームワークで開発経験がある場合は、RemixのルートをReactを使ってテンプレート化されたバックエンドビューと考えてください。ただし、ブラウザでシームレスにハイドレートするため、分離されたjQueryコードを記述してユーザーインタラクションを装飾する代わりに、Reactを使ってインタラクションを強化することができます。これは、プログレッシブエンハンスメントを最大限に実現したものです。さらに、ルートはコントローラーそのものです。

実際にやってみましょう。コンポーネントにデータを提供しましょう。

💿 投稿のルートローダーを作成します。

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

`loader` 関数はコンポーネントのバックエンド "API" であり、`useLoaderData` を通じてすでに接続されています。Remixのルートでは、クライアントとサーバーの境界が曖昧になっているのは、少し奇妙なことです。サーバーとブラウザのコンソールを両方とも開いていると、投稿データが両方にログ出力されていることに気付くでしょう。これは、Remixが従来のウェブフレームワークのように、完全なHTMLドキュメントをサーバーでレンダリングして送信しているためですが、同時にクライアントでハイドレートして、そこでもログ出力しているためです。

<docs-error>
ローダーから返されるものは、コンポーネントでレンダリングされなくても、クライアントに公開されます。ローダーは、パブリックAPIエンドポイントと同じように慎重に取り扱う必要があります。
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

すごいですね。ネットワークリクエストでも、かなり強力な型安全性が得られます。すべてが同じファイルで定義されているためです。Remixがデータを取得中にネットワークが停止しない限り、このコンポーネントとそのAPI（コンポーネントはAPIルートそのものです）では型安全性が確保されます。

## リファクタリング

一般的な手法として、特定の懸念事項を処理するモジュールを作成します。ここでは、投稿の読み書きを扱うモジュールを作成します。このモジュールを設定して、`getPosts` エクスポートを追加します。

💿 `app/models/post.server.ts`を作成します。

```shellscript nonumber
touch app/models/post.server.ts
```

ルートからほとんどのコードをコピーして貼り付けます。

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

`getPosts` 関数を `async` にしていることに注意してください。現在非同期処理を行っていませんが、すぐに非同期処理を行うようになります！

💿 投稿ルートを更新して、新しい投稿モジュールを使用します。

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

Indie Stackを使用すると、SQLiteデータベースがすでに設定されており、私たちのために構成されているため、SQLiteを処理するようにデータベーススキーマを更新する必要があります。[Prisma][prisma]を使ってデータベースとやり取りするため、スキーマを更新すると、Prismaがスキーマに一致するようにデータベースを更新します（必要なSQLコマンドを生成して実行し、マイグレーションを作成します）。

<docs-info>Remixを使用する際に、Prismaを使用する必要はありません。Remixは、現在使用しているデータベースやデータ永続化サービスと連携して動作します。</docs-info>

Prismaを初めて使う方は、ご安心ください。順を追って説明します。

💿 まず、Prismaスキーマを更新する必要があります。

```prisma filename=prisma/schema.prisma nocopy
// このコードをファイルの最後に貼り付けます。

model Post {
  slug     String @id
  title    String
  markdown String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

💿 スキーマの変更に対応するマイグレーションファイルを作成します。これは、ローカルで開発モードで実行するのではなく、アプリケーションをデプロイする場合に必要となります。これにより、ローカルデータベースとTypeScript定義もスキーマの変更に合わせて更新されます。マイグレーションの名前は「create post model」とします。

```shellscript nonumber
npx prisma migrate dev --name "create post model"
```

💿 データベースをいくつかの投稿でシードしましょう。`prisma/seed.ts`を開いて、シード機能の最後に（`console.log`の直前に）このコードを追加します。

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

<docs-info>シードスクリプトを何度も実行しても、同じ投稿が複数追加されないように、`upsert`を使用していることに注意してください。</docs-info>

シードスクリプトを使って、投稿をデータベースに登録しましょう。

```
npx prisma db seed
```

💿 これで、`app/models/post.server.ts`ファイルを更新して、SQLiteデータベースから読み込むことができます。

```ts filename=app/models/post.server.ts
import { prisma } from "~/db.server";

export async function getPosts() {
  return prisma.post.findMany();
}
```

<docs-success>返り値の型は削除できますが、すべて型付けされています。PrismaのTypeScript機能は、最も強力な機能の1つです。手動での型付けが減り、型安全性を維持できます！</docs-success>

<docs-info>`~/db.server`のインポートは、`app/db.server.ts`のファイルを読み込んでいます。`~`は`app`ディレクトリへの特別なエイリアスなので、ファイルを移動したときに、どのくらいの`../../`をインポートに含める必要があるかを気にする必要はありません。</docs-info>

`http://localhost:3000/posts`にアクセスすると、投稿が表示されます。ただし、今回はSQLiteから取得されています！

## 動的なルートパラメータ

投稿を実際に表示するためのルートを作成します。これらのURLが動作するようにします。

```
/posts/my-first-post
/posts/90s-mixtape
```

投稿ごとにルートを作成する代わりに、URLに "動的なセグメント" を使用できます。Remixはこれを解析して渡してくれるので、投稿を動的に検索できます。

💿 `app/routes/posts.$slug.tsx`に動的なルートを作成します。

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
        Some Post: {slug}
      </h1>
    </main>
  );
}
```

ファイル名に `$` が付いている部分は、ローダーに渡される `params` オブジェクトのキーになります。このキーを使って投稿を検索します。

これで、スラッグを使ってデータベースから投稿の内容を取得しましょう。

💿 投稿モジュールに `getPost` 関数を作成します。

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

すごいですね！データベースから投稿を取得するようになりました。ブラウザにJavaScriptとしてすべての投稿を含める必要はありません。

TypeScriptをコードに合わせて修正します。

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

`params` の `invariant` について簡単に説明します。`params` はURLから取得されるため、`params.slug` が必ず定義されるとは限りません。ファイル名を `posts.$postId.ts` に変更したかもしれません！`invariant`を使って検証するのが良い習慣であり、TypeScriptも喜ぶでしょう。

投稿の `invariant` もあります。`404` のケースは後でより適切に処理します。続行しましょう！

これで、マークダウンを解析してHTMLに変換し、ページにレンダリングしましょう。マークダウンパーサーはたくさんありますが、このチュートリアルでは、非常に簡単に使える `marked` を使用します。

💿 マークダウンをHTMLに解析します。

```shellscript nonumber
npm add marked@^4.3.0
# TypeScriptを使用している場合
npm add @types/marked@^4.3.1 -D
```

`marked` がインストールされたら、サーバーを再起動する必要があります。そのため、デベロッパーサーバーを停止して、`npm run dev`で再起動します。

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

やったね！ブログができました！次は、新しいブログ投稿を作成しやすくします📝

## ネストされたルーティング

今のところ、ブログ投稿はデータベースのシードから取得されています。これは実際のソリューションではないため、データベースに新しいブログ投稿を作成する方法が必要です。アクションを使用します。

アプリに新しい "admin" セクションを作成します。

💿 まず、投稿のインデックスルートに管理セクションへのリンクを追加します。

```tsx filename=app/routes/posts._index.tsx
// ...
<Link to="admin" className="text-red-600 underline">
  Admin
</Link>
// ...
```

コンポーネントのどこにでも配置できます。僕は `<h1>` のすぐ下に配置しました。

<docs-info>`to` プロパティが "admin" で、`/posts/admin` にリンクしていることに注意しましたか？Remixでは、相対リンクが使用されます。</docs-info>

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

これまでに行ってきたこととよく似ているので、すぐに理解できるでしょう。これで、投稿が左側に表示され、右側にプレースホルダーが表示されるページができました。
管理者リンクをクリックすると、[http://localhost:3000/posts/admin][http-localhost-3000-posts-admin]に移動します。

### インデックスルート

そのプレースホルダーに、管理者のインデックスルートを埋め込みましょう。少し難しいですが、ルートファイルのネストがUIコンポーネントのネストに対応する "ネストされたルート" を導入します。

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

更新しても、まだ表示されません。`app/routes/posts.admin.`で始まるすべてのルートは、URLが一致すると、`app/routes/posts.admin.tsx`の_内部_でレンダリングできます。子ルートを `posts.admin.tsx` のレイアウトのどの部分にレンダリングするかを制御できます。

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

少しお待ちください。インデックスルートは最初は分かりにくい場合があります。URLが親ルートのパスと一致すると、インデックスが `Outlet` 内でレンダリングされることを覚えておいてください。

わかりやすくするために、`/posts/admin/new` ルートを追加して、リンクをクリックしたときにどうなるかを見てみましょう。

💿 `app/routes/posts.admin.new.tsx` ファイルを作成します。

```shellscript nonumber
touch app/routes/posts.admin.new.tsx
```

```tsx filename=app/routes/posts.admin.new.tsx
export default function NewPost() {
  return <h2>New Post</h2>;
}
```

これで、インデックスルートのリンクをクリックすると、`<Outlet/>` がインデックスルートを "new" ルートに自動的に切り替える様子を確認できます！

## アクション

いよいよ本題に入ります。新しい "new" ルートに、新しい投稿を作成するためのフォームを構築しましょう。

💿 newルートにフォームを追加します。

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

HTMLが好きな方は、ワクワクしているはずです。ずっと `<form onSubmit>` と `<button onClick>` を使ってきた方は、HTMLに驚くでしょう。

この機能に必要なのは、ユーザーからデータを取得するためのフォームと、それを処理するバックエンドのアクションだけです。Remixでは、これだけです。

まず、`post.ts` モジュールに投稿を保存する方法の基本となるコードを作成します。

💿 `app/models/post.server.ts` の任意の場所に `createPost` を追加します。

```tsx filename=app/models/post.server.ts nocopy
// ...
export async function createPost(post) {
  return prisma.post.create({ data: post });
}
```

💿 new投稿ルートのアクションから `createPost` を呼び出します。

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

以上です。Remix（とブラウザ）がその他を処理します。送信ボタンをクリックして、投稿一覧のサイドバーが自動的に更新される様子を確認しましょう。

HTMLでは、入力の `name` 属性はネットワーク経由で送信され、リクエストの `formData` で同じ名前で利用できます。ちなみに、`request` と `formData` のオブジェクトはどちらもウェブ仕様に準拠しています。これらについて詳しく知りたい場合は、MDNをご覧ください！

- [`Request`][mdn-request]
- [`Request.formData`][mdn-request-form-data].

TypeScriptが怒っています。型を追加しましょう。

💿 `app/models/post.server.ts`に型を追加します。

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

TypeScriptを使用しているかどうかに関係なく、ユーザーがこれらのフィールドのいずれかの値を提供しなかった場合に問題が発生します（TypeScriptは `createPost` の呼び出しについて怒っています）。

投稿を作成する前に、バリデーションを追加しましょう。

💿 フォームデータに必要なものがあるか検証し、なければエラーを返します。

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

今回はリダイレクトを返さず、エラーを返していることに注意してください。これらのエラーは、`useActionData` を通じてコンポーネントで使用できます。これは `useLoaderData` と似ていますが、フォームのPOST後にアクションからデータが取得されます。

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
            <em className="text-red