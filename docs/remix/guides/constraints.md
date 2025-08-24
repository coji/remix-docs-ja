---
title: モジュール制約
---

# モジュール制約

Remixがサーバーとブラウザの両方の環境であなたのアプリを実行するためには、アプリケーションモジュールとサードパーティの依存関係は**モジュールの副作用**に注意する必要があります。

*   **サーバー専用コード** — Remixはサーバー専用コードを削除しますが、サーバー専用コードを使用するモジュールの副作用がある場合は削除できません。
*   **ブラウザ専用コード** — Remixはサーバーでレンダリングするため、モジュールに副作用があったり、ブラウザ専用のAPIを呼び出す最初のレンダリングロジックを含めることはできません。

## サーバーコードの枝刈り

Remixコンパイラーは、ブラウザバンドルからサーバーコードを自動的に削除します。私たちの戦略は実際には非常に単純ですが、いくつかのルールに従う必要があります。

1.  ルートモジュールの前に「プロキシ」モジュールを作成します
2.  プロキシモジュールは、ブラウザ固有のエクスポートのみをインポートします

`loader`、`meta`、およびコンポーネントをエクスポートするルートモジュールを考えてみましょう。

```tsx
import { json } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData } from "@remix-run/react";

import { prisma } from "../db";
import PostsView from "../PostsView";

export async function loader() {
  return json(await prisma.post.findMany());
}

export function meta() {
  return [{ title: "Posts" }];
}

export default function Posts() {
  const posts = useLoaderData<typeof loader>();
  return <PostsView posts={posts} />;
}
```

サーバーはこのファイル内のすべてを必要としますが、ブラウザはコンポーネントと`meta`のみを必要とします。実際、ブラウザバンドルに`prisma`モジュールを含めると完全に壊れてしまいます。それはnode専用のAPIでいっぱいです！

ブラウザバンドルからサーバーコードを削除するために、Remixコンパイラーはルートの前にプロキシモジュールを作成し、代わりにそれをバンドルします。このルートのプロキシは次のようになります。

```tsx
export { meta, default } from "./routes/posts.tsx";
```

コンパイラーは`app/routes/posts.tsx`のコードを分析し、`meta`とコンポーネント内にあるコードのみを保持します。結果は次のようになります。

```tsx
import { useLoaderData } from "@remix-run/react";

import PostsView from "../PostsView";

export function meta() {
  return [{ title: "Posts" }];
}

export default function Posts() {
  const posts = useLoaderData<typeof loader>();
  return <PostsView posts={posts} />;
}
```

かなり巧妙です！これでブラウザ用にバンドルしても安全です。では、何が問題なのでしょうか？

### モジュール副作用なし

もし副作用についてよく知らないとしても、それはあなただけではありません！これから副作用を特定するお手伝いをします。

簡単に言うと、**副作用**とは、何かを*実行する可能性のある*コードのことです。**モジュール副作用**とは、*モジュールがロードされたときに何かを実行する可能性のある*コードのことです。

<docs-info>モジュール副作用とは、モジュールをインポートするだけで実行されるコードのことです。</docs-info>

先ほどのコードを例にすると、コンパイラが使用されていないエクスポートとそのインポートを削除できることがわかりました。しかし、一見無害なこのコード行を追加すると、アプリが壊れてしまいます！

```tsx bad lines=[7]
import { json } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData } from "@remix-run/react";

import { prisma } from "../db";
import PostsView from "../PostsView";

console.log(prisma);

export async function loader() {
  return json(await prisma.post.findMany());
}

export function meta() {
  return [{ title: "Posts" }];
}

export default function Posts() {
  const posts = useLoaderData<typeof loader>();
  return <PostsView posts={posts} />;
}
```

この `console.log` は*何かを実行します*。モジュールがインポートされ、すぐにコンソールにログが出力されます。コンパイラは、モジュールがインポートされたときに実行する必要があるため、これを削除しません。次のようなものがバンドルされます。

```tsx bad lines=[3,6]
import { useLoaderData } from "@remix-run/react";

import { prisma } from "../db"; //😬
import PostsView from "../PostsView";

console.log(prisma); //🥶

export function meta() {
  return [{ title: "Posts" }];
}

export default function Posts() {
  const posts = useLoaderData<typeof loader>();
  return <PostsView posts={posts} />;
}
```

ローダーはなくなりましたが、prismaの依存関係は残っています！もし `console.log("hello!")` のような無害なものをログに記録していたら問題ありませんでした。しかし、`prisma` モジュールをログに記録したため、ブラウザはこれに苦労することになります。

これを修正するには、コードを*ローダーの中に*移動するだけで副作用を削除します。

```tsx lines=[8]
import { json } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData } from "@remix-run/react";

import { prisma } from "../db";
import PostsView from "../PostsView";

export async function loader() {
  console.log(prisma);
  return json(await prisma.post.findMany());
}

export function meta() {
  return [{ title: "Posts" }];
}

export default function Posts() {
  const posts = useLoaderData<typeof loader>();
  return <PostsView posts={posts} />;
}
```

これはもはやモジュール副作用（モジュールがインポートされたときに実行される）ではなく、ローダーの副作用（ローダーが呼び出されたときに実行される）です。コンパイラは、モジュール内の他の場所で使用されていないため、ローダー*とprismaのインポート*の両方を削除します。

場合によっては、ビルドがサーバーでのみ実行されるべきコードのツリーシェイキングに苦労することがあります。このような場合は、ファイルタイプの前（例：`db.server.ts`）に拡張子 `.server` を付けてファイルに名前を付けるという規則を使用できます。ファイル名に `.server` を追加すると、ブラウザ用にバンドルする際に、コンパイラはこのモジュールまたはそのインポートを気にしないようにというヒントになります。

### 高階関数

Remix の初心者の中には、「高階関数」を使ってローダーを抽象化しようとする人がいます。以下のような感じです。

```ts bad filename=app/http.ts
import { redirect } from "@remix-run/node"; // or cloudflare/deno

export function removeTrailingSlash(loader) {
  return function (arg) {
    const { request } = arg;
    const url = new URL(request.url);
    if (
      url.pathname !== "/" &&
      url.pathname.endsWith("/")
    ) {
      return redirect(request.url.slice(0, -1), {
        status: 308,
      });
    }
    return loader(arg);
  };
}
```

そして、以下のように使おうとします。

```ts bad filename=app/root.ts
import { json } from "@remix-run/node"; // or cloudflare/deno

import { removeTrailingSlash } from "~/http";

export const loader = removeTrailingSlash(({ request }) => {
  return json({ some: "data" });
});
```

おそらく、これがモジュール側の副作用であるため、コンパイラが `removeTrailingSlash` コードを削除できないことがわかるでしょう。

このタイプの抽象化は、レスポンスを早期に返そうとするために導入されます。`loader` で Response を throw できるため、これをよりシンプルにし、同時にモジュール側の副作用を削除して、サーバーコードを削除できるようにすることができます。

```ts filename=app/http.ts
import { redirect } from "@remix-run/node"; // or cloudflare/deno

export function removeTrailingSlash(url) {
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    throw redirect(request.url.slice(0, -1), {
      status: 308,
    });
  }
}
```

そして、以下のように使用します。

```tsx filename=app/root.tsx
import { json } from "@remix-run/node"; // or cloudflare/deno

import { removeTrailingSlash } from "~/http";

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  removeTrailingSlash(request.url);
  return json({ some: "data" });
};
```

これらがたくさんある場合、以下のように記述する方がはるかに読みやすくなります。

```tsx
// これ
export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  return removeTrailingSlash(request.url, () => {
    return withSession(request, (session) => {
      return requireUser(session, (user) => {
        return json(user);
      });
    });
  });
};
```

```tsx
// vs. これ
export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  removeTrailingSlash(request.url);
  const session = await getSession(request);
  const user = await requireUser(session);
  return json(user);
};
```

もし、課外学習をしたいのであれば、「push vs. pull API」で検索してみてください。レスポンスを throw する機能は、モデルを「push」から「pull」に変更します。これは、人々がコールバックよりも async/await を好み、高階コンポーネントやレンダープロップよりも React フックを好むのと同じ理由です。

## サーバー上でのブラウザ専用コード

ブラウザバンドルとは異なり、Remixはサーバーバンドルから*ブラウザ専用コード*を削除しようとはしません。なぜなら、ルートモジュールはサーバー上でレンダリングするためにすべてのエクスポートを必要とするからです。つまり、ブラウザでのみ実行されるべきコードに注意するのはあなたの責任です。

<docs-error>これはアプリを壊します:</docs-error>

```ts bad lines=3
import { loadStripe } from "@stripe/stripe-js";

const stripe = await loadStripe(window.ENV.stripe);

export async function redirectToStripeCheckout(
  sessionId: string
) {
  return stripe.redirectToCheckout({ sessionId });
}
```

<docs-info>モジュールスコープでwindowにアクセスしたり、APIを初期化したりするような、ブラウザ専用のモジュール副作用を避ける必要があります。</docs-info>

### ブラウザ専用 API の初期化

最も一般的なシナリオは、モジュールがインポートされたときにサードパーティ API を初期化することです。これに対処する簡単な方法がいくつかあります。

#### ドキュメントガード

これは、ライブラリが `document` が存在する場合、つまりブラウザにいる場合にのみ初期化されるようにします。Deno のようなサーバーランタイムではグローバルな `window` が利用可能であるため、`window` よりも `document` を推奨します。

```ts lines=[3]
import firebase from "firebase/app";

if (typeof document !== "undefined") {
  firebase.initializeApp(document.ENV.firebase);
}

export { firebase };
```

#### 遅延初期化

この戦略では、ライブラリが実際に使用されるまで初期化を延期します。

```ts lines=[4]
import { loadStripe } from "@stripe/stripe-js";

export async function redirectToStripeCheckout(
  sessionId: string
) {
  const stripe = await loadStripe(window.ENV.stripe);
  return stripe.redirectToCheckout({ sessionId });
}
```

モジュールスコープの変数に格納することで、ライブラリの複数回の初期化を避けることができます。

```ts
import { loadStripe } from "@stripe/stripe-js";

let _stripe;
async function getStripe() {
  if (!_stripe) {
    _stripe = await loadStripe(window.ENV.stripe);
  }
  return _stripe;
}

export async function redirectToStripeCheckout(
  sessionId: string
) {
  const stripe = await getStripe();
  return stripe.redirectToCheckout({ sessionId });
}
```

<docs-info>これらの戦略のいずれもブラウザモジュールをサーバーバンドルから削除するわけではありませんが、APIはモジュールの副作用ではないイベントハンドラーとエフェクト内でのみ呼び出されるため、問題ありません。</docs-info>

### ブラウザのみの API を使用したレンダリング

もう 1 つの一般的なケースは、レンダリング中にブラウザのみの API を呼び出すコードです。React でサーバーレンダリングを行う場合（Remix だけでなく）、API はサーバー上に存在しないため、これを避ける必要があります。

<docs-error>サーバーがローカルストレージを使用しようとするため、これはアプリを壊します</docs-error>

```ts bad lines=2
function useLocalStorage(key: string) {
  const [state, setState] = useState(
    localStorage.getItem(key)
  );

  const setWithLocalStorage = (nextState) => {
    setState(nextState);
  };

  return [state, setWithLocalStorage];
}
```

この問題を解決するには、ブラウザでのみ実行される `useEffect` にコードを移動します。

```tsx lines=[2,4-6]
function useLocalStorage(key: string) {
  const [state, setState] = useState(null);

  useEffect(() => {
    setState(localStorage.getItem(key));
  }, [key]);

  const setWithLocalStorage = (nextState) => {
    setState(nextState);
  };

  return [state, setWithLocalStorage];
}
```

これで、`localStorage` は最初のレンダリング時にアクセスされなくなり、サーバーで動作するようになります。ブラウザでは、その状態はハイドレーションの直後にすぐに埋められます。ただし、大きなコンテンツレイアウトシフトが発生しないことを願います。もし発生する場合は、その状態をデータベースまたは Cookie に移動して、サーバー側からアクセスできるようにすることを検討してください。

### `useLayoutEffect`

このフックを使用すると、Reactはサーバーでの使用について警告します。

このフックは、次のような状態を設定する場合に最適です。

*   ポップアップ表示される要素の位置（メニューボタンなど）
*   ユーザーの操作に応じたスクロール位置

重要な点は、ブラウザの描画と同時にエフェクトを実行し、ポップアップが `0,0` に表示されてから所定の位置に移動するのを見ないようにすることです。レイアウトエフェクトを使用すると、描画とエフェクトが同時に発生し、このようなちらつきを回避できます。

要素内でレンダリングされる状態を設定するのには**適していません**。`useLayoutEffect` で設定された状態を要素内で使用しないようにすれば、Reactの警告を無視できます。

`useLayoutEffect` を正しく呼び出していることがわかっていて、警告を非表示にしたいだけの場合は、ライブラリで一般的な解決策として、サーバーで何も呼び出さない独自のフックを作成する方法があります。`useLayoutEffect` はブラウザでのみ実行されるため、これでうまくいくはずです。**警告には正当な理由があるため、これは慎重に使用してください！**

```ts
import * as React from "react";

const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

const useLayoutEffect = canUseDOM
  ? React.useLayoutEffect
  : () => {};
```

### サードパーティモジュールの副作用

一部のサードパーティライブラリには、Reactサーバーレンダリングと互換性のない独自のモジュール副作用があります。通常、機能検出のために `window` にアクセスしようとします。

これらのライブラリはReactでのサーバーレンダリングと互換性がないため、Remixとも互換性がありません。幸いなことに、Reactエコシステムでは、このような動作をするサードパーティライブラリはごくわずかです。

代替手段を見つけることをお勧めします。しかし、どうしても見つからない場合は、[patch-package][patch-package]を使用してアプリ内で修正することをお勧めします。

[patch-package]: https://www.npmjs.com/package/patch-package
