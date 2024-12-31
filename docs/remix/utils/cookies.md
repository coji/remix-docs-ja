---
title: Cookies
---

# クッキー

[クッキー][cookie]とは、サーバーがHTTPレスポンスで送信する小さな情報であり、ブラウザは後続のリクエストでそれを送り返します。この技術は、認証（[セッション][sessions]を参照）、ショッピングカート、ユーザー設定、および「ログイン」している人を記憶する必要があるその他の多くの機能を作成できるように、状態を追加する多くのインタラクティブなWebサイトの基本的な構成要素です。

Remixの`Cookie`インターフェースは、クッキーのメタデータのための論理的で再利用可能なコンテナを提供します。

[cookie]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
[sessions]: ./sessions

## クッキーの使用

これらのクッキーを手動で作成することもできますが、[セッションストレージ][sessions]を使用する方が一般的です。

Remixでは、通常、`loader`や`action`関数（<Link to="../mutations">ミューテーション</Link>を参照）でクッキーを操作します。これらはデータの読み書きが必要な場所だからです。

例えば、あなたのeコマースサイトに、現在セール中の商品をチェックするようユーザーに促すバナーがあるとします。バナーはホームページの上部に表示され、ユーザーがバナーを閉じて少なくとも1週間は表示されないようにするためのボタンが側面にあります。

まず、クッキーを作成します。

```ts filename=app/cookies.server.ts
import { createCookie } from "@remix-run/node"; // または cloudflare/deno

export const userPrefs = createCookie("user-prefs", {
  maxAge: 604_800, // 1週間
});
```

次に、クッキーを`import`して、`loader`や`action`で使用できます。この例では、`loader`はユーザー設定の値を確認するだけで、コンポーネントでバナーを表示するかどうかを決定するために使用できます。ボタンがクリックされると、`<form>`がサーバー上の`action`を呼び出し、バナーなしでページをリロードします。

**注意:** アプリに必要なすべてのクッキーを`*.server.ts`ファイルで作成し、それらをルートモジュールに`import`することを（今のところ）推奨します。これにより、Remixコンパイラーは、ブラウザビルドで不要なこれらのインポートを正しく削除できます。最終的にはこの注意書きを削除したいと考えています。

```tsx filename=app/routes/_index.tsx lines=[12,17-19,26-28,37]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"; // または cloudflare/deno
import { json, redirect } from "@remix-run/node"; // または cloudflare/deno
import {
  useLoaderData,
  Link,
  Form,
} from "@remix-run/react";

import { userPrefs } from "~/cookies.server";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};
  return json({ showBanner: cookie.showBanner });
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};
  const bodyParams = await request.formData();

  if (bodyParams.get("bannerVisibility") === "hidden") {
    cookie.showBanner = false;
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
}

export default function Home() {
  const { showBanner } = useLoaderData<typeof loader>();

  return (
    <div>
      {showBanner ? (
        <div>
          <Link to="/sale">セールをお見逃しなく！</Link>
          <Form method="post">
            <input
              type="hidden"
              name="bannerVisibility"
              value="hidden"
            />
            <button type="submit">非表示</button>
          </Form>
        </div>
      ) : null}
      <h1>ようこそ！</h1>
    </div>
  );
}
```

## Cookie の属性

Cookie には、有効期限、アクセス方法、送信先を制御する[いくつかの属性][cookie-attrs]があります。これらの属性は、`createCookie(name, options)` で指定するか、`Set-Cookie` ヘッダーが生成される際の `serialize()` で指定できます。

```ts
const cookie = createCookie("user-prefs", {
  // これらはこの Cookie のデフォルトです。
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: true,
  expires: new Date(Date.now() + 60_000),
  maxAge: 60,
});

// デフォルトを使用することもできます。
cookie.serialize(userPrefs);

// または、必要に応じて個別に上書きすることもできます。
cookie.serialize(userPrefs, { sameSite: "strict" });
```

これらの属性が何をするのかをより深く理解するために、[これらの属性に関する詳細情報][cookie-attrs]をお読みください。

## クッキーの署名

クッキーに署名することで、受信時にその内容を自動的に検証することが可能です。HTTPヘッダーを偽造するのは比較的簡単なので、認証情報（[セッション][sessions]を参照）のように、誰かに偽造されたくない情報については、これは良い考えです。

クッキーに署名するには、最初にクッキーを作成するときに1つ以上の`secrets`を提供します。

```ts
const cookie = createCookie("user-prefs", {
  secrets: ["s3cret1"],
});
```

1つ以上の`secrets`を持つクッキーは、クッキーの整合性を保証する方法で保存および検証されます。

`secrets`配列の先頭に新しいシークレットを追加することで、シークレットをローテーションできます。古いシークレットで署名されたクッキーは、`cookie.parse()`で正常にデコードされ、`cookie.serialize()`で作成された送信クッキーの署名には常に最新のシークレット（配列の最初のもの）が使用されます。

```ts filename=app/cookies.server.ts
export const cookie = createCookie("user-prefs", {
  secrets: ["n3wsecr3t", "olds3cret"],
});
```

```tsx filename=app/routes/route.tsx
import { cookie } from "~/cookies.server";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const oldCookie = request.headers.get("Cookie");
  // oldCookieは"olds3cret"で署名されている可能性がありますが、それでも正常に解析されます
  const value = await cookie.parse(oldCookie);

  new Response("...", {
    headers: {
      // Set-Cookieは"n3wsecr3t"で署名されます
      "Set-Cookie": await cookie.serialize(value),
    },
  });
}
```

## `createCookie`

サーバーからブラウザのクッキーを管理するための論理的なコンテナを作成します。

```ts
import { createCookie } from "@remix-run/node"; // または cloudflare/deno

const cookie = createCookie("cookie-name", {
  // これらはすべてオプションのデフォルト値で、実行時に上書きできます
  expires: new Date(Date.now() + 60_000),
  httpOnly: true,
  maxAge: 60,
  path: "/",
  sameSite: "lax",
  secrets: ["s3cret1"],
  secure: true,
});
```

各属性の詳細については、[MDN Set-Cookie ドキュメント][cookie-attrs]を参照してください。

[cookie-attrs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie

## `isCookie`

オブジェクトが Remix のクッキーコンテナである場合に `true` を返します。

```ts
import { isCookie } from "@remix-run/node"; // または cloudflare/deno
const cookie = createCookie("user-prefs");
console.log(isCookie(cookie));
// true
```

## Cookie API

`createCookie` から返されるクッキーコンテナには、いくつかのプロパティとメソッドがあります。

```ts
const cookie = createCookie(name);
cookie.name;
cookie.parse();
// など
```

### `cookie.name`

`Cookie` および `Set-Cookie` HTTP ヘッダーで使用されるクッキーの名前です。

### `cookie.parse()`

指定された `Cookie` ヘッダーから、このクッキーの値を抽出して返します。

```ts
const value = await cookie.parse(
  request.headers.get("Cookie")
);
```

### `cookie.serialize()`

値をシリアライズし、このクッキーのオプションと組み合わせて、送信 `Response` で使用するのに適した `Set-Cookie` ヘッダーを作成します。

```ts
new Response("...", {
  headers: {
    "Set-Cookie": await cookie.serialize({
      showBanner: true,
    }),
  },
});
```

### `cookie.isSigned`

クッキーが何らかの `secrets` を使用している場合は `true`、そうでない場合は `false` になります。

```ts
let cookie = createCookie("user-prefs");
console.log(cookie.isSigned); // false

cookie = createCookie("user-prefs", {
  secrets: ["soopersekrit"],
});
console.log(cookie.isSigned); // true
```

### `cookie.expires`

このクッキーが期限切れになる `Date` です。クッキーに `maxAge` と `expires` の両方が設定されている場合、`Max-Age` が `Expires` より優先されるため、この値は現在の時刻に `maxAge` の値を加算した日付になります。

```ts
const cookie = createCookie("user-prefs", {
  expires: new Date("2021-01-01"),
});

console.log(cookie.expires); // "2020-01-01T00:00:00.000Z"
```

[sessions]: ./sessions

[cookie]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

[cookie-attrs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes

