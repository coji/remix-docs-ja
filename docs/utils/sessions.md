---
title: セッション
---

# セッション

セッションは、サーバーが同一人物からのリクエストを識別できるようにするウェブサイトの重要な部分です。特にサーバーサイドのフォーム検証や、JavaScriptがページに存在しない場合に重要です。セッションは、ソーシャル、Eコマース、ビジネス、教育用ウェブサイトなど、ユーザーが「ログイン」できる多くのサイトの基本的な構成要素です。

Remixでは、セッションは、`express` ミドルウェアのようなものではなく、ルートごとに、`loader` メソッドと `action` メソッドで、`SessionStorage` インターフェースを実装した「セッションストレージ」オブジェクトを使用して管理されます。セッションストレージは、Cookieの解析と生成、およびデータベースまたはファイルシステムへのセッションデータの保存方法を理解しています。

Remixには、一般的なシナリオに対応するいくつかの事前構築されたセッションストレージオプションと、独自に作成するための1つのオプションが付属しています。

- `createCookieSessionStorage`
- `createMemorySessionStorage`
- `createFileSessionStorage` (node)
- `createWorkersKVSessionStorage` (Cloudflare Workers)
- `createArcTableSessionStorage` (architect, Amazon DynamoDB)
- `createSessionStorage` を使ったカスタムストレージ

## セッションの使用

これは、Cookieセッションストレージの例です。

```ts filename=app/sessions.ts
// app/sessions.ts
import { createCookieSessionStorage } from "@remix-run/node"; // or cloudflare/deno

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      // `createCookie` からのCookie、またはCookieを作成するためのCookieOptions
      cookie: {
        name: "__session",

        // これらはすべてオプションです
        domain: "remix.run",
        // Expiresも設定できます（ただし、maxAgeと組み合わせるとmaxAgeが優先されます）。
        // このメソッドは、`new Date`がサーバーの各展開時に1つの日付のみを作成し、将来の動的な日付を作成しないため、推奨されません！
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

すべてのルートがセッションデータにアクセスできるように、`app/sessions.ts` でセッションストレージオブジェクトを設定することをお勧めします（[ルートモジュールの制約][constraints]も参照してください）。

セッションストレージオブジェクトの入出力はHTTP Cookieです。`getSession()` は、受信リクエストの `Cookie` ヘッダーから現在のセッションを取得し、`commitSession()` / `destroySession()` は、送信されるレスポンスに `Set-Cookie` ヘッダーを提供します。

`loader` 関数と `action` 関数でセッションにアクセスするためのメソッドを使用します。

ログインフォームは、次のようなものになります。

```tsx filename=app/routes/login.tsx lines=[8,13-15,17,22,26,34-36,47,52,57,62]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"; // or cloudflare/deno
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno
import { useLoaderData } from "@remix-run/react";

import { getSession, commitSession } from "../sessions";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );

  if (session.has("userId")) {
    // ログイン済みの場合は、ホームページにリダイレクトします。
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

  // ログインに成功したので、ホームページにリダイレクトします。
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

ログアウトフォームは、次のようなものになります。

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
      <p>ログアウトしてもよろしいですか？</p>
      <Form method="post">
        <button>ログアウト</button>
      </Form>
      <Link to="/">やめておきます</Link>
    </>
  );
}
```

<docs-warning>ログアウト（またはその他の変更）は、`loader` ではなく `action` で行うことが重要です。そうしないと、ユーザーは [クロスサイトリクエストフォージェリ][csrf] 攻撃の危険にさらされます。また、Remixは、`action` が呼び出されたときにのみ `loader` を再呼び出します。</docs-warning>

## セッションの注意点

ネストされたルートのため、1つのページを作成するために複数のローダーが呼び出される場合があります。`session.flash()` または `session.unset()` を使用する場合、リクエスト内の他のローダーが読み取らないようにする必要があります。そうしないと、競合状態が発生します。通常、フラッシュを使用する場合は、単一のローダーが読み取るようにします。別のローダーがフラッシュメッセージを必要とする場合は、そのローダー用に別のキーを使用します。

## `createSession`

TODO:

## `isSession`

オブジェクトがRemixセッションである場合、`true` を返します。

```ts
import { isSession } from "@remix-run/node"; // or cloudflare/deno

const sessionData = { foo: "bar" };
const session = createSession(sessionData, "remix-session");
console.log(isSession(session));
// true
```

## `createSessionStorage`

Remixでは、必要に応じて独自のデータベースにセッションを簡単に保存できます。`createSessionStorage()` APIには、`cookie` （またはCookieを作成するためのオプション、[Cookie][cookies]を参照）と、セッションデータを管理するための作成、読み取り、更新、削除（CRUD）メソッドのセットが必要です。Cookieは、セッションIDの永続化に使用されます。

- `createData` は、`commitSession` から呼び出され、CookieにセッションIDが存在しない場合に、初期セッションの作成時に呼び出されます。
- `readData` は、`getSession` から呼び出され、CookieにセッションIDが存在する場合に呼び出されます。
- `updateData` は、`commitSession` から呼び出され、CookieにセッションIDがすでに存在する場合に呼び出されます。
- `deleteData` は、`destorySession` から呼び出されます。

次の例は、一般的なデータベースクライアントを使用してこれを行う方法を示しています。

```ts
import { createSessionStorage } from "@remix-run/node"; // or cloudflare/deno

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
      // データを無効にする方法や、このレコードをデータベースから自動的にパージするために使用できます。
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

`createData` と `updateData` に渡される `expires` 引数は、Cookie自体が期限切れとなり、無効になるのと同じ `Date` です。この情報は、データベースからセッションレコードを自動的にパージしてスペースを節約したり、古い期限切れのCookieに対しては、データを返さないようにするために使用できます。

## `createCookieSessionStorage`

純粋にCookieベースのセッションの場合（セッションデータ自体がセッションCookieにブラウザに保存されます、[Cookie][cookies]を参照）、`createCookieSessionStorage()` を使用できます。

Cookieセッションストレージの主な利点は、追加のバックエンドサービスやデータベースを必要としないことです。負荷分散されたシナリオでは有益な場合もあります。ただし、Cookieベースのセッションは、ブラウザのCookieの最大許容長（通常は4kb）を超えてはなりません。

欠点は、ほとんどのローダーとアクションで `commitSession` を実行する必要があることです。ローダーまたはアクションでセッションを変更する場合は、コミットする必要があります。つまり、アクションで `session.flash` を実行し、別のローダーで `session.get` を実行する場合は、フラッシュメッセージを消去するためにコミットする必要があります。他のセッションストレージ戦略では、セッションが作成されたときにのみコミットする必要があり、（セッションデータではなく、セッションデータを探すためのキーのみを格納するため）ブラウザのCookieを変更する必要はありません。

```ts
import { createCookieSessionStorage } from "@remix-run/node"; // or cloudflare/deno

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    // `createCookie` からのCookie、または同じCookieOptionsを作成します
    cookie: {
      name: "__session",
      secrets: ["r3m1xr0ck5"],
      sameSite: "lax",
    },
  });
```

他のセッションの実装では、一意のセッションIDをCookieに保存し、そのIDを使用してセッションを真実のソース（メモリ内、ファイルシステム、DBなど）で検索します。Cookieセッションでは、Cookieが真実のソースであるため、デフォルトで一意のIDはありません。Cookieセッションで一意のIDを追跡する必要がある場合は、`session.set()` を使用して、自分でID値を追加する必要があります。

## `createMemorySessionStorage`

このストレージは、すべてのCookie情報をサーバーのメモリに保持します。

<docs-error>これは、開発でのみ使用してください。本番環境では、他のメソッドのいずれかを使用してください。</docs-error>

```ts filename=app/sessions.ts
import {
  createCookie,
  createMemorySessionStorage,
} from "@remix-run/node"; // or cloudflare/deno

// この例では、Cookieは別途作成されます。
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

ファイルでバックアップされたセッションの場合、`createFileSessionStorage()` を使用します。ファイルセッションストレージにはファイルシステムが必要です。ただし、これは、expressを実行するほとんどのクラウドプロバイダーですぐに利用できます。構成を追加する必要がある場合もあります。

ファイルでバックアップされたセッションの利点は、CookieにはセッションIDのみが保存され、残りのデータはディスク上の通常のファイルに保存されることです。これは、4kbを超えるデータを持つセッションに最適です。

<docs-info>サーバーレス関数にデプロイする場合は、永続的なファイルシステムへのアクセス権を持っていることを確認してください。通常、それらは追加の構成なしでは提供されません。</docs-info>

```ts filename=app/sessions.ts
import {
  createCookie,
  createFileSessionStorage,
} from "@remix-run/node"; // or cloudflare/deno

// この例では、Cookieは別途作成されます。
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

[Cloudflare Workers KV][cloudflare-kv] でバックアップされたセッションの場合、`createWorkersKVSessionStorage()` を使用します。

KVでバックアップされたセッションの利点は、CookieにはセッションIDのみが保存され、残りのデータは、非常に高速な読み込み量と低レイテンシを備えた、グローバルにレプリケートされた低レイテンシのデータストアに保存されることです。

```ts filename=app/sessions.server.ts
import {
  createCookie,
  createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";

// この例では、Cookieは別途作成されます。
const sessionCookie = createCookie("__session", {
  secrets: ["r3m1xr0ck5"],
  sameSite: true,
});

const { getSession, commitSession, destroySession } =
  createWorkersKVSessionStorage({
    // セッションを保存するKV Namespace
    kv: YOUR_NAMESPACE,
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
```

## `createArcTableSessionStorage` (architect, Amazon DynamoDB)

[Amazon DynamoDB][amazon-dynamo-db] でバックアップされたセッションの場合、`createArcTableSessionStorage()` を使用します。

DynamoDBでバックアップされたセッションの利点は、CookieにはセッションIDのみが保存され、残りのデータは、非常に高速な読み込み量と低レイテンシを備えた、グローバルにレプリケートされた低レイテンシのデータストアに保存されることです。

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

// この例では、Cookieは別途作成されます。
const sessionCookie = createCookie("__session", {
  secrets: ["r3m1xr0ck5"],
  maxAge: 3600,
  sameSite: true,
});

const { getSession, commitSession, destroySession } =
  createArcTableSessionStorage({
    // テーブルの名前（app.arcと一致する必要があります）
    table: "sessions",
    // セッションIDを保存するために使用されるキーの名前（app.arcと一致する必要があります）
    idx: "_idx",
    // 期限切れ時間を保存するために使用されるキーの名前（app.arcと一致する必要があります）
    ttl: "_ttl",
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
```

## セッションAPI

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

セッションに指定された `name` の変数がある場合、`true` を返します。

```ts
session.has("userId");
```

### `session.set(key, value)`

後続のリクエストで使用するためのセッション値を設定します。

```ts
session.set("userId", "1234");
```

### `session.flash(key, value)`

初めて読み取られたときにアンセットされるセッション値を設定します。その後はなくなります。「フラッシュメッセージ」やサーバーサイドのフォーム検証メッセージに最も役立ちます。

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

<docs-info> `flash` を読み取るたびにセッションをコミットする必要があります。これは、ある種のミドルウェアがCookieヘッダーを自動的に設定する従来のものとは異なります。</docs-info>

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
        // cookieSessionStorageでのみ必要です
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

<docs-info>cookieSessionStorageを使用する場合は、`unset` を実行するたびにセッションをコミットする必要があります。</docs-info>

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


