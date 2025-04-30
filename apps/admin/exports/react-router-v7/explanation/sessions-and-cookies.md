---
title: セッションとクッキー
---

# セッションとクッキー

## セッション

セッションは、特にサーバー側のフォーム検証やページに JavaScript がない場合に、サーバーが同じ人物からのリクエストを識別できるようにする Web サイトの重要な部分です。セッションは、ソーシャル、e コマース、ビジネス、教育 Web サイトなど、ユーザーが「ログイン」できる多くのサイトの基本的な構成要素です。

React Router をフレームワークとして使用する場合、セッションは、（express ミドルウェアのようなものではなく）[`SessionStorage`][session-storage] インターフェースを実装する「セッションストレージ」オブジェクトを使用して、`loader` および `action` メソッドでルートごとに管理されます。セッションストレージは、クッキーを解析および生成する方法、およびセッションデータをデータベースまたはファイルシステムに保存する方法を理解しています。

### セッションの使用

これは、クッキーセッションストレージの例です。

```ts filename=app/sessions.server.ts
import { createCookieSessionStorage } from "react-router";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      // `createCookie` からの Cookie または Cookie を作成するための CookieOptions
      cookie: {
        name: "__session",

        // これらはすべてオプションです
        domain: "reactrouter.com",
        // Expires も設定できます（ただし、maxAge を組み合わせて使用すると、maxAge がオーバーライドされます）。
        // この方法は、`new Date` がサーバーのデプロイごとに 1 つの日付のみを作成し、将来の動的な日付を作成しないため、推奨されないことに注意してください。
        //
        // expires: new Date(Date.now() + 60_000),
        httpOnly: true,
        maxAge: 60,
        path: "/",
        sameSite: "lax",
        secrets: ["s3cret1"],
        secure: true,
      },
    }
  );

export { getSession, commitSession, destroySession };
```

セッションデータにアクセスする必要があるすべてのルートが同じ場所からインポートできるように、`app/sessions.server.ts` にセッションストレージオブジェクトを設定することをお勧めします。

セッションストレージオブジェクトへの入出力は HTTP クッキーです。`getSession()` は、受信リクエストの `Cookie` ヘッダーから現在のセッションを取得し、`commitSession()`/`destroySession()` は、送信応答の `Set-Cookie` ヘッダーを提供します。

`loader` および `action` 関数でセッションにアクセスするためのメソッドを使用します。

`getSession` でセッションを取得した後、返されたセッションオブジェクトには、いくつかのメソッドとプロパティがあります。

```tsx
export async function action({
  request,
}: ActionFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  session.get("foo");
  session.has("bar");
  // など
}
```

セッションオブジェクトで使用できるすべてのメソッドの詳細については、[セッション API][session-api] を参照してください。

### ログインフォームの例

ログインフォームは次のようになります。

```tsx filename=app/routes/login.tsx lines=[4-7,12-14,16,22,25,33-35,46,51,56,61]
import { data, redirect } from "react-router";
import type { Route } from "./+types/login";

import {
  getSession,
  commitSession,
} from "../sessions.server";

export async function loader({
  request,
}: Route.LoaderArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );

  if (session.has("userId")) {
    // すでにサインインしている場合は、ホームページにリダイレクトします。
    return redirect("/");
  }

  return data(
    { error: session.get("error") },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export async function action({
  request,
}: Route.ActionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");

  const userId = await validateCredentials(
    username,
    password
  );

  if (userId == null) {
    session.flash("error", "ユーザー名/パスワードが無効です");

    // エラーが発生したログインページにリダイレクトします。
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.set("userId", userId);

  // ログインに成功したので、ホームページに送信します。
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Login({
  loaderData,
}: Route.ComponentProps) {
  const { error } = loaderData;

  return (
    <div>
      {error ? <div className="error">{error}</div> : null}
      <form method="POST">
        <div>
          <p>サインインしてください</p>
        </div>
        <label>
          ユーザー名: <input type="text" name="username" />
        </label>
        <label>
          パスワード:{" "}
          <input type="password" name="password" />
        </label>
      </form>
    </div>
  );
}
```

そして、ログアウトフォームは次のようになります。

```tsx filename=app/routes/logout.tsx
import {
  getSession,
  destroySession,
} from "../sessions.server";
import type { Route } from "./+types/logout";

export async function action({
  request,
}: Route.ActionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export default function LogoutRoute() {
  return (
    <>
      <p>本当にログアウトしますか？</p>
      <Form method="post">
        <button>ログアウト</button>
      </Form>
      <Link to="/">やっぱりやめる</Link>
    </>
  );
}
```

<docs-warning>ログアウト（またはそのための任意の変更）は、`loader` ではなく `action` で行うことが重要です。そうしないと、ユーザーが [クロスサイトリクエストフォージェリ][csrf] 攻撃にさらされることになります。</docs-warning>

### セッションの注意点

ネストされたルートのため、単一のページを構築するために複数のローダーを呼び出すことができます。`session.flash()` または `session.unset()` を使用する場合は、リクエスト内の他のローダーがそれを読み取ろうとしないことを確認する必要があります。そうしないと、競合状態が発生します。通常、フラッシュを使用している場合は、単一のローダーでそれを読み取る必要があります。別のローダーがフラッシュメッセージを必要とする場合は、そのローダーに別のキーを使用します。

### カスタムセッションストレージの作成

React Router を使用すると、必要に応じて独自のデータベースにセッションを簡単に保存できます。[`createSessionStorage()`][create-session-storage] API には、セッションデータを管理するための `cookie`（クッキーを作成するためのオプションについては、[クッキー][cookies] を参照）と、作成、読み取り、更新、および削除（CRUD）メソッドのセットが必要です。クッキーは、セッション ID を永続化するために使用されます。

- クッキーにセッション ID が存在しない場合、最初のセッション作成時に `commitSession` から `createData` が呼び出されます。
- クッキーにセッション ID が存在する場合、`getSession` から `readData` が呼び出されます。
- クッキーにセッション ID がすでに存在する場合、`commitSession` から `updateData` が呼び出されます。
- `destroySession` から `deleteData` が呼び出されます。

次の例は、汎用データベースクライアントを使用してこれを行う方法を示しています。

```ts
import { createSessionStorage } from "react-router";

function createDatabaseSessionStorage({
  cookie,
  host,
  port,
}) {
  // データベースクライアントを設定します...
  const db = createDatabaseClient(host, port);

  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      // `expires` は、データが無効と見なされる日付です。
      // これを使用して、データを何らかの方法で無効にしたり、
      // データベースからこのレコードを自動的に削除したりできます。
      const id = await db.insert(data);
      return id;
    },
    async readData(id) {
      return (await db.select(id)) || null;
    },
    async updateData(id, data, expires) {
      await db.update(id, data);
    },
    async deleteData(id) {
      await db.delete(id);
    },
  });
}
```

そして、次のように使用できます。

```ts
const { getSession, commitSession, destroySession } =
  createDatabaseSessionStorage({
    host: "localhost",
    port: 1234,
    cookie: {
      name: "__session",
      sameSite: "lax",
    },
  });
```

`createData` および `updateData` の `expires` 引数は、クッキー自体が期限切れになり、無効になる同じ `Date` です。この情報を使用して、データベースからセッションレコードを自動的に削除してスペースを節約したり、古い期限切れのクッキーのデータを返さないようにしたりできます。

### 追加のセッションユーティリティ

必要に応じて、他にもいくつかのセッションユーティリティを利用できます。

- [`isSession`][is-session]
- [`createMemorySessionStorage`][create-memory-session-storage]
- [`createSession`][create-session] (カスタムストレージ)
- [`createFileSessionStorage`][create-file-session-storage] (node)
- [`createWorkersKVSessionStorage`][create-workers-kv-session-storage] (Cloudflare Workers)
- [`createArcTableSessionStorage`][create-arc-table-session-storage] (architect, Amazon DynamoDB)

## クッキー

[クッキー][cookie] は、サーバーが HTTP 応答で誰かに送信する小さな情報であり、そのブラウザーは後続のリクエストで返送します。この手法は、認証（[セッション][sessions] を参照）、ショッピングカート、ユーザー設定、および「ログイン」している人を記憶する必要があるその他の多くの機能を作成できるように状態を追加する、多くのインタラクティブな Web サイトの基本的な構成要素です。

React Router の [`Cookie` インターフェース][cookie-api] は、クッキーメタデータの論理的で再利用可能なコンテナーを提供します。

### クッキーの使用

これらのクッキーを手動で作成することもできますが、[セッションストレージ][sessions] を使用するのが一般的です。

React Router では、通常、データを読み書きする必要がある場所であるため、`loader` および/または `action` 関数でクッキーを操作します。

たとえば、e コマースサイトに、現在セール中のアイテムをチェックするようにユーザーに促すバナーがあるとします。バナーはホームページの上部にまたがり、ユーザーがバナーを非表示にして、少なくとも 1 週間は表示されないようにするためのボタンが側面に含まれています。

まず、クッキーを作成します。

```ts filename=app/cookies.server.ts
import { createCookie } from "react-router";

export const userPrefs = createCookie("user-prefs", {
  maxAge: 604_800, // 1週間
});
```

次に、クッキーを `import` して、`loader` および/または `action` で使用できます。この場合の `loader` は、ユーザー設定の値を確認するだけで、コンポーネントでバナーをレンダリングするかどうかを決定するために使用できます。ボタンをクリックすると、`<form>` がサーバーで `action` を呼び出し、バナーなしでページをリロードします。

### ユーザー設定の例

```tsx filename=app/routes/home.tsx lines=[4,9-11,18-20,29]
import { Link, Form, redirect } from "react-router";
import type { Route } from "./+types/home";

import { userPrefs } from "../cookies.server";

export async function loader({
  request,
}: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};
  return { showBanner: cookie.showBanner };
}

export async function action({
  request,
}: Route.ActionArgs) {
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

export default function Home({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      {loaderData.showBanner ? (
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

### クッキー属性

クッキーには、期限切れになるタイミング、アクセス方法、送信先を制御する[いくつかの属性][cookie-attrs]があります。これらの属性は、`createCookie(name, options)` で指定するか、`Set-Cookie` ヘッダーが生成されるときに `serialize()` で指定できます。

```ts
const cookie = createCookie("user-prefs", {
  // これらはこのクッキーのデフォルトです。
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: true,
  expires: new Date(Date.now() + 60_000),
  maxAge: 60,
});

// デフォルトを使用することもできます。
cookie.serialize(userPrefs);

// または、必要に応じて個々のものをオーバーライドすることもできます。
cookie.serialize(userPrefs, { sameSite: "strict" });
```

これらの属性が何をするかをよりよく理解するには、[これらの属性に関する詳細情報][cookie-attrs]をお読みください。

### クッキーの署名

クッキーに署名して、受信時にその内容を自動的に検証することができます。HTTP ヘッダーを偽造するのは比較的簡単であるため、認証情報（[セッション][sessions] を参照）など、誰かに偽造されたくない情報にはこれが適しています。

クッキーに署名するには、最初にクッキーを作成するときに 1 つ以上の `secrets` を指定します。

```ts
const cookie = createCookie("user-prefs", {
  secrets: ["s3cret1"],
});
```

1 つ以上の `secrets` を持つクッキーは、クッキーの整合性を保証する方法で保存および検証されます。

`secrets` 配列の先頭に新しいシークレットを追加することで、シークレットをローテーションできます。古いシークレットで署名されたクッキーは、`cookie.parse()` で正常にデコードされ、`cookie.serialize()` で作成された送信クッキーに署名するために、常に最新のシークレット（配列の最初のもの）が使用されます。

```ts filename=app/cookies.server.ts
export const cookie = createCookie("user-prefs", {
  secrets: ["n3wsecr3t", "olds3cret"],
});
```

```tsx filename=app/routes/my-route.tsx
import { data } from "react-router";
import { cookie } from "../cookies.server";
import type { Route } from "./+types/my-route";

export async function loader({
  request,
}: Route.LoaderArgs) {
  const oldCookie = request.headers.get("Cookie");
  // oldCookie は "olds3cret" で署名されている可能性がありますが、それでも正常に解析されます
  const value = await cookie.parse(oldCookie);

  return data("...", {
    headers: {
      // Set-Cookie は "n3wsecr3t" で署名されています
      "Set-Cookie": await cookie.serialize(value),
    },
  });
}
```

### 追加のクッキーユーティリティ

必要に応じて、他にもいくつかのクッキーユーティリティを利用できます。

- [`isCookie`][is-cookie]
- [`createCookie`][create-cookie]

各属性の詳細については、[MDN Set-Cookie ドキュメント][cookie-attrs]を参照してください。

[csrf]: https://developer.mozilla.org/ja/docs/Glossary/CSRF
[cookies]: #cookies
[sessions]: #sessions
[session-storage]: https://api.reactrouter.com/v7/interfaces/react_router.SessionStorage
[session-api]: https://api.reactrouter.com/v7/interfaces/react_router.Session
[is-session]: https://api.reactrouter.com/v7/functions/react_router.isSession
[cookie-api]: https://api.reactrouter.com/v7/interfaces/react_router.Cookie
[create-session-storage]: https://api.reactrouter.com/v7/functions/react_router.createSessionStorage
[create-session]: https://api.reactrouter.com/v7/functions/react_router.createSession
[create-memory-session-storage]: https://api.reactrouter.com/v7/functions/react_router.createMemorySessionStorage
[create-file-session-storage]: https://api.reactrouter.com/v7/functions/_react_router_node.createFileSessionStorage
[create-workers-kv-session-storage]: https://api.reactrouter.com/v7/functions/_react_router_cloudflare.createWorkersKVSessionStorage
[create-arc-table-session-storage]: https://api.reactrouter.com/v7/functions/_react_router_architect.createArcTableSessionStorage
[cookie]: https://developer.mozilla.org/ja/docs/Web/HTTP/Cookies
[cookie-attrs]: https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Set-Cookie#attributes
[is-cookie]: https://api.reactrouter.com/v7/functions/react_router.isCookie
[create-cookie]: https://api.reactrouter.com/v7/functions/react_router.createCookie

