---
title: セッション
---

# セッション

セッションは、サーバーが同じユーザーからのリクエストを識別するために重要なウェブサイトの一部です。特に、サーバーサイドフォーム検証やJavaScriptがページに存在しない場合に重要です。セッションは、ソーシャル、eコマース、ビジネス、教育機関のウェブサイトなど、ユーザーが「ログイン」できる多くのサイトの基本的な構成要素です。

Remixでは、セッションは`express middleware`のようなものではなく、`loader`と`action`メソッドで「セッションストレージ」オブジェクト（`SessionStorage`インターフェースを実装）を使用して、ルートごとに管理されます。セッションストレージは、Cookieを解析および生成する方法、およびセッションデータをデータベースまたはファイルシステムに保存する方法を理解しています。

Remixには、一般的なシナリオに対応する事前構築されたセッションストレージオプションがいくつかと、独自のセッションストレージオプションを作成するためのオプションが1つ用意されています。

- `createCookieSessionStorage`
- `createMemorySessionStorage`
- `createFileSessionStorage`（node）
- `createWorkersKVSessionStorage`（Cloudflare Workers）
- `createArcTableSessionStorage`（architect、Amazon DynamoDB）
- `createSessionStorage`を使用してカスタムストレージ

## セッションの使用

これは、Cookieセッションストレージの例です。

```ts filename=app/sessions.ts
// app/sessions.ts
import { createCookieSessionStorage } from "@remix-run/node"; // またはcloudflare/deno

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      // `createCookie`からのCookie、またはCookieを作成するためのCookieOptions
      cookie: {
        name: "__session",

        // これらはすべてオプションです
        domain: "remix.run",
        // Expiresも設定できます（ただし、maxAgeは組み合わせで使用した場合に優先されます）。
        // この方法は、`new Date`が各サーバーデプロイメントで1つの日付しか作成せず、将来の動的な日付を作成しないため、推奨されていません！
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

セッションストレージオブジェクトは、`app/sessions.ts`に設定することをお勧めします。これにより、セッションデータにアクセスする必要があるすべてのルートが、同じ場所からインポートできます（ルートモジュール制約も参照してください）。

セッションストレージオブジェクトへの入力/出力はHTTP Cookieです。`getSession()`は、受信リクエストの`Cookie`ヘッダーから現在のセッションを取得し、`commitSession()`/`destroySession()`は、発信応答の`Set-Cookie`ヘッダーを提供します。

`loader`と`action`関数でメソッドを使用して、セッションにアクセスします。

ログインフォームは、次のようになります。

```tsx filename=app/routes/login.tsx lines=[8,13-15,17,22,26,34-36,47,52,57,62]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"; // またはcloudflare/deno
import { json, redirect } from "@remix-run/node"; // またはcloudflare/deno
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

ログアウトフォームは、次のようになります。

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
      <Link to="/">やめます</Link>
    </>
  );
}
```

<docs-warning>`action`でログアウト（またはその他の変更）を実行することが重要です。`loader`では実行しないでください。そうしないと、ユーザーが[クロスサイトリクエストフォージェリ][csrf]攻撃の被害に遭う可能性があります。また、Remixは、`action`が呼び出されたときにのみ`loader`を再呼び出します。</docs-warning>

## セッションに関する注意点

ネストされたルートのため、1つのページを作成するために複数の`loader`が呼び出される可能性があります。`session.flash()`または`session.unset()`を使用する場合、リクエスト内の他の`loader`がそれを読み取ろうとしないことを確認する必要があります。そうしないと、競合状態が発生します。一般的に、フラッシュを使用する場合は、1つの`loader`でフラッシュを読み取らせる必要があります。別の`loader`がフラッシュメッセージを必要とする場合は、その`loader`に別のキーを使用します。

## `createSession`

TODO:

## `isSession`

オブジェクトがRemixセッションである場合`true`を返します。

```ts
import { isSession } from "@remix-run/node"; // またはcloudflare/deno

const sessionData = { foo: "bar" };
const session = createSession(sessionData, "remix-session");
console.log(isSession(session));
// true
```

## `createSessionStorage`

Remixを使用すると、必要に応じて独自のデータベースにセッションを簡単に保存できます。`createSessionStorage()`APIでは、`cookie`（Cookieの作成オプションについては[Cookie][cookies]を参照）と、セッションデータを管理するための一連のCRUD（作成、読み取り、更新、削除）メソッドが必要です。Cookieは、セッションIDを永続化するために使用されます。

- `createData`は、`commitSession`から、セッションIDがCookieに存在しない場合、最初のセッション作成時に呼び出されます。
- `readData`は、`getSession`から、セッションIDがCookieに存在する場合に呼び出されます。
- `updateData`は、`commitSession`から、セッションIDがCookieに既に存在する場合に呼び出されます。
- `deleteData`は、`destorySession`から呼び出されます。

次の例は、汎用データベースクライアントを使用してこれを実行する方法を示しています。

```ts
import { createSessionStorage } from "@remix-run/node"; // またはcloudflare/deno

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
      // `expires`は、データが無効と見なされるべき日付です。これを利用してデータを無効化したり、データベースからこのレコードを自動的にパージしたりできます。
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

`createData`と`updateData`への`expires`引数は、Cookie自体が期限切れとなり、無効になるのと同じ`Date`です。この情報を使用して、データベースからセッションレコードを自動的にパージしてスペースを節約したり、古い期限切れのCookieに対してデータが返されないようにしたりできます。

## `createCookieSessionStorage`

純粋にCookieベースのセッションの場合（セッションデータ自体がブラウザのセッションCookieに保存される場合、[Cookie][cookies]を参照）、`createCookieSessionStorage()`を使用できます。

Cookieセッションストレージの主な利点は、使用するために追加のバックエンドサービスまたはデータベースが不要になることです。ロードバランスされたシナリオでは、利点がある場合もあります。ただし、Cookieベースのセッションは、ブラウザの最大許可されるCookieの長さ（通常は4kb）を超えることはできません。

欠点は、ほとんどの`loader`と`action`で`commitSession`を実行する必要があることです。`loader`または`action`がセッションを変更する場合は、それをコミットする必要があります。つまり、`action`で`session.flash`を実行し、別の`loader`で`session.get`を実行する場合は、フラッシュメッセージを消去するために、セッションをコミットする必要があります。他のセッションストレージ戦略では、セッションが作成されたときにのみコミットする必要があり（ブラウザのCookieはセッションデータを保存せず、キーのみを保存するため、変更する必要はありません）、セッションをコミットする必要はありません。

```ts
import { createCookieSessionStorage } from "@remix-run/node"; // またはcloudflare/deno

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    // `createCookie`からのCookie、またはCookieを作成するためのCookieOptions
    cookie: {
      name: "__session",
      secrets: ["r3m1xr0ck5"],
      sameSite: "lax",
    },
  });
```

他のセッション実装では、Cookieに一意のセッションIDを保存し、そのIDを使用して真実のソース（インメモリ、ファイルシステム、DBなど）でセッションを検索します。Cookieセッションでは、Cookieが真実のソースであるため、独自のIDは用意されていません。Cookieセッションで一意のIDを追跡する必要がある場合は、`session.set()`を使用して、自分でID値を追加する必要があります。

## `createMemorySessionStorage`

このストレージは、サーバーのメモリにすべてのCookie情報を保持します。

<docs-error>これは、開発環境でのみ使用してください。本番環境では、他のメソッドのいずれかを使用してください。</docs-error>

```ts filename=app/sessions.ts
import {
  createCookie,
  createMemorySessionStorage,
} from "@remix-run/node"; // またはcloudflare/deno

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

ファイルベースのセッションの場合、`createFileSessionStorage()`を使用します。ファイルセッションストレージにはファイルシステムが必要です。ただし、これは、expressを実行するほとんどのクラウドプロバイダーですぐに利用できます。追加の構成が必要になる場合があります。

ファイルベースのセッションの利点は、CookieにセッションIDのみが保存され、残りのデータがディスクの通常のファイルに保存されることです。これは、4kbを超えるデータを含むセッションに最適です。

<docs-info>サーバーレス関数にデプロイする場合は、永続的なファイルシステムにアクセスできることを確認してください。通常、追加の構成なしでは永続的なファイルシステムは提供されません。</docs-info>

```ts filename=app/sessions.ts
import {
  createCookie,
  createFileSessionStorage,
} from "@remix-run/node"; // またはcloudflare/deno

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

[Cloudflare Workers KV][cloudflare-kv]ベースのセッションの場合、`createWorkersKVSessionStorage()`を使用します。

KVベースのセッションの利点は、CookieにセッションIDのみが保存され、残りのデータがグローバルにレプリケートされた低レイテンシのデータストアに保存されることです。データストアは非常に高い読み取り量に対応し、レイテンシは低くなります。

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
    // セッションを保存するKV名前空間
    kv: YOUR_NAMESPACE,
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
```

## `createArcTableSessionStorage` (architect、Amazon DynamoDB)

[Amazon DynamoDB][amazon-dynamo-db]ベースのセッションの場合、`createArcTableSessionStorage()`を使用します。

DynamoDBベースのセッションの利点は、CookieにセッションIDのみが保存され、残りのデータがグローバルにレプリケートされた低レイテンシのデータストアに保存されることです。データストアは非常に高い読み取り量に対応し、レイテンシは低くなります。

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

`getSession`を使用してセッションを取得した後、返されたセッションオブジェクトには、いくつかのメソッドとプロパティがあります。

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

指定された`name`の変数がセッションに存在する場合`true`を返します。

```ts
session.has("userId");
```

### `session.set(key, value)`

後続のリクエストで使用するためにセッション値を設定します。

```ts
session.set("userId", "1234");
```

### `session.flash(key, value)`

初めて読み取られたときにアンセットされるセッション値を設定します。その後は消えます。「フラッシュメッセージ」とサーバーサイドフォーム検証メッセージに最も役立ちます。

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

これで、`loader`でメッセージを読み取ることができます。

<docs-info>`flash`を読み取るたびに、セッションをコミットする必要があります。これは、何らかのミドルウェアが自動的にCookieヘッダーを設定する場合とは異なります。</docs-info>

```tsx
import { json } from "@remix-run/node"; // またはcloudflare/deno
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
        // CookieSessionStorageでのみ必要
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

<docs-info>CookieSessionStorageを使用する場合は、`unset`を実行するたびにセッションをコミットする必要があります。</docs-info>

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



