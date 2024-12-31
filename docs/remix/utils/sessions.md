---
title: セッション
---

# セッション

セッションはウェブサイトの重要な要素であり、特にサーバーサイドのフォーム検証やページ上でJavaScriptが利用できない場合に、サーバーが同じ人物からのリクエストを識別できるようにします。セッションは、ソーシャル、eコマース、ビジネス、教育ウェブサイトなど、ユーザーが「ログイン」できる多くのサイトの基本的な構成要素です。

Remixでは、セッションは（expressミドルウェアのようなものではなく）`SessionStorage`インターフェースを実装する「セッションストレージ」オブジェクトを使用して、`loader`および`action`メソッドでルートごとに管理されます。セッションストレージは、クッキーを解析および生成する方法、およびセッションデータをデータベースまたはファイルシステムに保存する方法を理解しています。

Remixには、一般的なシナリオに対応するいくつかの事前構築済みのセッションストレージオプションと、独自のセッションストレージを作成するためのオプションが用意されています。

* `createCookieSessionStorage`
* `createMemorySessionStorage`
* `createFileSessionStorage` (node)
* `createWorkersKVSessionStorage` (Cloudflare Workers)
* `createArcTableSessionStorage` (architect, Amazon DynamoDB)
* `createSessionStorage` を使用したカスタムストレージ

## セッションの使用

これは、クッキーセッションストレージの例です。

```ts filename=app/sessions.ts
// app/sessions.ts
import { createCookieSessionStorage } from "@remix-run/node"; // または cloudflare/deno

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
        domain: "remix.run",
        // Expires も設定できます（ただし、maxAge を組み合わせて使用すると maxAge が優先されます）。
        // この方法は、`new Date` が各サーバーデプロイメントで1つの日付のみを作成し、将来の動的な日付を作成しないため、推奨されないことに注意してください。
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

セッションストレージオブジェクトは `app/sessions.ts` に設定することをお勧めします。これにより、セッションデータにアクセスする必要があるすべてのルートが同じ場所からインポートできます（[ルートモジュールの制約][constraints]も参照してください）。

セッションストレージオブジェクトへの入出力は HTTP クッキーです。`getSession()` は、受信リクエストの `Cookie` ヘッダーから現在のセッションを取得し、`commitSession()`/`destroySession()` は、送信レスポンスの `Set-Cookie` ヘッダーを提供します。

`loader` および `action` 関数でセッションにアクセスするためのメソッドを使用します。

ログインフォームは次のようになります。

```tsx filename=app/routes/login.tsx lines=[8,13-15,17,22,26,34-36,47,52,57,62]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"; // または cloudflare/deno
import { json, redirect } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData } from "@remix-run/react";

import { getSession, commitSession } from "../sessions";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );

  if (session.has("userId")) {
    // すでにサインインしている場合は、ホームページにリダイレクトします。
    return redirect("/");
  }

  const data = { error: session.get("error") };

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function action({
  request,
}: ActionFunctionArgs) {
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
    session.flash("error", "無効なユーザー名/パスワード");

    // エラーとともにログインページにリダイレクトします。
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

export default function Login() {
  const { error } = useLoaderData<typeof loader>();

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

```tsx
import { getSession, destroySession } from "../sessions";

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

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

<docs-warning>ログアウト（またはその他の変更）は、`loader` ではなく `action` で実行することが重要です。そうしないと、ユーザーが[クロスサイトリクエストフォージェリ][csrf]攻撃にさらされる可能性があります。また、Remix は `actions` が呼び出された場合にのみ `loaders` を再呼び出しします。</docs-warning>

## セッションの落とし穴

ネストされたルートのため、1つのページを構成するために複数のローダーが呼び出されることがあります。`session.flash()` や `session.unset()` を使用する場合、リクエスト内の他のローダーがそれを読み取ろうとしないことを確認する必要があります。そうしないと、競合状態が発生します。通常、フラッシュを使用する場合は、1つのローダーにそれを読み取らせるようにします。別のローダーがフラッシュメッセージを必要とする場合は、そのローダーに別のキーを使用してください。

## `createSession`

TODO:

## `isSession`

オブジェクトがRemixセッションである場合に`true`を返します。

```ts
import { isSession } from "@remix-run/node"; // または cloudflare/deno

const sessionData = { foo: "bar" };
const session = createSession(sessionData, "remix-session");
console.log(isSession(session));
// true
```

## `createSessionStorage`

Remixでは、必要に応じて独自のデータベースにセッションを簡単に保存できます。`createSessionStorage()` APIには、`cookie`（cookieの作成オプションについては[cookies][cookies]を参照）と、セッションデータを管理するための作成、読み取り、更新、削除（CRUD）メソッドのセットが必要です。cookieはセッションIDを永続化するために使用されます。

* `createData`は、cookieにセッションIDが存在しない初期セッション作成時に`commitSession`から呼び出されます。
* `readData`は、cookieにセッションIDが存在する場合に`getSession`から呼び出されます。
* `updateData`は、cookieにセッションIDが既に存在する場合に`commitSession`から呼び出されます。
* `deleteData`は`destroySession`から呼び出されます。

次の例は、汎用的なデータベースクライアントを使用してこれをどのように行うかを示しています。

```ts
import { createSessionStorage } from "@remix-run/node"; // または cloudflare/deno

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
      // `expires`は、データが無効と見なされるべき日付です。
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

`createData`と`updateData`への`expires`引数は、cookie自体が期限切れになり、無効になる同じ`Date`です。この情報を使用して、データベースからセッションレコードを自動的に削除してスペースを節約したり、古い期限切れのcookieに対してデータが返されないようにしたりできます。

## `createCookieSessionStorage`

純粋にクッキーベースのセッション（セッションデータ自体がブラウザとのセッションクッキーに保存される場合、[cookies][cookies]を参照）には、`createCookieSessionStorage()`を使用できます。

クッキーセッションストレージの主な利点は、使用するために追加のバックエンドサービスやデータベースが不要なことです。また、一部のロードバランシングシナリオでも有益です。ただし、クッキーベースのセッションは、ブラウザの最大許容クッキー長（通常は4kb）を超えることはできません。

欠点は、ほぼすべてのローダーとアクションで`commitSession`を実行する必要があることです。ローダーまたはアクションがセッションを少しでも変更した場合、コミットする必要があります。つまり、アクションで`session.flash`を実行し、別の場所で`session.get`を実行する場合、フラッシュされたメッセージを消すためにコミットする必要があります。他のセッションストレージ戦略では、作成時にのみコミットする必要があります（ブラウザのクッキーはセッションデータを保存せず、他の場所でそれを見つけるためのキーのみを保存するため、変更する必要はありません）。

```ts
import { createCookieSessionStorage } from "@remix-run/node"; // または cloudflare/deno

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    // `createCookie`からのCookie、またはそれを作成するための同じCookieOptions
    cookie: {
      name: "__session",
      secrets: ["r3m1xr0ck5"],
      sameSite: "lax",
    },
  });
```

他のセッション実装では、クッキーに一意のセッションIDを保存し、そのIDを使用して真実のソース（インメモリ、ファイルシステム、DBなど）でセッションを検索することに注意してください。クッキーセッションでは、クッキーが*真実のソース*であるため、すぐに使用できる一意のIDはありません。クッキーセッションで一意のIDを追跡する必要がある場合は、`session.set()`を使用してID値を自分で追加する必要があります。

## `createMemorySessionStorage`

このストレージは、すべてのクッキー情報をサーバーのメモリに保持します。

<docs-error>これは開発環境でのみ使用してください。本番環境では他のいずれかの方法を使用してください。</docs-error>

```ts filename=app/sessions.ts
import {
  createCookie,
  createMemorySessionStorage,
} from "@remix-run/node"; // または cloudflare/deno

// この例では、Cookieは個別に作成されます。
const sessionCookie = createCookie("__session", {
  secrets: ["r3m1xr0ck5"],
  sameSite: true,
});

const { getSession, commitSession, destroySession } =
  createMemorySessionStorage({
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
```

## `createFileSessionStorage` (node)

ファイルベースのセッションには、`createFileSessionStorage()` を使用します。ファイルセッションストレージにはファイルシステムが必要ですが、これは express を実行するほとんどのクラウドプロバイダーで、おそらくいくつかの追加設定で容易に利用できるはずです。

ファイルベースのセッションの利点は、セッションIDのみがクッキーに保存され、残りのデータはディスク上の通常のファイルに保存されることです。これは、4kbを超えるデータを持つセッションに最適です。

<docs-info>サーバーレス関数にデプロイする場合は、永続的なファイルシステムへのアクセスがあることを確認してください。通常、追加の設定なしではファイルシステムは利用できません。</docs-info>

```ts filename=app/sessions.ts
import {
  createCookie,
  createFileSessionStorage,
} from "@remix-run/node"; // or cloudflare/deno

// この例では、Cookieは個別に作成されます。
const sessionCookie = createCookie("__session", {
  secrets: ["r3m1xr0ck5"],
  sameSite: true,
});

const { getSession, commitSession, destroySession } =
  createFileSessionStorage({
    // ファイルを保存するルートディレクトリ。
    // 書き込み可能であることを確認してください！
    dir: "/app/sessions",
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
```

## `createWorkersKVSessionStorage` (Cloudflare Workers)

[Cloudflare Workers KV][cloudflare-kv] をバックエンドとしたセッションには、`createWorkersKVSessionStorage()` を使用します。

KV をバックエンドとしたセッションの利点は、セッション ID のみが Cookie に保存され、残りのデータはグローバルに複製された、低レイテンシーのデータストアに、非常に高い読み取りボリュームと低レイテンシーで保存されることです。

```ts filename=app/sessions.server.ts
import {
  createCookie,
  createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";

// この例では、Cookie は個別に作成されます。
const sessionCookie = createCookie("__session", {
  secrets: ["r3m1xr0ck5"],
  sameSite: true,
});

const { getSession, commitSession, destroySession } =
  createWorkersKVSessionStorage({
    // セッションを保存する KV 名前空間
    kv: YOUR_NAMESPACE,
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
```

## `createArcTableSessionStorage` (architect, Amazon DynamoDB)

[Amazon DynamoDB][amazon-dynamo-db] をバックエンドとするセッションには、`createArcTableSessionStorage()` を使用します。

DynamoDB をバックエンドとするセッションの利点は、セッション ID のみが Cookie に保存され、残りのデータはグローバルにレプリケートされ、低レイテンシーで、非常に高い読み取りボリュームを低レイテンシーで処理できるデータストアに保存されることです。

```
# app.arc
sessions
  _idx *String
  _ttl TTL
```

```ts filename=app/sessions.server.ts
import {
  createCookie,
  createArcTableSessionStorage,
} from "@remix-run/architect";

// この例では、Cookie は個別に作成されます。
const sessionCookie = createCookie("__session", {
  secrets: ["r3m1xr0ck5"],
  maxAge: 3600,
  sameSite: true,
});

const { getSession, commitSession, destroySession } =
  createArcTableSessionStorage({
    // テーブルの名前 (app.arc と一致する必要があります)
    table: "sessions",
    // セッション ID の保存に使用されるキーの名前 (app.arc と一致する必要があります)
    idx: "_idx",
    // 有効期限の保存に使用されるキーの名前 (app.arc と一致する必要があります)
    ttl: "_ttl",
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
```

## セッション API

`getSession` でセッションを取得した後、返されるセッションオブジェクトにはいくつかのメソッドとプロパティがあります。

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

### `session.has(key)`

指定された `name` を持つ変数がセッションにある場合は `true` を返します。

```ts
session.has("userId");
```

### `session.set(key, value)`

後続のリクエストで使用するためのセッション値を設定します。

```ts
session.set("userId", "1234");
```

### `session.flash(key, value)`

セッション値を設定します。この値は最初に読み込まれたときに削除されます。その後は、なくなります。「フラッシュメッセージ」やサーバーサイドのフォーム検証メッセージに最も役立ちます。

```tsx
import { commitSession, getSession } from "../sessions";

export async function action({
  params,
  request,
}: ActionFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const deletedProject = await archiveProject(
    params.projectId
  );

  session.flash(
    "globalMessage",
    `Project ${deletedProject.name} successfully archived`
  );

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
```

これで、ローダーでメッセージを読み取ることができます。

<docs-info> `flash` を読み取るたびにセッションをコミットする必要があります。これは、一部のミドルウェアが自動的に Cookie ヘッダーを設定してくれる場合とは異なり、慣れているものとは異なるかもしれません。</docs-info>

```tsx
import { json } from "@remix-run/node"; // or cloudflare/deno
import {
  Meta,
  Links,
  Scripts,
  Outlet,
} from "@remix-run/react";

import { getSession, commitSession } from "./sessions";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const message = session.get("globalMessage") || null;

  return json(
    { message },
    {
      headers: {
        // cookieSessionStorage の場合にのみ必要
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export default function App() {
  const { message } = useLoaderData<typeof loader>();

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {message ? (
          <div className="flash">{message}</div>
        ) : null}
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

### `session.get()`

以前のリクエストからセッション値にアクセスします。

```ts
session.get("name");
```

### `session.unset()`

セッションから値を削除します。

```ts
session.unset("name");
```

<docs-info>cookieSessionStorageを使用している場合、`unset`するたびにセッションをコミットする必要があります。</docs-info>

```tsx
export async function loader({
  request,
}: LoaderFunctionArgs) {
  // ...

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
```

[cookies]: ./cookies

[constraints]: ../guides/constraints

[csrf]: https://developer.mozilla.org/en-US/docs/Glossary/CSRF

[cloudflare-kv]: https://developers.cloudflare.com/workers/learning/how-kv-works

[amazon-dynamo-db]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide

