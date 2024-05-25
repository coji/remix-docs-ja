---
title: クッキー
---

# クッキー

[クッキー][cookie]は、サーバーがHTTPレスポンスでクライアントに送信する小さな情報で、ブラウザは後続のリクエストでサーバーに送信します。この技術は、多くのインタラクティブなWebサイトの基本的な構成要素であり、状態を追加することで、認証（[セッション][sessions]参照）、ショッピングカート、ユーザー設定、および「ログイン」しているユーザーを記憶する必要があるその他の多くの機能を構築できます。

Remixの`Cookie`インターフェースは、クッキーのメタデータのための論理的で再利用可能なコンテナを提供します。

## クッキーの使用

手動でこれらのクッキーを作成することもできますが、[セッションストレージ][sessions]を使用する方が一般的です。

Remixでは、通常、`loader`関数または`action`関数（<Link to="../mutations">ミューテーション</Link>を参照）でクッキーを操作します。これらの関数は、データの読み書きが必要な場所です。

たとえば、電子商取引サイトに、現在セール中の商品をチェックするようにユーザーに促すバナーがあるとします。バナーはホームページの上部に表示され、ユーザーが少なくとも1週間は表示されないように、バナーを非表示にするボタンが横に付いています。

まず、クッキーを作成します。

```ts filename=app/cookies.server.ts
import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const userPrefs = createCookie("user-prefs", {
  maxAge: 604_800, // 1週間
});
```

次に、クッキーを`import`し、`loader`関数または`action`関数で使用できます。この場合の`loader`は、ユーザー設定の値をチェックするだけで、コンポーネントで使用してバナーを表示するかどうかを判断します。ボタンをクリックすると、`<form>`はサーバー上の`action`を呼び出し、バナーなしでページを再読み込みします。

**注:** 現時点では、アプリに必要なすべてのクッキーを`*.server.ts`ファイルに作成し、ルートモジュールに`import`することをお勧めします。これにより、Remixコンパイラは、これらの`import`をブラウザビルドから正しく削除できるため、ブラウザビルドでは必要ありません。この注意書きは、今後削除される予定です。

```tsx filename=app/routes/_index.tsx lines=[12,17-19,26-28,37]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"; // or cloudflare/deno
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno
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

## クッキー属性

クッキーには、有効期限、アクセス方法、送信先を制御する[いくつかの属性][cookie-attrs]があります。これらの属性は、`createCookie(name, options)`で指定するか、`Set-Cookie`ヘッダーが生成されるときの`serialize()`中に指定することができます。

```ts
const cookie = createCookie("user-prefs", {
  // これは、このクッキーのデフォルトです。
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: true,
  expires: new Date(Date.now() + 60_000),
  maxAge: 60,
});

// デフォルトを使用することもできます。
cookie.serialize(userPrefs);

// または、必要に応じて個々の属性をオーバーライドすることもできます。
cookie.serialize(userPrefs, { sameSite: "strict" });
```

これらの属性の詳細については、[属性に関する詳細情報][cookie-attrs]を参照して、これらの属性がどのように機能するかを理解してください。

## クッキーの署名

クッキーのコンテンツを受け取ったときに自動的に検証できるように、クッキーに署名することができます。HTTPヘッダーを偽造することは比較的簡単であるため、認証情報（[セッション][sessions]を参照）など、偽造したくない情報は署名することをお勧めします。

クッキーに署名するには、最初にクッキーを作成するときに、1つ以上の`secrets`を指定します。

```ts
const cookie = createCookie("user-prefs", {
  secrets: ["s3cret1"],
});
```

1つ以上の`secrets`を持つクッキーは、クッキーの整合性を確保する方法で保存および検証されます。

`secrets`配列の先頭に新しい`secrets`を追加することで、`secrets`をローテーションできます。古い`secrets`で署名されたクッキーは、`cookie.parse()`で引き続き正常にデコードされ、最新の`secrets`（配列の最初の`secrets`）は、`cookie.serialize()`で作成される送信されるクッキーに常に使用されます。

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
  // oldCookieは「olds3cret」で署名されている可能性がありますが、それでも正常に解析されます。
  const value = await cookie.parse(oldCookie);

  new Response("...", {
    headers: {
      // Set-Cookieは「n3wsecr3t」で署名されています。
      "Set-Cookie": await cookie.serialize(value),
    },
  });
}
```

## `createCookie`

サーバーからブラウザクッキーを管理するための論理的なコンテナを作成します。

```ts
import { createCookie } from "@remix-run/node"; // or cloudflare/deno

const cookie = createCookie("cookie-name", {
  // これらはすべて、実行時にオーバーライドできるオプションのデフォルトです。
  expires: new Date(Date.now() + 60_000),
  httpOnly: true,
  maxAge: 60,
  path: "/",
  sameSite: "lax",
  secrets: ["s3cret1"],
  secure: true,
});
```

各属性の詳細については、[MDN Set-Cookieドキュメント][cookie-attrs]を参照してください。

## `isCookie`

オブジェクトがRemixクッキーコンテナである場合は`true`を返します。

```ts
import { isCookie } from "@remix-run/node"; // or cloudflare/deno
const cookie = createCookie("user-prefs");
console.log(isCookie(cookie));
// true
```

## クッキーAPI

クッキーコンテナは、`createCookie`から返され、いくつかのプロパティとメソッドを持っています。

```ts
const cookie = createCookie(name);
cookie.name;
cookie.parse();
// etc.
```

### `cookie.name`

`Cookie`と`Set-Cookie`のHTTPヘッダーで使用されるクッキーの名前。

### `cookie.parse()`

指定された`Cookie`ヘッダーからこのクッキーの値を抽出して返します。

```ts
const value = await cookie.parse(
  request.headers.get("Cookie")
);
```

### `cookie.serialize()`

値をシリアライズし、このクッキーのオプションと組み合わせて`Set-Cookie`ヘッダーを作成します。これは、送信される`Response`で使用できます。

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

クッキーが`secrets`を使用している場合は`true`、それ以外の場合は`false`になります。

```ts
let cookie = createCookie("user-prefs");
console.log(cookie.isSigned); // false

cookie = createCookie("user-prefs", {
  secrets: ["soopersekrit"],
});
console.log(cookie.isSigned); // true
```

### `cookie.expires`

このクッキーが期限切れになる`Date`。クッキーに`maxAge`と`expires`の両方がある場合、この値は、`Max-Age`が`Expires`よりも優先されるため、現在の時刻から`maxAge`の値を加えた日時になります。

```ts
const cookie = createCookie("user-prefs", {
  expires: new Date("2021-01-01"),
});

console.log(cookie.expires); // "2020-01-01T00:00:00.000Z"
```

[sessions]: ./sessions
[cookie]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
[cookie-attrs]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes


