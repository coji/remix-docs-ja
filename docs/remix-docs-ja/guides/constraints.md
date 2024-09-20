---
title: モジュール制約
---

# モジュール制約

Remix はサーバーとブラウザの両方でアプリケーションを実行するために、アプリケーションモジュールとサードパーティ依存関係は**モジュール副作用**に注意する必要があります。

- **サーバー専用コード** - Remix はサーバー専用コードを削除しますが、サーバー専用コードを使用するモジュール副作用がある場合は削除できません。
- **ブラウザ専用コード** - Remix はサーバーでレンダリングされるため、モジュールはモジュール副作用を持つことはできませんし、ブラウザ専用 API を呼び出す最初のレンダリングロジックを持つこともできません。

## サーバーコードの刈り込み

Remix コンパイラは、ブラウザバンドルからサーバーコードを自動的に削除します。私たちの戦略は実際には非常に単純ですが、いくつかのルールに従う必要があります。

1. それはあなたのルートモジュールの前に「プロキシ」モジュールを作成します
2. プロキシモジュールはブラウザ固有のエクスポートのみをインポートします

`loader`、`meta`、コンポーネントをエクスポートするルートモジュールを考えてみましょう。

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

サーバーはこのファイルのすべてを必要としますが、ブラウザに必要なのはコンポーネントと `meta` だけです。実際には、`prisma` モジュールをブラウザバンドルに含めると、完全に壊れてしまいます。そのモジュールは node 専用の API でいっぱいです！

ブラウザバンドルからサーバーコードを削除するために、Remix コンパイラはあなたのルートの前にプロキシモジュールを作成し、代わりにそれをバンドルします。このルートのプロキシは次のようになります。

```tsx
export { meta, default } from "./routes/posts.tsx";
```

コンパイラは `app/routes/posts.tsx` のコードを分析し、`meta` とコンポーネント内のコードのみを保持します。その結果、次のようになります。

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

かなりきれいです！これで、ブラウザ用に安全にバンドルできます。では、何が問題なのでしょうか？

### モジュール副作用なし

副作用に慣れていない場合は、あなただけではありません！今すぐ副作用を特定するお手伝いをします。

簡単に言うと、**副作用**とは、_何かをする_可能性のあるコードです。**モジュール副作用**とは、_モジュールがロードされたときに何かをする_可能性のあるコードです。

<docs-info>モジュール副作用とは、モジュールをインポートするだけで実行されるコードのことです。</docs-info>

先ほどのコードを例に、コンパイラが使用されていないエクスポートとそのインポートを削除できる様子を見てきました。しかし、この一見無害なコード行を追加すると、アプリが壊れてしまいます！

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

`console.log` は_何かをしています_。モジュールはインポートされ、すぐにコンソールに出力されます。コンパイラは、モジュールがインポートされたときに実行する必要があるため、これを削除しません。コンパイラはこのようなものをバンドルします。

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

ローダーはなくなりましたが、prisma 依存関係は残っています！もし私たちが `console.log("hello!")` のような無害なものをログに出力していたら、問題ありませんでした。しかし、`prisma` モジュールをログに出力したので、ブラウザはそれを処理するのに苦労するでしょう。

これを修正するには、コードを_ローダーの中に_移動することで、副作用を削除します。

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

これはもはやモジュール副作用（モジュールがインポートされたときに実行されます）ではなく、ローダーの副作用（ローダーが呼び出されたときに実行されます）。コンパイラは、このモジュール内の他の場所で使用されていないため、ローダーと prisma のインポートの両方を削除します。

時折、ビルドがサーバーで実行されるべきコードをツリーシェイクする際に問題が発生することがあります。このような場合は、ファイルの拡張子に `.server` を追加してファイルタイプを指定する、という慣習を使用することができます。たとえば、`db.server.ts` のようになります。ファイル名に `.server` を追加することで、コンパイラはブラウザ用のバンドルを作成する際にこのモジュールやそのインポートを気にしないようにします。

### 高階関数

Remix の初心者の中には、ローダーを「高階関数」で抽象化しようとする人もいます。このようなものになります。

```ts bad filename=app/http.ts
import { redirect } from "@remix-run/node"; // または cloudflare/deno

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

そして、このように使用しようとします。

```ts bad filename=app/root.ts
import { json } from "@remix-run/node"; // または cloudflare/deno

import { removeTrailingSlash } from "~/http";

export const loader = removeTrailingSlash(({ request }) => {
  return json({ some: "data" });
});
```

おそらく、これがモジュール副作用であるため、コンパイラは `removeTrailingSlash` コードを刈り取ることができないことに気づいているでしょう。

このタイプの抽象化は、応答を早期に返すために導入されます。`loader` で `Response` をスローできるため、これをよりシンプルにすることができ、同時にモジュール副作用を削除することで、サーバーコードを刈り取ることができます。

```ts filename=app/http.ts
import { redirect } from "@remix-run/node"; // または cloudflare/deno

export function removeTrailingSlash(url) {
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    throw redirect(request.url.slice(0, -1), {
      status: 308,
    });
  }
}
```

そして、このように使用します。

```tsx filename=app/root.tsx
import { json } from "@remix-run/node"; // または cloudflare/deno

import { removeTrailingSlash } from "~/http";

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  removeTrailingSlash(request.url);
  return json({ some: "data" });
};
```

これは、このようなものがたくさんある場合にも、はるかに読みやすくなります。

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
// これに対して
export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  removeTrailingSlash(request.url);
  const session = await getSession(request);
  const user = await requireUser(session);
  return json(user);
};
```

もしあなたが少し余分な読書をしたいのであれば、「push vs. pull API」について調べてみてください。応答をスローする能力は、モデルを「push」から「pull」に変更します。これは、人々がコールバックよりも async/await を好み、高階コンポーネントやレンダリングプロップよりも React フックを好むのと同じ理由です。

## サーバーでのブラウザ専用コード

ブラウザバンドルとは異なり、Remix はサーバーバンドルから_ブラウザ専用コード_を削除しようとはしません。なぜなら、ルートモジュールはサーバーでレンダリングするためにすべてのエクスポートを必要とするからです。つまり、ブラウザでのみ実行されるべきコードに注意することがあなたの仕事になります。

<docs-error>これはアプリを壊します。</docs-error>

```ts bad lines=3
import { loadStripe } from "@stripe/stripe-js";

const stripe = await loadStripe(window.ENV.stripe);

export async function redirectToStripeCheckout(
  sessionId: string
) {
  return stripe.redirectToCheckout({ sessionId });
}
```

<docs-info>モジュールスコープで `window` にアクセスしたり、API を初期化したりするような、ブラウザ専用モジュール副作用を避ける必要があります。</docs-info>

### ブラウザ専用 API の初期化

最も一般的なシナリオは、モジュールがインポートされたときにサードパーティ API を初期化することです。これに対処する簡単な方法がいくつかあります。

#### ドキュメントガード

これは、`document` が存在する場合にのみライブラリが初期化されることを保証します。つまり、ブラウザにいるということです。Deno のようなサーバーランタイムはグローバルな `window` を利用できるため、`window` ではなく `document` をお勧めします。

```ts lines=[3]
import firebase from "firebase/app";

if (typeof document !== "undefined") {
  firebase.initializeApp(document.ENV.firebase);
}

export { firebase };
```

#### 遅延初期化

この戦略は、ライブラリが実際に使用されるまで初期化を延期します。

```ts lines=[4]
import { loadStripe } from "@stripe/stripe-js";

export async function redirectToStripeCheckout(
  sessionId: string
) {
  const stripe = await loadStripe(window.ENV.stripe);
  return stripe.redirectToCheckout({ sessionId });
}
```

ライブラリを複数回初期化することを避けたい場合は、モジュールスコープ変数に格納することができます。

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

<docs-info>これらの戦略のいずれも、ブラウザモジュールをサーバーバンドルから削除するわけではありませんが、API はイベントハンドラやエフェクト内でのみ呼び出されるため、問題ありません。イベントハンドラやエフェクトはモジュール副作用ではありません。</docs-info>

### ブラウザ専用 API を使用したレンダリング

もう1つの一般的なケースは、レンダリング中にブラウザ専用 API を呼び出すコードです。React（Remix だけではありません）でサーバーレンダリングを行う場合、API はサーバーには存在しないため、これは避ける必要があります。

<docs-error>これは、サーバーがローカルストレージを使用しようとするため、アプリを壊します。</docs-error>

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

これは、コードを `useEffect` に移動することで修正できます。`useEffect` はブラウザでのみ実行されます。

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

これで、`localStorage` は最初のレンダリング時にアクセスされなくなりました。これはサーバーで動作します。ブラウザでは、その状態はハイドレーション後にすぐに埋められます。しかし、大きなコンテンツレイアウトシフトが発生しないことを願っています！もし発生したら、その状態をデータベースやクッキーに移してみましょう。そうすれば、サーバーサイドからアクセスできます。

### `useLayoutEffect`

このフックを使用すると、React はサーバーでそれを使用していることを警告します。

このフックは、次のような状況で状態を設定する場合に適しています。

- 要素がポップアップしたときの要素の位置（メニューボタンなど）
- ユーザーの操作に応じてスクロール位置

つまり、エフェクトをブラウザのペイントと同じタイミングで実行することで、ポップアップが `0,0` に表示されてからバウンドして正しい位置に移動するのを防ぐことができます。レイアウトエフェクトを使用することで、ペイントとエフェクトを同時に実行し、このようなちらつきを防ぐことができます。

これは、要素内でレンダリングされる状態を設定する場合には**適していません**。`useLayoutEffect` で設定された状態を要素内で使用していないことを確認すれば、React の警告は無視できます。

`useLayoutEffect` を正しく呼び出していることがわかっているだけで、警告を無効にする必要がある場合は、サーバーでは何も呼び出さない独自のフックを作成するのが一般的な解決策です。`useLayoutEffect` はブラウザでのみ実行されるため、これは有効です。**この方法を使用する際は十分に注意してください。この警告は、正当な理由で表示されているのです！**

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

### サードパーティモジュール副作用

一部のサードパーティライブラリには、React のサーバーレンダリングと互換性のない独自のモジュール副作用があります。通常は、機能検出のために `window` にアクセスしようとしています。

これらのライブラリは、React のサーバーレンダリングと互換性がないため、Remix とも互換性がないことを意味します。幸いなことに、React エコシステムにおけるサードパーティライブラリのほとんどは、このような動作はしません。

代替手段を見つけることをお勧めします。しかし、どうしても見つからない場合は、[patch-package][patch-package] を使用してアプリで修正することをお勧めします。

[patch-package]: https://www.npmjs.com/package/patch-package
