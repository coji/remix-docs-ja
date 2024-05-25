---
title: シングルフェッチ
---

# シングルフェッチ

Remix は、[`v2.9.0`][2.9.0] で [`future.unstable_singleFetch`][future-flags] フラグの背後に「シングルフェッチ」([RFC][rfc]) のサポートを導入しました。これにより、この動作を選択的に利用できます。これは、Remix v3 ではデフォルトになります。

## 概要

シングルフェッチを有効にすると、Remix はクライアント側の遷移時にサーバーに対して単一の HTTP 呼び出しを実行します。これに対し、従来は複数の HTTP 呼び出しを並行して実行していました（ローダーごとに 1 つ）。ローダーから `Response` インスタンスを返している場合（つまり、`json`/`defer`）、アプリコードを大幅に変更する必要はありません。しかし、以下に示す「破壊的」な変更点については、特にシリアライゼーションやステータス/ヘッダーの動作に関する変更点について理解しておく必要があります。

### 破壊的変更点

- シングルフェッチは、[`turbo-stream`][turbo-stream] を使用して、内部的に新しいストリーミング形式を使用します。これにより、JSON だけでなく、より複雑なデータをストリーミングできます。
- `loader` 関数と `action` 関数から返された裸のオブジェクトは、自動的に JSON `Response` に変換されなくなり、ワイヤーを介してそのままシリアライズされます。
- 型推論を最も正確にするには、次の 2 つの手順を実行する必要があります。
  - `tsconfig.json` の `compilerOptions.types` 配列の最後に、`@remix-run/react/future/single-fetch.d.ts` を追加します。
  - ルートで `unstable_defineLoader`/`unstable_defineAction` を使用し始めます。
    - これは段階的に行うことができます。現在の状態では、型推論はほとんど正確です。
- `action` の `4xx`/`5xx` `Response` の後の再検証は、オプトアウトではなく、オプトインになりました。
- シングルフェッチが有効になっている場合は、[`headers`][headers] 関数は使用されず、代わりに、`loader`/`action` 関数に渡される新しい `response` スタブが使用されます。
- 古い `installGlobals()` ポリフィルは、シングルフェッチでは機能しません。Node 20 のネイティブ `fetch` API を使用する、またはカスタムサーバーで `installGlobals({ nativeFetch: true })` を呼び出して、[Undici ベースのポリフィル][undici-polyfill] を取得する必要があります。

## 詳細

### ストリーミングデータ形式

以前、Remix は `JSON.stringify` を使用してローダー/アクションのデータをワイヤーを介してシリアライズしていました。そのため、`defer` 応答をサポートするために、カスタムのストリーミング形式を実装する必要がありました。

シングルフェッチでは、Remix は [`turbo-stream`][turbo-stream] を内部的に使用します。これにより、ストリーミングがファーストクラスでサポートされ、JSON よりも複雑なデータを自動的にシリアライズ/デシリアライズできます。次のデータ型は、`turbo-stream` を介して直接ストリーミングできます。`BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL` です。`Error` のサブタイプも、クライアントにグローバルに利用可能なコンストラクターが存在する限りサポートされます（`SyntaxError`、`TypeError` など）。

シングルフェッチを有効にしたときに、コードを変更する必要がない場合もあります。

- ✅ `loader`/`action` 関数から返される `json` 応答は、引き続き `JSON.stringify` を使用してシリアライズされます。そのため、`Date` を返すと、`useLoaderData`/`useActionData` から `string` が返されます。
- ⚠️ `defer` インスタンスまたは裸のオブジェクトを返している場合は、`turbo-stream` を使用してシリアライズされます。そのため、`Date` を返すと、`useLoaderData`/`useActionData` から `Date` が返されます。
  - 現在の動作を維持したい場合は（ストリーミング `defer` 応答を除く）、既存の裸のオブジェクトの戻り値を `json` でラップするだけです。

これは、ワイヤーを介して `Promise` インスタンスを送信するために、`defer` ユーティリティを使用する必要がなくなったことも意味します！裸のオブジェクトに `Promise` を含めて、`useLoaderData().whatever` で取得できます。必要に応じて `Promise` をネストすることもできますが、UX に影響する可能性があることに注意してください。

シングルフェッチを採用したら、アプリケーション全体で `json`/`defer` の使用を段階的に廃止し、生のオブジェクトを返すことをお勧めします。

### React レンダリング API

ドキュメントリクエストとデータリクエストの一貫性を維持するために、`turbo-stream` は、初期ドキュメントリクエストでデータを送り出すための形式としても使用されます。これは、シングルフェッチを選択すると、アプリケーションで [`renderToString`][rendertostring] を使用できなくなり、[`renderToPipeableStream`][rendertopipeablestream] または [`renderToReadableStream`][rendertoreadablestream] などの React ストリーミングレンダラー API を [`entry.server.tsx`][entry-server] で使用する必要があることを意味します。

これは、HTTP 応答をストリーミングする必要があるわけではありません。`renderToPipeableStream` の `onAllReady` オプション、または `renderToReadableStream` の `allReady` プロミスを利用して、ドキュメント全体を一度に送信することもできます。

クライアント側では、これは、ストリーミングされたデータが `Suspense` バウンダリでラップされて配信されるため、クライアント側の [`hydrateRoot`][hydrateroot] 呼び出しを [`startTransition`][starttransition] 呼び出しでラップする必要があることも意味します。

### ストリーミングタイムアウト

以前、Remix には `ABORT_TIMEOUT` の概念があり、これはデフォルトの [`entry.server.tsx`][entry-server] ファイルに組み込まれており、React レンダラーを終了していましたが、保留中の遅延プロミスをクリーンアップする特別なことは行いませんでした。

Remix が内部的にストリーミングするようになったため、`turbo-stream` の処理をキャンセルし、保留中のプロミスを自動的に拒否して、それらのエラーをクライアントにストリーミングできます。デフォルトでは、これは 4950 ミリ秒後に発生します。これは、ほとんどの `entry.server.tsx` ファイルの現在の 5000 ミリ秒の `ABORT_DELAY` よりもわずかに短い値です。これは、プロミスをキャンセルして、React 側を中止する前に、エラーを React レンダラーを介してストリーミングする必要があるためです。

`entry.server.tsx` から `streamTimeout` の数値をエクスポートすることで、これを制御できます。Remix は、この値をミリ秒単位で、`loader`/`action` の保留中のプロミスを拒否するまでの時間として使用します。この値は、React レンダラーを中止するまでのタイムアウトから切り離すことをお勧めします。また、React のタイムアウトを常に高い値に設定して、`streamTimeout` からの基礎となる拒否をストリーミングする時間を確保する必要があります。

```tsx filename=app/entry.server.tsx lines=[1-2,32-33]
// ハンドラー関数の保留中のすべてのプロミスを 5 秒後に拒否します
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

    // React レンダラーを 10 秒後に自動的にタイムアウトします
    setTimeout(abort, 10000);
  });
}
```

### 型推論

シングルフェッチがない場合、`loader` または `action` から返されたプレーンな JavaScript オブジェクトは、自動的に JSON 応答にシリアライズされます（`json` を介して返したかのように）。型推論は、これが当てはまると仮定し、裸のオブジェクトの戻り値を、JSON シリアライズされたかのように推論します。

シングルフェッチでは、裸のオブジェクトは直接ストリーミングされるため、シングルフェッチを選択すると、組み込みの型推論は正確ではなくなります。たとえば、`Date` は、クライアント側で文字列にシリアライズされると仮定します 😕。

シングルフェッチを使用するときに適切な型を取得できるように、`tsconfig.json` の `compilerOptions.types` 配列に含めることができる、型オーバーライドのセットが用意されています。これにより、型がシングルフェッチの動作に合わせて調整されます。

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

🚨 シングルフェッチの型は、`types` の他の Remix パッケージの後に配置してください。これにより、既存の型がオーバーライドされます。

#### ローダー/アクション定義ユーティリティ

シングルフェッチでローダーとアクションを定義するときに、型安全性を高めるために、新しい `unstable_defineLoader` と `unstable_defineAction` ユーティリティを使用できます。

```ts
import { unstable_defineLoader as defineLoader } from "@remix-run/node";

export const loader = defineLoader(({ request }) => {
  //                                  ^? Request
});
```

これにより、引数の型が得られます（`LoaderFunctionArgs` は非推奨になります）。また、シングルフェッチと互換性のある型を返していることを保証します。

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

シングルフェッチは、次の戻り値型をサポートしています。

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

`defineClientLoader`/`defineClientAction` のクライアント側の同等物もあります。これらは、`clientLoader`/`clientAction` から返されたデータはワイヤーを介してシリアライズする必要がないため、同じ戻り値の制限はありません。

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

<docs-info>これらのユーティリティは、主に `useLoaderData` とその同等物の型推論用です。`Response` を返し、Remix API（`useFetcher` など）で消費されないリソースルートがある場合は、通常の `loader`/`action` 定義を使用できます。これらのルートを `defineLoader`/`defineAction` を使用して変換すると、`turbo-stream` は `Response` インスタンスをシリアライズできないため、型エラーが発生します。</docs-info>

#### `useLoaderData`、`useActionData`、`useRouteLoaderData`、`useFetcher`

これらのメソッドは、コードの変更を必要としません。シングルフェッチの型を追加すると、ジェネリックが正しくデシリアライズされます。

```ts
export const loader = defineLoader(async () => {
  const data = await fetchSomeData();
  return {
    message: data.message, // <- string
    date: data.date, // <- Date
  };
});

export default function Component() {
  // ❌ シングルフェッチ以前は、型は `JSON.stringify` を使用してシリアライズされていました
  const data = useLoaderData<typeof loader>();
  //    ^? { message: string, date: string }

  // ✅ シングルフェッチでは、型は `turbo-stream` を使用してシリアライズされます
  const data = useLoaderData<typeof loader>();
  //    ^? { message: string, date: Date }
}
```

#### `useMatches`

`useMatches` では、特定の `match.data` で適切な型推論を得るために、手動でキャストしてローダーの型を指定する必要があります。シングルフェッチを使用する場合は、`UIMatch` 型を `UIMatch_SingleFetch` に置き換える必要があります。

```diff
  let matches = useMatches();
- let rootMatch = matches[0] as UIMatch<typeof loader>;
+ let rootMatch = matches[0] as UIMatch_SingleFetch<typeof loader>;
```

#### `meta` 関数

`meta` 関数にもジェネリックが必要です。これにより、現在のルートローダー型と祖先ルートローダー型が示され、`data` パラメータと `matches` パラメータが適切に型付けられます。シングルフェッチを使用する場合は、`MetaArgs` 型を `MetaArgs_SingleFetch` に置き換える必要があります。

```diff
  export function meta({
    data,
    matches,
- }: MetaArgs<typeof loader, { root: typeof rootLoader }>) {
+ }: MetaArgs_SingleFetch<typeof loader, { root: typeof rootLoader }>) {
    // ...
  }
```

### 再検証

以前、Remix は、アクションの送信結果に関係なく、常にすべてのアクティブなローダーを再検証していました。[`shouldRevalidate`][should-revalidate] を使用して、ルートごとに再検証をオプトアウトできました。

シングルフェッチでは、`action` が `4xx/5xx` ステータスコードの `Response` を返したり、スローしたりした場合、デフォルトではローダーは再検証されません。`action` が `4xx/5xx` 以外の応答を返したり、スローしたりした場合、再検証の動作は変更されません。ここでの理由は、ほとんどの場合、`4xx`/`5xx` 応答を返す場合、実際にはデータが変更されていないため、データを再読み込みする必要がないためです。

`4xx/5xx` アクション応答の後でもローダーを再検証したい場合は、[`shouldRevalidate`][should-revalidate] 関数から `true` を返すことで、ルートごとに再検証をオプトインできます。また、アクションのステータスコードに基づいて判断する必要がある場合は、関数に新しい `unstable_actionStatus` パラメータが渡されます。

再検証は、シングルフェッチ HTTP 呼び出しの `?_routes` クエリ文字列パラメータを使用して処理されます。これにより、呼び出されるローダーが制限されます。つまり、細かい再検証を行う場合は、要求されたルートに基づいてキャッシュの列挙が行われますが、すべての情報は URL に含まれているため、特別な CDN 構成は必要ありません（これは、カスタムヘッダーで行われた場合、CDN が `Vary` ヘッダーを尊重する必要があるためです）。

### ヘッダー

[`headers`][headers] 関数は、シングルフェッチが有効になっている場合は使用されません。
代わりに、`loader`/`action` 関数には、その実行に固有の変更可能な `ResponseStub` が渡されます。

- HTTP 応答のステータスを変更するには、`status` フィールドを直接設定します。
  - `response.status = 201`
- HTTP 応答のヘッダーを設定するには、標準の [`Headers`][mdn-headers] API を使用します。
  - `response.headers.set(name, value)`
  - `response.headers.append(name, value)`
  - `response.headers.delete(name)`

```ts
export const action = defineAction(
  async ({ request, response }) => {
    if (!loggedIn(request)) {
      response.status = 401;
      response.headers.append("Set-Cookie", "foo=bar");
      return { message: "Invalid Submission! " };
    }
    await addItemToDb(request);
    return null;
  }
);
```

これらの応答スタブをスローして、ローダーとアクションのフローを短絡させることもできます。

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

各 `loader`/`action` には、固有の `response` インスタンスが渡されます。そのため、他の `loader`/`action` 関数が設定した値を見ることはできません（これは、競合状態が発生する可能性があります）。結果の HTTP 応答のステータスとヘッダーは、次のように決定されます。

- ステータスコード
  - すべてのステータスコードが設定されていないか、値が 300 未満の場合、最も深いステータスコードが HTTP 応答に使用されます。
  - ステータスコードが 300 以上に設定されている場合、最も浅い 300 以上の値が HTTP 応答に使用されます。
- ヘッダー
  - Remix はヘッダー操作を追跡し、すべてのハンドラーが完了した後に、新しい `Headers` インスタンスでそれらを再生します。
  - これらは、アクションが最初に実行され（存在する場合）、ローダーが上から下に順番に再生されます。
  - 子ハンドラーの `headers.set` は、親ハンドラーの値を上書きします。
  - `headers.append` を使用すると、親ハンドラーと子ハンドラーの両方から同じヘッダーを設定できます。
  - `headers.delete` を使用すると、親ハンドラーによって設定された値を削除できますが、子ハンドラーによって設定された値は削除できません。

シングルフェッチは、裸のオブジェクトの戻り値をサポートしており、ステータス/ヘッダーを設定するために `Response` インスタンスを返す必要がなくなったため、`json`/`redirect`/`redirectDocument`/`defer` ユーティリティは、シングルフェッチを使用する場合は非推奨と見なされます。引き続き通常の `Response` インスタンスを返すことができます。これらのインスタンスは、`response` スタブと同じようにステータスコードを適用し、すべてのヘッダーを `headers.set` を使用して適用します（親の同じ名前のヘッダー値を上書きします）。ヘッダーを追加する必要がある場合は、`Response` インスタンスを返すことから、新しい `response` パラメータを使用するように切り替える必要があります。

### クライアントローダー

アプリに [`clientLoader`][client-loader] 関数を使用するルートがある場合、シングルフェッチの動作はわずかに変更されることに注意することが重要です。`clientLoader` は、サーバー `loader` 関数の呼び出しをオプトアウトする方法を提供することを目的としているため、シングルフェッチ呼び出しでそのサーバーローダーを実行することは正しくありません。しかし、すべてのローダーは並行して実行されるため、どの `clientLoader` が実際にサーバーデータを求めているかを知るまで、呼び出しを待つことはできません。

たとえば、次の `/a/b/c` ルートを考えてみます。

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

ユーザーが `/ -> /a/b/c` に移動した場合、`a` と `b` のサーバーローダーと、`c` の `clientLoader` を実行する必要があります。このローダーは最終的に（または最終的にではない可能性があります）独自のサーバー `loader` を呼び出します。`a`/`b` の `loader` をフェッチする必要があるときに、`c` のサーバー `loader` をシングルフェッチ呼び出しに含めることはできませんし、`c` が実際に `serverLoader` を呼び出す（または返す）まで遅らせることもできません（ウォーターフォールが発生するため）。

そのため、`clientLoader` をエクスポートしたルートは、シングルフェッチをオプトアウトし、`serverLoader` を呼び出すと、そのルートのサーバー `loader` を取得するために、単一のフェッチが実行されます。`clientLoader` をエクスポートしていないすべてのルートは、単一の HTTP リクエストでフェッチされます。

そのため、上記のルート設定では、`/ -> /a/b/c` への移動により、最初にルート `a` と `b` の単一のシングルフェッチ呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/a,routes/b
```

その後、`c` が `serverLoader` を呼び出すと、`c` のサーバーローダーのみを対象とした独自の呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/c
```

### リソースルート

シングルフェッチで使用される新しい [ストリーミング形式][streaming-format] のため、`loader` 関数と `action` 関数から返された生の JavaScript オブジェクトは、`json()` ユーティリティを使用して自動的に `Response` インスタンスに変換されなくなりました。代わりに、ナビゲーションデータの読み込みでは、他のローダーデータと組み合わされ、`turbo-stream` 応答でストリーミングされます。

これは、個別にヒットすることを目的としており、常に Remix API を介してヒットするとは限らない [リソースルート][resource-routes] には興味深いジレンマをもたらします。また、他の HTTP クライアント（`fetch`、`cURL` など）からアクセスすることもできます。

リソースルートが内部の Remix API で消費されることを目的としている場合、より複雑な構造（`Date` や `Promise` インスタンスなど）をストリーミングできるよう、`turbo-stream` エンコーディングを活用したいと考えます。しかし、外部からアクセスする場合、より簡単に消費できる JSON 構造を返すことを好むでしょう。そのため、v2 で生のオブジェクトを返した場合、その動作はあいまいになります。`turbo-stream` や `json()` を使用してシリアライズする必要がありますか？

Remix v2 では、後方互換性を容易にするために、シングルフェッチの `future` フラグの採用を容易にするために、これが Remix API からアクセスされているか、外部からアクセスされているかによって処理されます。将来の Remix では、生のオブジェクトを外部消費のためにストリーミングしたくない場合は、独自の JSON 応答を返す必要があります。

シングルフェッチが有効になっている場合の Remix v2 の動作は次のとおりです。

- `useFetcher` などの Remix API からアクセスする場合、生の JavaScript オブジェクトは、通常のローダーとアクションと同じように、`turbo-stream` 応答として返されます（これは、`useFetcher` がリクエストに `.data` サフィックスを追加するためです）。

- `fetch` や `cURL` などの外部ツールからアクセスする場合、v2 では後方互換性を維持するために、`json()` への自動変換が引き続き行われます。

  - Remix は、この状況が発生すると、非推奨の警告をログに記録します。
  - 適宜、影響を受けるリソースルートハンドラーに `json()` 呼び出しを追加できます。
  - これらの非推奨の警告に対処することで、最終的な Remix v3 へのアップグレードをスムーズに行うことができます。

  ```tsx filename=app/routes/resource.tsx bad
  export function loader() {
    return {
      message: "My externally-accessed resource route",
    };
  }
  ```

  ```tsx filename=app/routes/resource.tsx good
  import { json } from "@remix-run/react";

  export function loader() {
    return json({
      message: "My externally-accessed resource route",
    });
  }
  ```

注: 特定の `Response` インスタンスを返す必要がある外部アクセス可能なリソースルートには、`defineLoader`/`defineAction` を使用しないことをお勧めします。これらの場合は、`loader`/`LoaderFunctionArgs` を使用するのが最善です。

#### 応答スタブとリソースルート

上記のように、`headers` エクスポートは、`loader` 関数と `action` 関数に渡される新しい [`response` スタブ][responsestub] に非推奨になりました。これは、リソースルートではやや混乱する点がありますが、実際には `Response` を返すことができるため、「スタブ」の概念は実際には必要ありません。これは、複数のローダーの結果を単一の Response にマージする必要がないためです。

```tsx filename=routes/resource.tsx
// 独自の Response を使用するのが最も簡単な方法です
export async function loader() {
  const data = await getData();
  return json(data, {
    status: 200,
    headers: {
      "X-Custom": "whatever",
    },
  });
}
```

一貫性を保つために、リソースルートの `loader`/`action` 関数には引き続き `response` スタブが渡され、必要に応じて使用できます（非リソースルートハンドラー間でコードを共有する場合など）。

```tsx filename=routes/resource.tsx
// しかし、response スタブに値を設定することもできますstraightforward approach
export async function loader({
  response,
}: LoaderFunctionArgs) {
  const data = await getData();
  response?.status = 200;
  response?.headers.set("X-Custom", "whatever");
  return json(data);
}
```

`response` スタブ _と_ カスタムステータス/ヘッダーを備えた `Response` を返すことは避けるのが最善ですが、実際にそれを行う場合は、次のロジックが適用されます。

- `Response` インスタンスのステータスは、`response` スタブのステータスよりも優先されます。
- `response` スタブの `headers` のヘッダー操作は、返された `Response` ヘッダーインスタンスで再生されます。

### フェッチポリフィル

シングルフェッチでは、[`undici`][undici] を `fetch` ポリフィルとして使用する、または Node 20 以降で組み込みの `fetch` を使用する必要があります。これは、`@remix-run/web-fetch` ポリフィルにはない API に依存しているためです。詳細については、以下の 2.9.0 リリースノートの [Undici][undici-polyfill] セクションを参照してください。

- 独自のサーバーを管理して `installGlobals()` を呼び出している場合は、シングルフェッチを使用するときにランタイムエラーが発生しないように、`installGlobals({ nativeFetch: true })` を呼び出す必要があります。
- `remix-serve` を使用している場合は、シングルフェッチが有効になっていると、自動的に `undici` が使用されます。

### インラインスクリプト

`<RemixServer>` コンポーネントは、クライアント側のストリーミングデータを処理するインラインスクリプトをレンダリングします。[スクリプトのコンテンツセキュリティポリシー][csp] を [ノンスソース][csp-nonce] で使用している場合は、`<RemixServer nonce>` を使用して、ノンスをこれらの `<script>` タグに渡すことができます。

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
[mdn-headers]: https://developer.mozilla.org/en-US/docs/Web/API/Headers
[resource-routes]: ../guides/resource-routes
[responsestub]: #headers
[streaming-format]: #streaming-data-format
[undici-polyfill]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#undici
[undici]: https://github.com/nodejs/undici
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
[csp-nonce]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources
