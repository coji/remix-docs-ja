---
title: シングルフェッチ
---

# シングルフェッチ

<docs-warning>これは不安定な API であり、今後も変更され続けるため、本番環境では使用しないでください。</docs-warning>

シングルフェッチは、新しいデータデータローディング戦略とストリーミング形式です。シングルフェッチを有効にすると、Remix はクライアント側の遷移でサーバーに対して単一の HTTP 呼び出しを行うようになり、複数の HTTP 呼び出しを並行して行う（ローダーごとに 1 つずつ）ことがなくなります。さらに、シングルフェッチでは、`Date`、`Error`、`Promise`、`RegExp` など、`loader` と `action` から裸のオブジェクトを送り出すこともできます。

## シングルフェッチの有効化

Remix は、`v2.9.0` の [`future.unstable_singleFetch`][future-flags] フラグの背後で「シングルフェッチ」([RFC][rfc]) のサポートを導入しました。これにより、この動作を選択できます。シングルフェッチは、[React Router v7][merging-remix-and-rr] ではデフォルトになります。

シングルフェッチの有効化は非常に簡単です。現在ローダーから `Response` インスタンスを返している場合（例：`json`/`defer`）、アプリケーションコードを変更する必要はほとんどありません。ただし、以下に示す「破壊的変更」についてよく理解しておく必要があります。特にシリアライゼーションとステータス/ヘッダーの動作に関する変更点です。

**1. 未来のフラグを有効にする**

```diff
  remix({
    future: {
      // ...
+     unstable_singleFetch: true,
    },
  }),
```

**2. `installGlobals` を更新または削除する**

シングルフェッチでは、[`undici`][undici] を `fetch` ポリフィルとして使用するか、Node 20 以降の組み込みの `fetch` を使用する必要があります。これは、`@remix-run/web-fetch` ポリフィルには含まれていない、そこで使用できる API に依存しているためです。詳細については、以下の 2.9.0 リリースノートの [Undici][undici-polyfill] セクションを参照してください。

- Node 20 以降を使用している場合は、`installGlobals()` を削除して、Node の組み込みの `fetch` を使用してください（これは `undici` と同じです）。

- 独自のサーバーを管理し、`installGlobals()` を呼び出している場合は、`undici` を使用するように `installGlobals({ nativeFetch: true })` を呼び出す必要があります。

  ```diff
  - installGlobals()
  + installGlobals({ nativeFetch: true })
  ```

- `remix-serve` を使用している場合は、シングルフェッチが有効になっていると、自動的に `undici` が使用されます。

**3. `renderToString` を置き換える**

ほとんどの Remix アプリケーションでは `renderToString` を使用していない可能性がありますが、`entry.server.tsx` で使用するように選択している場合は、読み進めてください。そうでなければ、この手順はスキップできます。

ドキュメントリクエストとデータリクエストの整合性を維持するために、`turbo-stream` も、初期ドキュメントリクエストでデータを送り出すための形式として使用されます。これは、シングルフェッチを選択すると、アプリケーションでは [`renderToString`][rendertostring] を使用できなくなり、[`entry.server.tsx`][entry-server] で [`renderToPipeableStream`][rendertopipeablestream] や [`renderToReadableStream`][rendertoreadablestream]) などの React ストリーミングレンダラー API を使用する必要があることを意味します。

これは、HTTP レスポンスをストリーミングする必要があることを意味するわけではありません。`renderToPipeableStream` の `onAllReady` オプション、または `renderToReadableStream` の `allReady` プロミスを活用することで、依然として一度に完全なドキュメントを送信できます。

クライアント側では、ストリーミングされたデータは `Suspense` バウンダリにラップされて送られてくるため、クライアント側の [`hydrateRoot`][hydrateroot] 呼び出しを [`startTransition`][starttransition] 呼び出しでラップする必要があります。

## 破壊的変更

前述のように、ローダーから `Response` インスタンスを返している場合（例：`json`/`defer`）、アプリケーションコードを変更する必要はほとんどありません。より良い型推論を得て、React Router v7 に備えるために、[ルートを 1 つずつ移行できます][migration-guide]。

シングルフェッチでは、いくつかの重要な破壊的変更が導入されています。これらは重要な変更点です。

- **[新しいストリーミングデータ形式][streaming-format]**: シングルフェッチでは、[`turbo-stream`][turbo-stream] を使用した新しいストリーミング形式が内部的に使用されます。これは、JSON だけでなく、より複雑なデータをストリーミングできることを意味します。
- **自動シリアライゼーションの廃止**: `loader` と `action` 関数から返された裸のオブジェクトは、自動的に JSON `Response` に変換されなくなり、ワイヤー上でそのままシリアライズされます。
- **型推論の更新**: 最も正確な型推論を得るには、次の 2 つを行う必要があります。
  - `tsconfig.json` の `compilerOptions.types` 配列の最後に `@remix-run/react/future/single-fetch.d.ts` を追加する
  - ルートで `unstable_defineLoader`/`unstable_defineAction` を使い始める
    - これは段階的に行うことができます。現在の状態では、ほぼ正確な型推論が得られます。
- [**オプトイン `action` 再検証**][action-revalidation]: `action` の `4xx`/`5xx` `Response` の後の再検証は、オプトアウトではなく、オプトインになりました。
- **廃止された `headers` エクスポート**: シングルフェッチが有効になっている場合、[`headers`][headers] 関数は使用されなくなり、`loader`/`action` 関数に渡される新しい `response` スタブが使用されます。
- **廃止された `fetch` ポリフィル**: 古い `installGlobals()` ポリフィルはシングルフェッチでは動作しません。Node 20 のネイティブ `fetch` API を使用するか、カスタムサーバーで `installGlobals({ nativeFetch: true })` を呼び出して、[undici ベースのポリフィル][undici-polyfill] を取得する必要があります。

## シングルフェッチを使用した新しいルートの追加

シングルフェッチを有効にすると、より強力なストリーミング形式と `response` スタブを活用するルートを作成できます。

<docs-info>`tsconfig.json` の `compilerOptions.types` 配列の最後に `@remix-run/react/future/single-fetch.d.ts` を追加する必要があります。詳細については、[型推論セクション][type-inference-section] を参照してください。</docs-info>

シングルフェッチでは、ローダーから次のデータ型を返すことができます。`BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL` です。

```tsx
// routes/blog.$slug.tsx
import { unstable_defineLoader as defineLoader } from "@remix-run/node";

export const loader = defineLoader(
  async ({ params, response }) => {
    const { slug } = params;

    const comments = fetchComments(slug);
    const blogData = await fetchBlogData(slug);

    response.headers.set("Cache-Control", "max-age=300");

    return {
      content: blogData.content, // <- string
      published: blogData.date, // <- Date
      comments, // <- Promise
    };
  }
);

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

以下の変更は、シングルフェッチを活用するために必要ではありません（[シングルフェッチの有効化][start] を参照）。これらの変更は、ルートごとに段階的に行うことをお勧めします。これは、ヘッダーやデータ型の変更を検証しやすいためです。

これらの変更を行うことで、React Router v7 へのスムーズで破壊的ではないアップグレードが保証されます。

### 型推論

シングルフェッチなしでは、`loader` または `action` から返されたプレーンな JavaScript オブジェクトは、自動的に JSON レスポンスにシリアライズされます（`json` を介して返された場合と同じように）。型推論は、これが当てはまると想定し、裸のオブジェクトの返りを、JSON シリアライズされたかのように推論します。

シングルフェッチでは、裸のオブジェクトが直接ストリーミングされるため、シングルフェッチを選択した後は、組み込みの型推論は正確ではなくなります。たとえば、`Date` がクライアント側で文字列にシリアライズされると想定されてしまいます 😕。

シングルフェッチを使用する際に適切な型を取得できるように、`tsconfig.json` の `compilerOptions.types` 配列に含めることができる一連の型オーバーライドを用意しました。これにより、型がシングルフェッチの動作と一致するようになります。

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

🚨 シングルフェッチの型は、`types` 内の他の Remix パッケージの後になるようにしてください。これにより、既存の型がオーバーライドされます。

#### ローダー/アクション定義ユーティリティ

シングルフェッチでローダーとアクションを定義する際の型安全性向上のため、新しい `unstable_defineLoader` と `unstable_defineAction` ユーティリティを使用できます。

```ts
import { unstable_defineLoader as defineLoader } from "@remix-run/node";

export const loader = defineLoader(({ request }) => {
  //                                  ^? Request
});
```

これにより、引数の型が得られるだけでなく、`LoaderFunctionArgs` が非推奨になります。また、シングルフェッチと互換性のある型を返すことも保証されます。

```ts
export const loader = defineLoader(() => {
  return { hello: "world", badData: () => 1 };
  //                       ^^^^^^^ 型エラー: `badData` はシリアライズできません
});

export const action = defineAction(() => {
  return { hello: "world", badData: new CustomType() };
  //                       ^^^^^^^ 型エラー: `badData` はシリアライズできません
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
  | { [key: PropertyKey]: Serializable } // シリアライズ可能な値を持つオブジェクト
  | Map<Serializable, Serializable>
  | Set<Serializable>
  | Promise<Serializable>;
```

`defineClientLoader`/`defineClientAction` などのクライアント側の同等物もあります。これらは、ワイヤー上でシリアライズする必要がないため、`clientLoader`/`clientAction` から返されたデータに同じ返り値の制限はありません。

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

<docs-info>これらのユーティリティは、主に `useLoaderData` とその同等物の型推論のためです。`Response` を返し、Remix API（`useFetcher` など）によって消費されないリソースルートがある場合は、通常の `loader`/`action` 定義のままにしておくことができます。これらのルートを `defineLoader`/`defineAction` を使用するように変換すると、`turbo-stream` は `Response` インスタンスをシリアライズできないため、型エラーが発生します。</docs-info>

#### `useLoaderData`、`useActionData`、`useRouteLoaderData`、`useFetcher`

これらのメソッドでは、コードを変更する必要はありません。シングルフェッチの型を追加すると、ジェネリックが正しく逆シリアライズされます。

```ts
export const loader = defineLoader(async () => {
  const data = await fetchSomeData();
  return {
    message: data.message, // <- string
    date: data.date, // <- Date
  };
});

export default function Component() {
  // ❌ シングルフェッチの前は、型は JSON.stringify を介してシリアライズされていました。
  const data = useLoaderData<typeof loader>();
  //    ^? { message: string, date: string }

  // ✅ シングルフェッチでは、型は turbo-stream を介してシリアライズされます。
  const data = useLoaderData<typeof loader>();
  //    ^? { message: string, date: Date }
}
```

#### `useMatches`

`useMatches` では、特定の `match.data` に適切な型推論を取得するために、手動でキャストしてローダータイプを指定する必要があります。シングルフェッチを使用する場合は、`UIMatch` 型を `UIMatch_SingleFetch` に置き換える必要があります。

```diff
  let matches = useMatches();
- let rootMatch = matches[0] as UIMatch<typeof loader>;
+ let rootMatch = matches[0] as UIMatch_SingleFetch<typeof loader>;
```

#### `meta` 関数

`meta` 関数でも、現在のルートローダータイプと祖先ルートローダータイプを示すジェネリックが必要となり、これにより、`data` と `matches` パラメーターが正しく型付けされます。シングルフェッチを使用する場合は、`MetaArgs` 型を `MetaArgs_SingleFetch` に置き換える必要があります。

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

シングルフェッチが有効になっている場合、[`headers`][headers] 関数は使用されなくなりました。
代わりに、`loader`/`action` 関数には、その実行に固有の変更可能な `ResponseStub` が渡されるようになりました。

- HTTP レスポンスのステータスを変更するには、`status` フィールドを直接設定します。
  - `response.status = 201`
- HTTP レスポンスのヘッダーを設定するには、標準の [`Headers`][mdn-headers] API を使用します。
  - `response.headers.set(name, value)`
  - `response.headers.append(name, value)`
  - `response.headers.delete(name)`

```ts
export const action = defineAction(
  async ({ request, response }) => {
    if (!loggedIn(request)) {
      response.status = 401;
      response.headers.append("Set-Cookie", "foo=bar");
      return { message: "Invalid Submission!" };
    }
    await addItemToDb(request);
    return null;
  }
);
```

これらのレスポンススタブをスローして、ローダーとアクションのフローを短絡させることもできます。

```tsx
export const loader = defineLoader(
  ({ request, response }) => {
    if (shouldRedirectToHome(request)) {
      response.status = 302;
      response.headers.set("Location", "/");
      throw response;
    }
    // ...
  }
);
```

各 `loader`/`action` には、固有の `response` インスタンスが渡されるため、他の `loader`/`action` 関数が設定した値を確認することはできません（これは競合状態が発生する可能性があります）。結果の HTTP レスポンスのステータスとヘッダーは、次のように決定されます。

- ステータスコード
  - すべてのステータスコードが設定されていないか、値が 300 未満の場合、最も深いステータスコードが HTTP レスポンスに使用されます。
  - すべてのステータスコードが 300 以上の値に設定されている場合、最も浅い 300 以上の値が HTTP レスポンスに使用されます。
- ヘッダー
  - Remix はヘッダー操作を追跡し、すべてのハンドラーが完了した後、新しい `Headers` インスタンスでそれらを再生します。
  - これらは、アクションを最初に（存在する場合）、次にローダーをトップダウンで、順に再生されます。
  - 子ハンドラーの `headers.set` は、親ハンドラーの値を上書きします。
  - `headers.append` を使用すると、親ハンドラーと子ハンドラーの両方から同じヘッダーを設定できます。
  - `headers.delete` を使用すると、親ハンドラーによって設定された値を削除できますが、子ハンドラーによって設定された値を削除することはできません。

シングルフェッチは裸のオブジェクトの返りをサポートしており、ステータス/ヘッダーを設定するために `Response` インスタンスを返す必要がなくなったため、`json`/`redirect`/`redirectDocument`/`defer` ユーティリティは、シングルフェッチを使用する場合は非推奨と見なされるようになりました。これらは、v2 の間は残っているので、すぐに削除する必要はありません。次のメジャーバージョンでは削除される可能性があるので、段階的に削除することをお勧めします。

これらのユーティリティは、Remix v2 の間は残ります。将来のバージョンでは、[`remix-utils`][remix-utils] などのもの（または、自分で簡単に再実装できます）から利用できるようになる可能性があります。

v2 の場合、通常の `Response` インスタンスを返しても問題ありません。これは、`response` スタブと同じ方法でステータスコードを適用し、`headers.set` を介してすべてのヘッダーを適用します。これにより、親から同じ名前のヘッダー値が上書きされます。ヘッダーを追加する必要がある場合は、`Response` インスタンスの返却から、新しい `response` パラメーターの使用に切り替える必要があります。

これらの機能を段階的に導入できるように、シングルフェッチを有効にしても、すべての `loader`/`action` 関数を変更して `response` スタブを活用する必要はありません。その後、時間をかけて、個々のルートを段階的に変換して、新しい `response` スタブを活用するようにします。

### クライアントローダー

アプリケーションに [`clientLoader`][client-loader] 関数を使用するルートがある場合は、シングルフェッチの動作がわずかに変わる点に注意することが重要です。`clientLoader` は、サーバーの `loader` 関数の呼び出しをオプトアウトする方法として意図されているため、シングルフェッチ呼び出しでそのサーバーのローダーを実行するのは適切ではありません。ただし、すべてのローダーは並行して実行されるため、実際にサーバーのデータ要求をしている `clientLoader` がどれであるかを判別するまで、呼び出しを待つことはできません。

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

ユーザーが `/ -> /a/b/c` に移動した場合、`a` と `b` のサーバーローダー、`c` の `clientLoader` を実行する必要があります。これは、最終的には（または、しない可能性もあります）独自のサーバーの `loader` を呼び出します。`a`/`b` の `loader` をフェッチしたいときに、`c` のサーバーの `loader` をシングルフェッチ呼び出しに含めるかどうかを決定することはできません。また、`c` が実際に `serverLoader` を呼び出す（または返る）まで遅らせることもできません。そうすると、ウォーターフォールが発生します。

したがって、`clientLoader` をエクスポートすると、そのルートはシングルフェッチをオプトアウトし、`serverLoader` を呼び出すと、そのルートのサーバーの `loader` のみを取得するためにシングルフェッチが行われます。`clientLoader` をエクスポートしないすべてのルートは、単一の HTTP リクエストでフェッチされます。

そのため、上記のルート設定で、`/ -> /a/b/c` に移動すると、最初に `a` と `b` のルートの単一のシングルフェッチ呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/a,routes/b
```

その後、`c` が `serverLoader` を呼び出すと、`c` のサーバーの `loader` のみの呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/c
```

### リソースルート

シングルフェッチで使用されている新しい [ストリーミング形式][streaming-format] のため、`loader` と `action` 関数から返された生の JavaScript オブジェクトは、`json()` ユーティリティによって自動的に `Response` インスタンスに変換されなくなりました。代わりに、ナビゲーションデータロードでは、他のローダーデータと組み合わせて、`turbo-stream` レスポンスでストリーミングダウンされます。

これは、個別にヒットすることを意図しているという点でユニークな [リソースルート][resource-routes] にとって、興味深いジレンマをもたらします。これは、常に Remix API 経由とは限りません。また、他の HTTP クライアント（`fetch`、`cURL` など）からもアクセスできます。

リソースルートが内部の Remix API で消費されることを意図している場合、`Date` や `Promise` インスタンスなどのより複雑な構造をストリーミングダウンする機能を活用するために、`turbo-stream` エンコーディングを活用したいところです。ただし、外部からアクセスする場合、JSON 構造の方が消費しやすいので、その方が好ましいでしょう。そのため、生のオブジェクトを v2 で返した場合、動作は少し曖昧になります。`turbo-stream` でシリアライズするべきでしょうか、それとも `json()` でシリアライズするべきでしょうか？

Remix v2 では、後方互換性を確保し、シングルフェッチの未来のフラグの導入を容易にするために、これが Remix API からアクセスされているか、外部からアクセスされているかによって処理が行われます。将来的には、Remix では、生のオブジェクトを外部からの消費のためにストリーミングダウンしたくない場合は、独自の [JSON レスポンス][returning-response] を返す必要があります。

シングルフェッチが有効になっている場合の Remix v2 の動作は次のとおりです。

- `useFetcher` などの Remix API からアクセスする場合、生の JavaScript オブジェクトは、通常のローダーとアクションと同じように、`turbo-stream` レスポンスとして返されます（これは、`useFetcher` がリクエストに `.data` サフィックスを追加するためです）。

- `fetch` や `cURL` などの外部ツールからアクセスする場合、v2 では後方互換性を維持するために、`json()` への自動変換を継続します。

  - Remix は、この状況が発生すると、非推奨の警告をログに記録します。
  - 必要なときに、影響を受けるリソースルートハンドラーを更新して、`Response` オブジェクトを返すようにできます。
  - これらの非推奨の警告に対処することで、将来の Remix v3 へのアップグレードの準備が整います。

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

注：特定の `Response` インスタンスを返す必要がある、外部からアクセスされるリソースルートには、`defineLoader`/`defineAction` を使用することはお勧めしません。これらの場合は、`loader`/`LoaderFunctionArgs` のままにしておくのが最適です。

#### レスポンススタブとリソースルート

前述のように、`headers` エクスポートは、`loader` と `action` 関数に渡される新しい [`response` スタブ][responsestub] が使用されるようになりました。これは、リソースルートではやや混乱を招く可能性があります。これは、実際に `Response` を返すことができるため、複数のローダーの結果を 1 つの Response にマージする必要がないため、「スタブ」という概念は実際には必要ないからです。

```tsx filename=app/routes/resource.tsx
// 独自の Response を使用するのが最も簡単な方法です
export async function loader() {
  const data = await getData();
  return Response.json(data, {
    status: 200,
    headers: {
      "X-Custom": "whatever",
    },
  });
}
```

整合性を保つために、リソースルートの `loader`/`action` 関数には、依然として `response` スタブが渡され、必要に応じて使用できます（非リソースルートハンドラー間でコードを共有する場合など）。

```tsx filename=app/routes/resource.tsx
// しかし、response スタブに値を設定することもできます
export async function loader({
  response,
}: LoaderFunctionArgs) {
  const data = await getData();
  response?.status = 200;
  response?.headers.set("X-Custom", "whatever");
  return Response.json(data);
}
```

`response` スタブを使用し、かつカスタムステータス/ヘッダーを持つ `Response` を返すことは避けるのが最適です。ただし、そうした場合、次のロジックが適用されます。

- `Response` インスタンスのステータスは、`response` スタブのステータスよりも優先されます。
- `response` スタブの `headers` に対するヘッダー操作は、返された `Response` ヘッダーインスタンスで再生されます。

## 詳細

### ストリーミングデータ形式

以前は、Remix は `JSON.stringify` を使用してローダー/アクションデータをワイヤー上でシリアライズし、`defer` レスポンスをサポートするためにカスタムのストリーミング形式を実装する必要がありました。

シングルフェッチでは、Remix は内部的に [`turbo-stream`][turbo-stream] を使用しています。これはストリーミングをファーストクラスでサポートしており、JSON よりも複雑なデータを自動的にシリアライズ/逆シリアライズできます。`BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL` は、`turbo-stream` を介して直接ストリーミングダウンできます。`Error` のサブタイプもサポートされています。ただし、クライアントでグローバルに使用できるコンストラクターを持つ必要があります（`SyntaxError`、`TypeError` など）。

シングルフェッチを有効にした後は、コードを変更する必要がない場合もあります。

- ✅ `loader`/`action` 関数から返された `json` レスポンスは、依然として `JSON.stringify` を介してシリアライズされるため、`Date` を返すと、`useLoaderData`/`useActionData` から `string` が返されます。
- ⚠️ `defer` インスタンスまたは裸のオブジェクトを返している場合、現在は `turbo-stream` を介してシリアライズされるため、`Date` を返すと、`useLoaderData`/`useActionData` から `Date` が返されます。
  - 現在の動作を維持する（ストリーミング `defer` レスポンスを除く）場合は、既存の裸のオブジェクトの返りを `json` でラップするだけです。

これは、ワイヤー上で `Promise` インスタンスを送信するために、`defer` ユーティリティを使用する必要がなくなったことを意味します！裸のオブジェクトのどこにでも `Promise` を含めて、`useLoaderData().whatever` で取得できます。必要に応じて `Promise` をネストすることもできますが、潜在的な UX の影響に注意してください。

シングルフェッチを採用したら、アプリケーション全体で `json`/`defer` の使用を段階的に削除し、生のオブジェクトを返すようにすることをお勧めします。

### ストリーミングタイムアウト

以前は、Remix にはデフォルトの [`entry.server.tsx`][entry-server] ファイルに組み込まれた `ABORT_TIMEOUT` という概念があり、これにより React レンダラーが終了しましたが、保留中の遅延プロミスをクリーンアップする特定の処理は行いませんでした。

現在、Remix は内部的にストリーミングしているため、`turbo-stream` の処理をキャンセルして、保留中のプロミスを自動的に拒否し、それらのエラーをクライアントにストリーミングダウンできます。デフォルトでは、これは 4950 ミリ秒後に発生します。これは、ほとんどの entry.server.tsx ファイルの現在の 5000 ミリ秒の `ABORT_DELAY` よりもわずかに短い値です。これは、プロミスをキャンセルして、React レンダラーが React 側でアボートする前に、拒否をストリーミングダウンする必要があるためです。

`entry.server.tsx` から `streamTimeout` の数値をエクスポートすることで、これを制御できます。Remix は、この値をミリ秒単位で、`loader`/`action` から保留中の Promise を拒否するまでの時間として使用します。この値は、React レンダラーをアボートするタイムアウトとは切り離すことをお勧めします。また、React のタイムアウトを常に大きい値に設定して、`streamTimeout` からの拒否を React レンダラーを通してストリーミングダウンする時間を確保する必要があります。

```tsx filename=app/entry.server.tsx lines=[1-2,32-33]
// ハンドラー関数の保留中のすべてのプロミスを 5 秒後に拒否します。
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

    // 10 秒後に React レンダラーを自動的にタイムアウトします。
    setTimeout(abort, 10000);
  });
}
```

### 再検証

以前は、Remix は、アクションの送信結果にかかわらず、常にすべてのアクティブなローダーを再検証していました。[`shouldRevalidate`][should-revalidate] を使用して、ルートごとに再検証をオプトアウトできます。

シングルフェッチでは、`action` が `4xx/5xx` ステータスコードを持つ `Response` を返したりスローしたりした場合、Remix はデフォルトでローダーを _再検証しません_。`action` が `4xx/5xx` 以外の `Response` を返したりスローしたりした場合、再検証の動作は変わりません。これは、ほとんどの場合、`4xx`/`5xx` の `Response` を返す場合は、実際にはデータを変更していないため、データをリロードする必要がないためです。

`4xx/5xx` のアクションレスポンスの後に、1 つ以上のローダーを再検証する必要がある場合は、[`shouldRevalidate`][should-revalidate] 関数から `true` を返すことで、ルートごとに再検証を選択できます。アクションのステータスコードに基づいて判断する必要がある場合は、`unstable_actionStatus` パラメーターも使用できます。

再検証は、シングルフェッチの HTTP 呼び出しの `?_routes` クエリ文字列パラメーターを介して処理されます。これは、呼び出されるローダーを制限します。つまり、きめ細かい再検証を行っている場合は、リクエストされているルートに基づいてキャッシュの列挙が行われますが、すべての情報は URL に含まれているため、特別な CDN の設定は必要ありません（カスタムヘッダーを介して行われた場合、CDN が `Vary` ヘッダーを尊重する必要がある場合とは対照的に）。

### インラインスクリプト

`<RemixServer>` コンポーネントは、クライアント側でストリーミングデータを処理するインラインスクリプトをレンダリングします。[スクリプトのコンテンツセキュリティポリシー][csp] に [nonce ソース][csp-nonce] が設定されている場合は、`<RemixServer nonce>` を使用して、この nonce を `<script>` タグに渡すことができます。

[future-flags]: ../file-conventions/remix-config#future
[should-revalidate]: ../route/should-revalidate
[entry-server]: ../file-conventions/entry.server
[client-loader]: ../route/client-loader
[rfc]: https://github.com/remix-run/remix/discussions/7640
[turbo-stream]: https://github.com/jacob-ebey/turbo-stream
[rendertopipeablestream]: https://react.dev/reference/react-dom/server/renderToPipeableStream
[rendertoreadablestream]: https://react.dev/reference/react-dom/server/renderToReadableStream
[rendertostring]: https://react.dev/reference/react-dom/server/renderToString
[hydrateroot]: https://react.dev/reference/react-dom/client/hydrateRoot
[starttransition]: https://react.dev/reference/react/startTransition
[headers]: ../route/headers
[mdn-headers]: https://developer.mozilla.org/en-US/docs/Web/API/Headers
[resource-routes]: ../guides/resource-routes
[returning-response]: ../route/loader.md#returning-response-instances
[responsestub]: #headers
[streaming-format]: #streaming-data-format
[undici-polyfill]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#undici
[undici]: https://github.com/nodejs/undici
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
[csp-nonce]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources
[remix-utils]: https://github.com/sergiodxa/remix-utils
[merging-remix-and-rr]: https://remix.run/blog/merging-remix-and
