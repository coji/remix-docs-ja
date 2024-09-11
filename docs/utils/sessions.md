---
title: セッション
---

# セッション

セッションは、特にサーバーサイドのフォーム検証や JavaScript がページにない場合に、サーバーが同じ人物からのリクエストを識別できるようにする、Web サイトの重要な一部です。セッションは、ソーシャル、e コマース、ビジネス、教育などの Web サイトなど、ユーザーが「ログイン」できる多くのサイトの基礎となる構成要素です。

Remix では、セッションは、`express` ミドルウェアのようなものではなく、`loader` および `action` メソッドで「セッションストレージ」オブジェクト（`SessionStorage` インターフェースを実装）を使用して、ルートごとに管理されます。セッションストレージは、Cookie の解析と生成、およびセッションデータをデータベースまたはファイルシステムに保存する方法を理解しています。

Remix には、一般的なシナリオ向けの事前に構築されたセッションストレージオプションがいくつか用意されており、独自のセッションストレージを作成するためのオプションも 1 つ用意されています。

- `createCookieSessionStorage`
- `createMemorySessionStorage`
- `createFileSessionStorage` (ノード)
- `createWorkersKVSessionStorage` (Cloudflare Workers)
- `createArcTableSessionStorage` (Architect、Amazon DynamoDB)
- `createSessionStorage` を使用したカスタムストレージ

## セッションの使用

これは、Cookie セッションストレージの例です。

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
  createCookieSessionStorage<SessionData, SessionFlashData>({
    // `createCookie` からの Cookie または Cookie を作成するための CookieOptions
    cookie: {
      name: "__session",

      // これらはすべてオプションです
      domain: "remix.run",
      // Expires も設定できます（ただし、maxAge と組み合わせると、maxAge が優先されます）。
      // このメソッドは、`new Date` がサーバーの各デプロイメントで 1 つの日付のみを作成し、将来の動的な日付を作成しないため、推奨されません！
      //
      // expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      maxAge: 60,
      path: "/",
      sameSite: "lax",
      secrets: ["s3cret1"],
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };
```

セッションストレージオブジェクトは `app/sessions.ts` に設定することをお勧めします。これにより、セッションデータにアクセスする必要があるすべてのルートが同じ場所からインポートできます（また、[ルートモジュール制約][constraints] も参照してください）。

セッションストレージオブジェクトへの入出力は、HTTP Cookie です。`getSession()` は、受信リクエストの `Cookie` ヘッダーから現在のセッションを取得し、`commitSession()`/`destroySession()` は、発信応答の `Set-Cookie` ヘッダーを提供します。

`loader` および `action` 関数でセッションにアクセスするためのメソッドを使用します。

ログインフォームは、次のようになります。

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
    // 既にサインインしている場合は、ホームページにリダイレクトします。
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

    // エラーが発生したため、ログインページにリダイレクトします。
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.set("userId", userId);

  // ログインが成功しました。ホームページにリダイレクトします。
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

そして、ログアウトフォームは、次のようになります。

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
      <p>ログアウトしますか？</p>
      <Form method="post">
        <button>ログアウト</button>
      </Form>
      <Link to="/">キャンセル</Link>
    </>
  );
}
```

<docs-warning>ログアウト（またはその他の変更を行う場合）は、`action` で行い、`loader` で行わないことが重要です。そうしないと、ユーザーが[クロスサイトリクエストフォージェリ][csrf]攻撃を受ける可能性があります。また、Remix は `action` が呼び出された場合にのみ `loader` を再呼び出します。</docs-warning>

## セッションの注意点

入れ子になったルートのために、複数のローダーが呼び出されて単一のページを構成することがあります。`session.flash()` または `session.unset()` を使用する場合、リクエスト内の他のローダーがそれを読み込もうとしないことを確認する必要があります。そうしないと、競合状態が発生します。通常、フラッシュを使用する場合は、単一のローダーがそれを読み込むようにします。別のローダーがフラッシュメッセージを必要とする場合は、そのローダーに別のキーを使用します。

## `createSession`

TODO:

## `isSession`

オブジェクトが Remix セッションかどうかを返します。

```ts
import { isSession } from "@remix-run/node"; // または cloudflare/deno

const sessionData = { foo: "bar" };
const session = createSession(sessionData, "remix-session");
console.log(isSession(session));
// true
```

## `createSessionStorage`

Remix を使用すると、必要に応じて独自のデータベースにセッションを簡単に保存できます。`createSessionStorage()` API には、`cookie`（Cookie を作成するためのオプションについては、[Cookie][cookies] を参照してください）と、セッションデータを管理するための作成、読み込み、更新、削除（CRUD）メソッドのセットが必要です。Cookie は、セッション ID を永続化するために使用されます。

- `createData` は、セッション ID が Cookie に存在しない場合に、セッションが最初に作成されたときに `commitSession` から呼び出されます。
- `readData` は、セッション ID が Cookie に存在する場合に `getSession` から呼び出されます。
- `updateData` は、セッション ID が Cookie に既に存在する場合に `commitSession` から呼び出されます。
- `deleteData` は `destroySession` から呼び出されます。

次の例は、一般的なデータベースクライアントを使用してこれを行う方法を示しています。

```ts
import { createSessionStorage } from "@remix-run/node"; // または cloudflare/deno

function createDatabaseSessionStorage({
  cookie,
  host,
  port,
}) {
  // データベースクライアントを構成します...
  const db = createDatabaseClient(host, port);

  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      // `expires` は、データが無効と見なされるべき日付です。
      // データを無効にするために使用したり、
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

`createData` および `updateData` への `expires` 引数は、Cookie 自体が期限切れになり、無効になる同じ `Date` です。この情報を使用して、データベースからセッションレコードを自動的に削除してストレージを節約したり、期限切れの古い Cookie に対してデータを返さないようにすることができます。

## `createCookieSessionStorage`

純粋な Cookie ベースのセッション（セッションデータ自体がブラウザのセッション Cookie に保存されます。[Cookie][cookies] を参照してください）の場合、`createCookieSessionStorage()` を使用できます。

Cookie セッションストレージの主な利点は、使用するのに追加のバックエンドサービスやデータベースが必要ないことです。これは、ロードバランスされたシナリオでは利点となる場合もあります。ただし、Cookie ベースのセッションは、ブラウザの最大許可 Cookie 長さ（通常は 4kb）を超えることはできません。

欠点は、ほぼすべてのローダーとアクションで `commitSession` を実行する必要があることです。ローダーまたはアクションでセッションが変更された場合は、必ずコミットする必要があります。つまり、アクションで `session.flash` を実行し、次に別のローダーで `session.get` を実行する場合、フラッシュされたメッセージを消去するためにコミットする必要があります。他のセッションストレージ戦略では、作成時にのみコミットする必要があります（Cookie はセッションデータを保存しないため、ブラウザ Cookie は変更する必要がなく、別の場所にあるキーのみを保存します）。

```ts
import { createCookieSessionStorage } from "@remix-run/node"; // または cloudflare/deno

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    // `createCookie` からの Cookie または Cookie を作成するための CookieOptions
    cookie: {
      name: "__session",
      secrets: ["r3m1xr0ck5"],
      sameSite: "lax",
    },
  });
```

他のセッションの実装では、Cookie に一意のセッション ID を保存し、その ID を使用して、真のソース（メモリ内、ファイルシステム、DB など）のセッションを検索することに注意してください。Cookie セッションでは、Cookie が真のソースであるため、すぐに利用できる一意の ID はありません。Cookie セッションで一意の ID を追跡する必要がある場合は、`session.set()` を介して自分で ID 値を追加する必要があります。

## `createMemorySessionStorage`

このストレージは、すべての Cookie 情報をサーバーのメモリに保持します。

<docs-error>これは開発でのみ使用するようにしてください。本番環境では、他のメソッドのいずれかを使用してください。</docs-error>

```ts filename=app/sessions.ts
import {
  createCookie,
  createMemorySessionStorage,
} from "@remix-run/node"; // または cloudflare/deno

// この例では、Cookie は別々に作成されます。
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

## `createFileSessionStorage` (ノード)

ファイルバックのセッションには、`createFileSessionStorage()` を使用します。ファイルセッションストレージにはファイルシステムが必要です。ただし、これは、`express` を実行しているほとんどのクラウドプロバイダーで簡単に利用できます。追加の構成が必要な場合もあります。

ファイルバックのセッションの利点は、セッションデータの残りの部分がディスク上の通常のファイルに保存されている間、セッション ID のみが Cookie に保存されることです。これは、4kb を超えるデータを持つセッションに最適です。

<docs-info>サーバーレス関数にデプロイする場合は、永続的なファイルシステムへのアクセス権を持っていることを確認してください。通常、追加の構成なしではファイルシステムは用意されていません。</docs-info>

```ts filename=app/sessions.ts
import {
  createCookie,
  createFileSessionStorage,
} from "@remix-run/node"; // または cloudflare/deno

// この例では、Cookie は別々に作成されます。
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

[Cloudflare Workers KV][cloudflare-kv] バックのセッションには、`createWorkersKVSessionStorage()` を使用します。

KV バックのセッションの利点は、セッションデータの残りの部分が、非常に高い読み取り量と低レイテンシーで世界的にレプリケートされた低レイテンシーのデータストアに保存されている間、セッション ID のみが Cookie に保存されることです。

```ts filename=app/sessions.server.ts
import {
  createCookie,
  createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";

// この例では、Cookie は別々に作成されます。
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

## `createArcTableSessionStorage` (Architect、Amazon DynamoDB)

[Amazon DynamoDB][amazon-dynamo-db] バックのセッションには、`createArcTableSessionStorage()` を使用します。

DynamoDB バックのセッションの利点は、セッションデータの残りの部分が、非常に高い読み取り量と低レイテンシーで世界的にレプリケートされた低レイテンシーのデータストアに保存されている間、セッション ID のみが Cookie に保存されることです。

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

// この例では、Cookie は別々に作成されます。
const sessionCookie = createCookie("__session", {
  secrets: ["r3m1xr0ck5"],
  maxAge: 3600,
  sameSite: true,
});

const { getSession, commitSession, destroySession } =
  createArcTableSessionStorage({
    // テーブルの名前（app.arc と一致する必要があります）
    table: "sessions",
    // セッション ID の保存に使用されるキーの名前（app.arc と一致する必要があります）
    idx: "_idx",
    // 有効期限の保存に使用されるキーの名前（app.arc と一致する必要があります）
    ttl: "_ttl",
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
```

## セッション API

`getSession` でセッションを取得した後、返されるセッションオブジェクトには、いくつかのメソッドとプロパティがあります。

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

セッションに指定された `name` の変数が存在する場合、`true` を返します。

```ts
session.has("userId");
```

### `session.set(key, value)`

後続のリクエストで使用するためのセッション値を設定します。

```ts
session.set("userId", "1234");
```

### `session.flash(key, value)`

最初に読み取られたときにアンセットされるセッション値を設定します。その後は消滅します。「フラッシュメッセージ」やサーバーサイドのフォーム検証メッセージに最も役立ちます。

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
    `プロジェクト ${deletedProject.name} が正常にアーカイブされました`
  );

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
```

これで、ローダーでメッセージを読み取ることができます。

<docs-info> `flash` を読み取るたびにセッションをコミットする必要があります。これは、ある種のミドルウェアが自動的に Cookie ヘッダーを設定するのに慣れている場合とは異なります。</docs-info>

```tsx
import { json } from "@remix-run/node"; // または cloudflare/deno
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

以前のリクエストからのセッション値にアクセスします。

```ts
session.get("name");
```

### `session.unset()`

セッションから値を削除します。

```ts
session.unset("name");
```

<docs-info>cookieSessionStorage を使用する場合、`unset` を実行するたびにセッションをコミットする必要があります。</docs-info>

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

