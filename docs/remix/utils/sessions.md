---
title: セッション
---

# セッション

セッションは、サーバーが同じ人物からのリクエストを識別できるようにするウェブサイトの重要な部分であり、特にサーバーサイドのフォーム検証やJavaScriptがページにない場合に役立ちます。セッションは、ソーシャル、Eコマース、ビジネス、教育など、ユーザーが「ログイン」できる多くのサイトの基本的な構成要素です。

Remixでは、セッションは「セッションストレージ」オブジェクト（`SessionStorage`インターフェースを実装）を使用して、`loader`および`action`メソッドでルートごとに管理されます（expressミドルウェアのようなものではありません）。セッションストレージは、Cookieの解析と生成方法、およびデータベースやファイルシステムにセッションデータを保存する方法を理解しています。

Remixには、一般的なシナリオ向けにいくつかの組み込みセッションストレージオプションと、独自のストレージを作成するためのオプションが用意されています。

- `createCookieSessionStorage`
- `createMemorySessionStorage`
- `createFileSessionStorage` (Node.js, Deno)
- `createWorkersKVSessionStorage` (Cloudflare)
- `createArcTableSessionStorage` (Architect, Amazon DynamoDB)
- `createSessionStorage`によるカスタムストレージ

## セッションの使用

これはCookieセッションストレージの例です。

```ts filename=app/sessions.server.ts
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
      // `createCookie`からのCookie、またはCookieを作成するためのCookieOptions
      cookie: {
        name: "__session",

        // これらはすべてオプションです
        domain: "remix.run",
        // Expiresも設定できます（ただし、maxAgeと組み合わせて使用するとmaxAgeが優先されます）。
        // この方法は推奨されません。`new Date`はサーバーデプロイごとに1つの日付しか作成せず、将来の動的な日付ではないためです！
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

セッションストレージオブジェクトを`app/sessions.server.ts`に設定することをお勧めします。これにより、セッションデータにアクセスする必要があるすべてのルートが同じ場所からインポートできるようになります（[ルートモジュールの制約][constraints]も参照してください）。

セッションストレージオブジェクトへの入力/出力はHTTP Cookieです。`getSession()`は受信リクエストの`Cookie`ヘッダーから現在のセッションを取得し、`commitSession()`/`destroySession()`は送信レスポンス用の`Set-Cookie`ヘッダーを提供します。

`loader`および`action`関数でセッションにアクセスするためのメソッドを使用します。

ログインフォームは次のようになります。

```tsx filename=app/routes/login.js lines=[8,13-15,17,23-24,29-30,38-40,51-52,57,62,67]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"; // or cloudflare/deno
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno
import { useLoaderData } from "@remix-run/react";

import {
  getSession,
  commitSession,
} from "../sessions.server";

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

  const data = {
    // ルートアクションによって設定されたフラッシュメッセージを読み取り、解除します。
    error: session.get("error"),
  };

  return json(data, {
    headers: {
      // 更新されたセッションデータをコミットします。
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
    // ルートローダーによって読み取られる単一使用のフラッシュメッセージを設定します。
    session.flash("error", "Invalid username/password");

    // エラーとともにログインページに戻ります。
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.set("userId", userId);

  // ログインに成功しました。ホームページに送信します。
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
          <p>Please sign in</p>
        </div>
        <label>
          Username: <input type="text" name="username" />
        </label>
        <label>
          Password:{" "}
          <input type="password" name="password" />
        </label>
      </form>
    </div>
  );
}
```

そして、ログアウトフォームは次のようになります。

```tsx
import {
  getSession,
  destroySession,
} from "../sessions.server";

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
      <p>Are you sure you want to log out?</p>
      <Form method="post">
        <button>Logout</button>
      </Form>
      <Link to="/">Never mind</Link>
    </>
  );
}
```

<docs-warning>ログアウト（またはその他のミューテーション）は`loader`ではなく`action`で行うことが重要です。そうしないと、ユーザーが[クロスサイトリクエストフォージェリ][csrf]攻撃にさらされる可能性があります。また、Remixは`actions`が呼び出されたときにのみ`loaders`を再呼び出しします。</docs-warning>

## セッションの落とし穴

- ネストされたルートのため、単一のページを構築するために複数のローダーが呼び出されることがあります。`session.flash()`または`session.unset()`を使用する場合、リクエスト内の他のローダーがそれを読み取ろうとしないことを確認する必要があります。そうしないと、競合状態が発生します。通常、フラッシュを使用する場合は、単一のローダーがそれを読み取るようにします。別のローダーがフラッシュメッセージを必要とする場合は、そのローダーに別のキーを使用します。

- セッションデータを変更するたびに、`commitSession()`を実行する必要があります。そうしないと、変更が失われます。これは、何らかのミドルウェアが自動的にセッションデータをコミットするような、慣れているものとは異なります。

## `createSession`

TODO:

## `isSession`

オブジェクトがRemixセッションである場合は`true`を返します。

```ts
import { isSession } from "@remix-run/node"; // or cloudflare/deno

const sessionData = { foo: "bar" };
const session = createSession(sessionData, "remix-session");
console.log(isSession(session));
// true
```

## `createSessionStorage`

Remixは、必要に応じて独自のデータベースにセッションを簡単に保存できるようにします。`createSessionStorage()` APIは、`cookie`（Cookie作成のオプションについては[cookies][cookies]を参照）と、セッションデータを管理するための作成、読み取り、更新、削除（CRUD）メソッドのセットを必要とします。CookieはセッションIDを永続化するために使用されます。

- `createData`は、CookieにセッションIDが存在しない場合の最初のセッション作成時に`commitSession`から呼び出されます。
- `readData`は、CookieにセッションIDが存在する場合に`getSession`から呼び出されます。
- `updateData`は、CookieにセッションIDがすでに存在する場合に`commitSession`から呼び出されます。
- `deleteData`は`destroySession`から呼び出されます。

次の例は、汎用データベースクライアントを使用してこれを行う方法を示しています。

```ts
import { createSessionStorage } from "@remix-run/node"; // or cloudflare/deno

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
      // これを使用してデータを無効にしたり、データベースからこのレコードを自動的にパージしたりできます。
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

`createData`および`updateData`の`expires`引数は、Cookie自体が期限切れになり無効になるのと同じ`Date`です。この情報を使用して、データベースからセッションレコードを自動的にパージしてスペースを節約したり、古くて期限切れのCookieに対してデータを返さないようにしたりできます。

## `createCookieSessionStorage`

純粋なCookieベースのセッション（セッションデータ自体がブラウザのセッションCookieに保存される、[cookies][cookies]を参照）には、`createCookieSessionStorage()`を使用できます。

Cookieセッションストレージの主な利点は、追加のバックエンドサービスやデータベースを必要としないことです。一部のロードバランシングシナリオでも有利になる場合があります。

ただし、Cookieベースのセッションは、ブラウザのCookieサイズ制限である4KBを超えることはできません。Cookieサイズがこの制限を超えると、`commitSession()`はエラーをスローします。

もう1つの欠点は、セッションを変更するすべてのローダーとアクションで`Set-Cookie`ヘッダーを更新する必要があることです（これには、フラッシュされたセッション値の読み取りも含まれます）。他の戦略では、セッションCookieはセッションデータを保存せず、それを検索するためのキーのみを保存するため、一度だけ設定すれば済みます。

```ts
import { createCookieSessionStorage } from "@remix-run/node"; // or cloudflare/deno

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    // `createCookie`からのCookie、またはCookieを作成するための同じCookieOptions
    cookie: {
      name: "__session",
      secrets: ["r3m1xr0ck5"],
      sameSite: "lax",
    },
  });
```

他のセッション実装では、一意のセッションIDをCookieに保存し、そのIDを使用して真のソース（インメモリ、ファイルシステム、DBなど）でセッションを検索することに注意してください。Cookieセッションでは、Cookie自体が真のソースであるため、すぐに利用できる一意のIDはありません。Cookieセッションで一意のIDを追跡する必要がある場合は、`session.set()`を介して自分でID値を追加する必要があります。

## `createMemorySessionStorage`

このストレージは、すべてのCookie情報をサーバーのメモリに保持します。

<docs-error>これは開発環境でのみ使用してください。本番環境では他の方法のいずれかを使用してください。</docs-error>

```ts filename=app/sessions.server.ts
import {
  createCookie,
  createMemorySessionStorage,
} from "@remix-run/node"; // or cloudflare/deno

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

## `createFileSessionStorage` (Node.js, Deno)

ファイルベースのセッションには、`createFileSessionStorage()`を使用します。ファイルセッションストレージにはファイルシステムが必要ですが、これはほとんどのクラウドプロバイダーでExpressを実行している場合、追加の設定なしで簡単に利用できるはずです。

ファイルベースのセッションの利点は、セッションIDのみがCookieに保存され、残りのデータはディスク上の通常のファイルに保存されることです。これは、4KBを超えるデータを持つセッションに最適です。

<docs-info>サーバーレス関数にデプロイする場合は、永続的なファイルシステムにアクセスできることを確認してください。通常、追加の設定なしでは利用できません。</docs-info>

```ts filename=app/sessions.server.ts
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

## `createWorkersKVSessionStorage` (Cloudflare)

[Cloudflare Workers KV][cloudflare-kv]ベースのセッションには、`createWorkersKVSessionStorage()`を使用します。

KVベースのセッションの利点は、セッションIDのみがCookieに保存され、残りのデータはグローバルにレプリケートされた低遅延データストアに保存され、非常に高い読み取り量をサポートすることです。

```ts filename=app/sessions.server.ts
import {
  createCookie,
  createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";

// この例では、Cookieは個別に作成されます。
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

## `createArcTableSessionStorage` (Architect, Amazon DynamoDB)

[Amazon DynamoDB][amazon-dynamo-db]ベースのセッションには、`createArcTableSessionStorage()`を使用します。

DynamoDBベースのセッションの利点は、セッションIDのみがCookieに保存され、残りのデータはグローバルにレプリケートされた低遅延データストアに保存され、非常に高い読み取り量をサポートすることです。

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

// この例では、Cookieは個別に作成されます。
const sessionCookie = createCookie("__session", {
  secrets: ["r3m1xr0ck5"],
  maxAge: 3600,
  sameSite: true,
});

const { getSession, commitSession, destroySession } =
  createArcTableSessionStorage({
    // テーブル名（app.arcと一致させる必要があります）
    table: "sessions",
    // セッションIDを保存するために使用されるキーの名前（app.arcと一致させる必要があります）
    idx: "_idx",
    // 有効期限を保存するために使用されるキーの名前（app.arcと一致させる必要があります）
    ttl: "_ttl",
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
```

## セッションAPI

`getSession()`でセッションを取得した後、返されるセッションオブジェクトには、取得したセッションデータを読み取りおよび更新するためのいくつかのメソッドがあります。

```tsx
export async function action({
  request,
}: ActionFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );

  session.get("foo");
  session.unset("bar");
  // etc.

  await commitSession(session);
}
```

<docs-warning>セッションデータを変更するたびに、`commitSession()`を実行する必要があります。そうしないと、変更が失われます。</docs-warning>

<docs-warning>Cookieセッションストレージを使用する場合、`commitSession()`を実行するたびに`Set-Cookie`を設定する必要があります。そうしないと、変更が失われます。</docs-warning>

### `session.has(key)`

セッションに指定された`name`の変数が存在する場合に`true`を返します。

```ts
session.has("userId");
```

### `session.set(key, value)`

後続のリクエストで使用するためにセッション値を設定します。

```ts
session.set("userId", "1234");
```

### `session.flash(key, value)`

後続のリクエストで最初に読み取られたときに解除されるセッション値を設定します。その後は消滅します。「フラッシュメッセージ」やサーバーサイドのフォーム検証メッセージに最も役立ちます。

```ts
session.flash(
  "globalMessage",
  "Project successfully archived"
);
```

### `session.get(key)`

以前のリクエストからセッション値にアクセスします。

```ts
session.get("name");
```

### `session.unset(key)`

セッションから値を削除します。

```ts
session.unset("name");
```

[cookies]: ./cookies
[constraints]: ../guides/constraints
[csrf]: https://developer.mozilla.org/en-US/docs/Glossary/CSRF
[cloudflare-kv]: https://developers.cloudflare.com/workers/learning/how-kv-works
[amazon-dynamo-db]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide