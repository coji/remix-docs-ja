---
title: シングルフェッチ
---

# シングルフェッチ

<docs-warning>これは不安定な API であり、今後変更される可能性があります。本番環境では使用しないでください。</docs-warning>

シングルフェッチは、新しいデータ読み込み戦略とストリーミング形式です。 シングルフェッチを有効にすると、Remix はクライアントサイドの遷移時にサーバーに対して単一の HTTP 呼び出しを行うようになり、複数のパラレルな HTTP 呼び出し（ローダーごとに 1 つ）は行われません。 さらに、シングルフェッチでは、`Date`、`Error`、`Promise`、`RegExp` など、`loader` と `action` から裸のオブジェクトを送信することもできます。

## 概要

Remix は、`v2.9.0` の [`future.unstable_singleFetch`][future-flags] フラグで「シングルフェッチ」([RFC][rfc]) をサポートしました。これにより、この動作を選択できます。 シングルフェッチは、[React Router v7][merging-remix-and-rr] ではデフォルトになります。

シングルフェッチを有効にすることは、事前に労力が少なく、その後は破壊的な変更を段階的に適用できることが意図されています。 最小限必要な変更を適用して [シングルフェッチを有効に][start] した後、[移行ガイド][migration-guide] を使用してアプリケーションの段階的な変更を行うことで、[React Router v7][merging-remix-and-rr] にスムーズかつ破壊的なアップグレードを行うことができます。

[破壊的な変更][breaking-changes] も確認してください。特に、シリアル化とステータス/ヘッダーの動作に関する、基底となる動作の変更について理解する必要があります。

## シングルフェッチを有効にする

**1. Future フラグを有効にする**

```ts filename=vite.config.ts lines=[6]
export default defineConfig({
  plugins: [
    remix({
      future: {
        // ...
        unstable_singleFetch: true,
      },
    }),
    // ...
  ],
});
```

**2. 廃止された `fetch` ポリフィル**

シングルフェッチでは、[`undici`][undici] を `fetch` ポリフィルとして使用するか、Node 20+ の組み込みの `fetch` を使用する必要があります。これは、`@remix-run/web-fetch` ポリフィルには含まれていない、ここで使用可能な API に依存しているためです。 2.9.0 リリースノートの [Undici][undici-polyfill] セクションで、詳細を確認してください。

- Node 20+ を使用している場合は、`installGlobals()` への呼び出しを削除し、Node の組み込みの `fetch` を使用してください（これは `undici` と同じものです）。

- 独自のサーバーを管理していて `installGlobals()` を呼び出している場合は、`installGlobals({ nativeFetch: true })` を呼び出して `undici` を使用する必要があります。

  ```diff
  - installGlobals();
  + installGlobals({ nativeFetch: true });
  ```

- `remix-serve` を使用している場合は、シングルフェッチが有効になっていると、`undici` が自動的に使用されます。

- Miniflare/Cloudflare Worker を Remix プロジェクトで使用している場合は、[互換性フラグ][compatibility-flag] が `2023-03-01` 以降に設定されていることを確認してください。

**3. `headers` 実装を調整する（必要に応じて）**

シングルフェッチが有効になっていると、複数のローダーを実行する場合でも、クライアントサイドのナビゲーションでは 1 つの要求しか行われなくなります。 呼び出されるハンドラーのヘッダーをマージするために、[`headers`][headers] エクスポートは、`loader`/`action` データ要求にも適用されるようになりました。 多くの場合、ドキュメント要求に対してすでに持っているロジックは、新しいシングルフェッチデータ要求に対してほぼ十分です。

**4. `<RemixServer>` に `nonce` を追加する（CSP を使用している場合）**

`<RemixServer>` コンポーネントは、クライアント側でストリーミングデータを処理するインラインスクリプトをレンダリングします。 [スクリプト用のコンテンツセキュリティポリシー][csp] に [nonce ソース][csp-nonce] が含まれている場合は、`<RemixServer nonce>` を使用して、これらの `<script>` タグに nonce を渡すことができます。

**5. `renderToString` を置き換える（使用している場合）**

ほとんどの Remix アプリケーションでは、`renderToString` は使用していませんが、`entry.server.tsx` で使用することを選択している場合は、読み進めてください。 そうでない場合は、この手順をスキップできます。

ドキュメント要求とデータ要求の整合性を保つために、`turbo-stream` は、最初のドキュメント要求でのデータ送信にも使用されます。 つまり、シングルフェッチを選択すると、アプリケーションで [`renderToString`][rendertostring] を使用できなくなり、[`entry.server.tsx`][entry-server] で [`renderToPipeableStream`][rendertopipeablestream] または [`renderToReadableStream`][rendertoreadablestream] などの React ストリーミングレンダラー API を使用する必要があります。

これは、HTTP レスポンスをストリーミングする必要があるという意味ではありません。`renderToPipeableStream` の `onAllReady` オプション、または `renderToReadableStream` の `allReady` プロミスを利用することで、依然としてドキュメント全体を一度に送信できます。

クライアント側では、ストリーミングされたデータは `Suspense` バウンダリでラップされているため、クライアントサイドの [`hydrateRoot`][hydrateroot] 呼び出しを [`startTransition`][starttransition] 呼び出しでラップする必要があります。

## 破壊的な変更

シングルフェッチには、いくつかの破壊的な変更が導入されています。その中には、フラグを有効にしたときにすぐに処理する必要があるものもあれば、フラグを有効にした後、段階的に処理できるものもあります。 次のメジャーバージョンにアップグレードする前に、これらがすべて処理されていることを確認する必要があります。

**すぐに処理する必要がある変更：**

- **廃止された `fetch` ポリフィル：** 古い `installGlobals()` ポリフィルはシングルフェッチでは動作しません。[undici ベースのポリフィル][undici-polyfill] を取得するには、Node 20 のネイティブ `fetch` API を使用するか、カスタムサーバーで `installGlobals({ nativeFetch: true })` を呼び出す必要があります。
- **`headers` エクスポートがデータ要求に適用される：** [`headers`][headers] 関数は、ドキュメント要求とデータ要求の両方に適用されるようになりました。

**段階的に処理する必要がある、認識しておくべき変更：**

- **[新しいストリーミングデータ形式][streaming-format]：** シングルフェッチは、[`turbo-stream`][turbo-stream] を通じて、新しいストリーミング形式を内部的に使用しています。つまり、JSON よりも複雑なデータをストリーミングできます。
- **自動シリアル化は行われなくなった：** `loader` と `action` 関数から返される裸のオブジェクトは、自動的に JSON `Response` に変換されなくなり、ワイヤー上でそのままシリアル化されます。
- **型推論の更新：** 最も正確な型推論を得るには、次の 2 つを行う必要があります。
  - `@remix-run/react/future/single-fetch.d.ts` を `tsconfig.json` の `compilerOptions.types` 配列の最後に追加する
  - ルートで `unstable_defineLoader`/`unstable_defineAction` を使用し始める
    - これは段階的に行うことができます。現在の状態では、型推論はほとんど正確です。
- [**`action` の再検証のオプトイン：**][action-revalidation] `action` の `4xx`/`5xx` `Response` 後の再検証は、オプトアウトではなく、オプトインになりました。

## シングルフェッチを使用した新しいルートの追加

シングルフェッチが有効になっていると、より強力なストリーミング形式を利用できるルートを作成できます。

<docs-info>適切な型推論を得るには、最初に `@remix-run/react/future/single-fetch.d.ts` を `tsconfig.json` の `compilerOptions.types` 配列の最後に追加する必要があります。 詳細については、[型推論のセクション][type-inference-section] を参照してください。</docs-info>

シングルフェッチを使用すると、`loader` から次のデータ型を返すことができます。 `BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、および `URL` です。

```tsx
// routes/blog.$slug.tsx
import { unstable_defineLoader as defineLoader } from "@remix-run/node";

export const loader = defineLoader(async ({ params }) => {
  const { slug } = params;

  const comments = fetchComments(slug);
  const blogData = await fetchBlogData(slug);

  return {
    content: blogData.content, // <- string
    published: blogData.date, // <- Date
    comments, // <- Promise
  };
});

export default function BlogPost() {
  const blogData = useLoaderData<typeof loader>();
  //    ^? { content: string, published: Date, comments: Promise }

  return (
    <>
      <Header published={blogData.date} />
      <BlogContent content={blogData.content} />
      <Suspense fallback={<CommentsSkeleton />}>
        <Await resolve={blogData.comments}>
          {(comments) => (
            <BlogComments comments={comments} />
          )}
        </Await>
      </Suspense>
    </>
  );
}
```

## シングルフェッチを使用したルートの移行

ローダーから `Response` インスタンスを返している場合（つまり、`json`/`defer`）、シングルフェッチを利用するために多くの変更を加える必要はありません。

ただし、将来、[React Router v7][merging-remix-and-rr] にアップグレードする準備として、ルートごとに次の変更を加え始めることをお勧めします。 これは、ヘッダーとデータ型を更新しても問題が発生しないことを確認する最も簡単な方法です。

### 型推論

シングルフェッチがない場合、`loader` または `action` から返されたプレーンな JavaScript オブジェクトは、自動的に JSON レスポンスにシリアル化されます（`json` を介して返された場合と同じです）。 型推論はこれが事実であると想定し、裸のオブジェクトの返り値を、JSON シリアル化されたものとして推論します。

シングルフェッチでは、裸のオブジェクトは直接ストリーミングされるため、シングルフェッチを選択すると、組み込みの型推論は正確ではなくなります。 たとえば、`Date` はクライアント側で文字列にシリアル化されると想定されます 😕。

シングルフェッチを使用する場合に適切な型を得るには、`tsconfig.json` の `compilerOptions.types` 配列に含めることができる一連の型オーバーライドを用意しました。これは、シングルフェッチの動作に合わせて型を調整します。

```json
{
  "compilerOptions": {
    //...
    "types": [
      // ...
      "@remix-run/react/future/single-fetch.d.ts"
    ]
  }
}
```

🚨 シングルフェッチの型は、`types` にある他の Remix パッケージの後に来るようにしてください。そうすることで、それらの既存の型をオーバーライドできます。

#### ローダー/アクション定義ユーティリティ

シングルフェッチでローダーとアクションを定義する際に型安全性を高めるために、新しい `unstable_defineLoader` と `unstable_defineAction` ユーティリティを使用できます。

```ts
import { unstable_defineLoader as defineLoader } from "@remix-run/node";

export const loader = defineLoader(({ request }) => {
  //                                  ^? Request
});
```

これは、引数の型を提供するだけでなく（`LoaderFunctionArgs` は非推奨になりました）、シングルフェッチと互換性のある型を返すことも保証します。

```ts
export const loader = defineLoader(() => {
  return { hello: "world", badData: () => 1 };
  //                       ^^^^^^^ 型エラー: `badData` はシリアル化できません
});

export const action = defineAction(() => {
  return { hello: "world", badData: new CustomType() };
  //                       ^^^^^^^ 型エラー: `badData` はシリアル化できません
});
```

シングルフェッチは、次の返り値型をサポートしています。

```ts
type Serializable =
  | undefined
  | null
  | boolean
  | string
  | symbol
  | number
  | bigint
  | Date
  | URL
  | RegExp
  | Error
  | Array<Serializable>
  | { [key: PropertyKey]: Serializable } // シリアル化可能な値を持つオブジェクト
  | Map<Serializable, Serializable>
  | Set<Serializable>
  | Promise<Serializable>;
```

`defineClientLoader`/`defineClientAction` のクライアント側の同等物もあります。これらは、ワイヤー上でシリアル化する必要がないため、`clientLoader`/`clientAction` から返されたデータには、同じ返り値の制限はありません。

```ts
import { unstable_defineLoader as defineLoader } from "@remix-run/node";
import { unstable_defineClientLoader as defineClientLoader } from "@remix-run/react";

export const loader = defineLoader(() => {
  return { msg: "Hello!", date: new Date() };
});

export const clientLoader = defineClientLoader(
  async ({ serverLoader }) => {
    const data = await serverLoader<typeof loader>();
    //    ^? { msg: string, date: Date }
    return {
      ...data,
      client: "World!",
    };
  }
);

export default function Component() {
  const data = useLoaderData<typeof clientLoader>();
  //    ^? { msg: string, date: Date, client: string }
}
```

<docs-info>これらのユーティリティは、主に `useLoaderData` とその同等物の型推論用です。 `Response` を返し、Remix API（`useFetcher` など）で使用されないリソースルートがある場合は、通常の `loader`/`action` 定義のままにしておくことができます。 これらのルートを `defineLoader`/`defineAction` を使用するように変換すると、`turbo-stream` は `Response` インスタンスをシリアル化できないため、型エラーが発生します。</docs-info>

#### `useLoaderData`、`useActionData`、`useRouteLoaderData`、`useFetcher`

これらのメソッドでは、コードの変更は不要です。 シングルフェッチの型を追加すると、ジェネリックは正しく逆シリアル化されます。

```ts
export const loader = defineLoader(async () => {
  const data = await fetchSomeData();
  return {
    message: data.message, // <- string
    date: data.date, // <- Date
  };
});

export default function Component() {
  // ❌ シングルフェッチがない場合、型は JSON.stringify を介してシリアル化されます
  const data = useLoaderData<typeof loader>();
  //    ^? { message: string, date: string }

  // ✅ シングルフェッチを使用すると、型は turbo-stream を介してシリアル化されます
  const data = useLoaderData<typeof loader>();
  //    ^? { message: string, date: Date }
}
```

#### `useMatches`

`useMatches` では、特定の `match.data` で適切な型推論を行うために、ローダー型の指定を手動でキャストする必要があります。 シングルフェッチを使用している場合は、`UIMatch` 型を `UIMatch_SingleFetch` に置き換える必要があります。

```diff
  let matches = useMatches();
- let rootMatch = matches[0] as UIMatch<typeof loader>;
+ let rootMatch = matches[0] as UIMatch_SingleFetch<typeof loader>;
```

#### `meta` 関数

`meta` 関数でも、現在のルートと祖先ルートのローダー型をジェネリックで示す必要があります。これにより、`data` と `matches` パラメータが適切に型付けされます。 シングルフェッチを使用している場合は、`MetaArgs` 型を `MetaArgs_SingleFetch` に置き換える必要があります。

```diff
  export function meta({
    data,
    matches,
- }: MetaArgs<typeof loader, { root: typeof rootLoader }>) {
+ }: MetaArgs_SingleFetch<typeof loader, { root: typeof rootLoader }>) {
    // ...
  }
```

### ヘッダー

[`headers`][headers] 関数は、シングルフェッチが有効になっていると、ドキュメント要求とデータ要求の両方で使用されます。 この関数を用いて、並行して実行されるローダーから返されたヘッダーをマージするか、特定の `actionHeaders` を返すことができます。

### 返されるレスポンス

シングルフェッチでは、`Response` インスタンスを返す必要がなくなり、裸のオブジェクトを返すだけでデータを送信できます。 したがって、`json`/`defer` ユーティリティは、シングルフェッチを使用する場合は非推奨と見なされます。 これらは、v2 の間は保持されますので、すぐに削除する必要はありません。 これは、次のメジャーバージョンで削除される可能性があるため、これ以降、段階的に削除することをお勧めします。

v2 では、通常の `Response` インスタンスを返し続けることができ、`status`/`headers` は、ドキュメント要求と同じように有効になります（`headers()` 関数を介してヘッダーをマージします）。

時間をかけて、ローダーとアクションから返されるレスポンスを削除する必要があります。

- `loader`/`action` が、`status`/`headers` を設定せずに `json`/`defer` を返していた場合は、`json`/`defer` への呼び出しを削除して、データを直接返すことができます。
- `loader`/`action` が、`json`/`defer` を介してカスタム `status`/`headers` を返していた場合は、新しい [`unstable_data()`][data-utility] ユーティリティを使用するように切り替える必要があります。

### クライアントローダー

アプリケーションに [`clientLoader`][client-loader] 関数を使用するルートがある場合は、シングルフェッチの動作がわずかに変化することに注意することが重要です。 `clientLoader` は、サーバーの `loader` 関数の呼び出しをオプトアウトする方法であるため、シングルフェッチの呼び出しでサーバーのローダーを実行することは適切ではありません。 しかし、すべてのローダーは並行して実行され、どの `clientLoader` が実際にサーバーデータを求めているかを判断するまで、呼び出しを待つわけにはいきません。

たとえば、次の `/a/b/c` ルートを考えてみましょう。

```ts
// routes/a.tsx
export function loader() {
  return { data: "A" };
}

// routes/a.b.tsx
export function loader() {
  return { data: "B" };
}

// routes/a.b.c.tsx
export function loader() {
  return { data: "C" };
}

export function clientLoader({ serverLoader }) {
  await doSomeStuff();
  const data = await serverLoader();
  return { data };
}
```

ユーザーが `/ -> /a/b/c` に移動した場合、`a` と `b` のサーバーローダーと、`c` の `clientLoader` を実行する必要があります。これは、最終的に（または、そうではない場合もありますが）独自のサーバー `loader` を呼び出します。 `c` が実際に `serverLoader` を呼び出す（または返す）まで、`c` のサーバー `loader` をシングルフェッチの呼び出しに含めるかどうかを決定することはできませんし、ウォーターフォールを導入することなく、その呼び出しまで遅らせることもできません。

したがって、シングルフェッチをオプトアウトする `clientLoader` をエクスポートする場合、`serverLoader` を呼び出すと、独自のルートサーバー `loader` を取得するために、単一のフェッチが行われます。 `clientLoader` をエクスポートしないすべてのルートは、単一の HTTP 要求でフェッチされます。

したがって、上記のルート設定では、`/ -> /a/b/c` へのナビゲーションは、最初に、`a` と `b` のルートに対する単一のシングルフェッチ呼び出しになります。

```
GET /a/b/c.data?_routes=routes/a,routes/b
```

そして、`c` が `serverLoader` を呼び出すと、`c` のサーバー `loader` だけに対する独自の呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/c
```

### リソースルート

シングルフェッチで使用される新しい [ストリーミング形式][streaming-format] のため、`loader` と `action` 関数から返される生の JavaScript オブジェクトは、`json()` ユーティリティを使用して自動的に `Response` インスタンスに変換されなくなりました。 代わりに、ナビゲーションのデータ読み込みでは、他のローダーデータと組み合わされて、`turbo-stream` レスポンスでストリーミングされます。

これは、[リソースルート][resource-routes] に対しては興味深いジレンマをもたらします。 リソースルートは、個別にヒットすることを意図しているため、ユニークです。 常に Remix API を通してとは限りません。 また、他の HTTP クライアント（`fetch`、`cURL` など）からもアクセスできます。

リソースルートが内部の Remix API で使用されることを意図している場合は、`Date` や `Promise` インスタンスなど、より複雑な構造をストリーミングできるようになるために、`turbo-stream` エンコーディングを利用したいと考えています。 しかし、外部からアクセスされる場合は、JSON 構造を返した方が、より簡単に使用できる可能性があります。 したがって、生のオブジェクトを v2 で返した場合、その動作はあいまいになります。`turbo-stream` や `json()` を介してシリアル化する必要がありますか？

後方互換性を確保し、シングルフェッチ future フラグの採用を容易にするため、Remix v2 では、これが Remix API からアクセスされているか、外部からアクセスされているかによって処理されます。 将来的には、Remix では、生のオブジェクトを外部で使用するためにストリーミングさせたくない場合は、独自の [JSON レスポンス][returning-response] を返す必要があるようになります。

シングルフェッチが有効になっている Remix v2 の動作は以下のとおりです。

- `useFetcher` などの Remix API からアクセスする場合、生の JavaScript オブジェクトは、通常のローダーとアクションと同様に、`turbo-stream` レスポンスとして返されます（これは、`useFetcher` が要求に `.data` サフィックスを追加するためです）。

- `fetch` や `cURL` などの外部ツールからアクセスする場合、v2 では後方互換性を維持するために、`json()` に自動的に変換されます。

  - Remix は、この状況が発生した場合、非推奨の警告をログに記録します。
  - ご都合の良いときに、影響を受けるリソースルートハンドラーを更新して、`Response` オブジェクトを返すことができます。
  - これらの非推奨の警告に対処することで、最終的な Remix v3 へのアップグレードの準備が整います。

  ```tsx filename=app/routes/resource.tsx bad
  export function loader() {
    return {
      message: "My externally-accessed resource route",
    };
  }
  ```

  ```tsx filename=app/routes/resource.tsx good
  export function loader() {
    return Response.json({
      message: "My externally-accessed resource route",
    });
  }
  ```

注：特定の `Response` インスタンスを返す必要がある、外部からアクセスできるリソースルートでは、`defineLoader`/`defineAction` を使用することはお勧めしません。 これらの場合は、`loader`/`LoaderFunctionArgs` をそのまま使用する方が良いでしょう。

## その他の詳細

### ストリーミングデータ形式

以前は、Remix は `JSON.stringify` を使用してローダー/アクションデータをワイヤー上でシリアル化し、`defer` レスポンスをサポートするために、カスタムストリーミング形式を実装する必要がありました。

シングルフェッチでは、Remix は内部的に [`turbo-stream`][turbo-stream] を使用しています。これは、ストリーミングをネイティブにサポートし、JSON よりも複雑なデータを自動的にシリアル化/逆シリアル化できるようにするものです。 次のデータ型は、`turbo-stream` を介して直接ストリーミングできます。 `BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、および `URL` です。 `Error` のサブタイプもサポートされています。ただし、クライアントにグローバルに利用可能なコンストラクターがある必要があります（`SyntaxError`、`TypeError` など）。

これは、シングルフェッチを有効にしたときに、コードをすぐに変更する必要がある場合もあれば、不要な場合もあります。

- ✅ `loader`/`action` 関数から返される `json` レスポンスは、依然として `JSON.stringify` を介してシリアル化されます。そのため、`Date` を返した場合、`useLoaderData`/`useActionData` からは `string` が返されます。
- ⚠️ `defer` インスタンスまたは裸のオブジェクトを返している場合は、`turbo-stream` を介してシリアル化されるようになりました。そのため、`Date` を返した場合、`useLoaderData`/`useActionData` からは `Date` が返されます。
  - 現在の動作を維持したい場合は（ストリーミングされた `defer` レスポンスを除く）、既存の裸のオブジェクトの返り値を `json` でラップすればよいでしょう。

これは、`Promise` インスタンスをワイヤー上で送信するために、`defer` ユーティリティを使用する必要がないことも意味します。 裸のオブジェクトのどこにでも `Promise` を含めて、`useLoaderData().whatever` で取得できます。 必要に応じて `Promise` をネストすることもできますが、潜在的な UX の影響に注意してください。

シングルフェッチを採用したら、アプリケーション全体で `json`/`defer` の使用を段階的に削除して、生のオブジェクトを返すようにすることをお勧めします。

### ストリーミングタイムアウト

以前は、Remix には、デフォルトの [`entry.server.tsx`][entry-server] ファイルに組み込まれた `ABORT_TIMEOUT` の概念があり、React レンダラーを終了していましたが、保留中の遅延プロミスをクリーンアップするためには特に何もしていませんでした。

現在、Remix は内部的にストリーミングしているため、`turbo-stream` の処理をキャンセルして、保留中のすべてのプロミスを自動的に拒否し、それらのエラーをクライアントにストリーミングできます。 デフォルトでは、これは 4950 ミリ秒後に発生します。これは、ほとんどの `entry.server.tsx` ファイルの現在の 5000 ミリ秒の `ABORT_DELAY` よりもわずかに短い値です。 これは、React の処理を中止する前に、プロミスをキャンセルして、リジェクションを React レンダラーにストリーミングする必要があるためです。

これは、`entry.server.tsx` から `streamTimeout` の数値をエクスポートすることで制御できます。Remix は、この値をミリ秒単位で、その後に `loader`/`action` の保留中のすべてのプロミスを拒否する時間として使用します。 この値を、React レンダラーを中止するタイムアウトから切り離すことをお勧めします。 また、React のタイムアウトを常により長い値に設定して、`streamTimeout` の基底となるリジェクションを React にストリーミングする時間を与える必要があります。

```tsx filename=app/entry.server.tsx lines=[1-2,32-33]
// 5 秒後に、ハンドラー関数の保留中のすべてのプロミスを拒否する
export const streamTimeout = 5000;

// ...

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onShellReady() {
          /* ... */
        },
        onShellError(error: unknown) {
          /* ... */
        },
        onError(error: unknown) {
          /* ... */
        },
      }
    );

    // React レンダラーを 10 秒後に自動的にタイムアウトする
    setTimeout(abort, 10000);
  });
}
```

### 再検証

以前は、Remix は、アクションの送信結果に関係なく、常にすべてのアクティブなローダーを再検証していました。 ルートごとに [`shouldRevalidate`][should-revalidate] を介して再検証をオプトアウトできました。

シングルフェッチでは、`action` が `4xx/5xx` ステータスコードの `Response` を返したり、スローしたりした場合、デフォルトではローダーは再検証されません。 `action` が `4xx/5xx` レスポンスではないものを返したり、スローしたりした場合、再検証の動作は変わりません。 ここでは、`4xx`/`5xx` レスポンスを返した場合、ほとんどの場合、データは実際に変更されていないため、データを再読み込みする必要がないと判断されています。

`4xx/5xx` アクションレスポンス後に、1 つ以上のローダーを再検証したい場合は、[`shouldRevalidate`][should-revalidate] 関数から `true` を返すことで、ルートごとに再検証をオプトインできます。 アクションのステータスコードに基づいて判断する必要がある場合は、新しい `actionStatus` パラメータも関数に渡されます。

再検証は、シングルフェッチ HTTP 呼び出しの `?_routes` クエリ文字列パラメータによって処理されます。これは、呼び出されるローダーを制限します。 つまり、詳細な再検証を行っている場合、要求されているルートに基づいてキャッシュの列挙が行われますが、すべての情報は URL に含まれているため、特別な CDN 設定は必要ありません（カスタムヘッダーを介して行われた場合、CDN が `Vary` ヘッダーを尊重する必要があったのと対照的です）。

[future-flags]: ../file-conventions/remix-config#future
[should-revalidate]: ../route/should-revalidate
[entry-server]: ../file-conventions/entry.server
[client-loader]: ../route/client-loader
[2.9.0]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#v290
[rfc]: https://github.com/remix-run/remix/discussions/7640
[turbo-stream]: https://github.com/jacob-ebey/turbo-stream
[rendertopipeablestream]: https://react.dev/reference/react-dom/server/renderToPipeableStream
[rendertoreadablestream]: https://react.dev/reference/react-dom/server/renderToReadableStream
[rendertostring]: https://react.dev/reference/react-dom/server/renderToString
[hydrateroot]: https://react.dev/reference/react-dom/client/hydrateRoot
[starttransition]: https://react.dev/reference/react/startTransition
[headers]: ../route/headers
[resource-routes]: ../guides/resource-routes
[returning-response]: ../route/loader.md#returning-response-instances
[streaming-format]: #streaming-data-format
[undici-polyfill]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#undici
[undici]: https://github.com/nodejs/undici
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
[csp-nonce]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources
[merging-remix-and-rr]: https://remix.run/blog/merging-remix-and-react-router
[migration-guide]: #シングルフェッチを使用したルートの移行
[breaking-changes]: #破壊的な変更
[action-revalidation]: #ストリーミングデータ形式
[start]: #シングルフェッチを有効にする
[type-inference-section]: #型推論
[compatibility-flag]: https://developers.cloudflare.com/workers/configuration/compatibility-dates
[data-utility]: ../utils/data

