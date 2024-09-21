---
title: シングルフェッチ
---

# シングルフェッチ

<docs-warning>これは不安定なAPIであり、今後も変更される可能性があります。本番環境では採用しないでください。</docs-warning>

シングルフェッチは、新しいデータ読み込み戦略とストリーミング形式です。シングルフェッチを有効にすると、Remixはクライアント側の遷移でサーバーに対して1回のHTTP呼び出しを行うようになり、複数のHTTP呼び出しを並行して行う（ローダーごとに1回）ことはなくなります。さらに、シングルフェッチでは、`loader`や`action`から`Date`、`Error`、`Promise`、`RegExp`など、ネイキッドオブジェクトを送信することもできます。

## 概要

Remixは、[`v2.9.0`][2.9.0]の[`future.unstable_singleFetch`][future-flags]フラグで、"シングルフェッチ"([RFC][rfc])のサポートを導入しました。これにより、この動作をオプトインできます。シングルフェッチは、[React Router v7][merging-remix-and-rr]ではデフォルトになります。

シングルフェッチを有効にすることは、初期段階では低労力で、その後、すべての破壊的変更を段階的に導入することができます。[シングルフェッチを有効にする][start]ために必要な最小限の変更を適用してから、[移行ガイド][migration-guide]を使用して、アプリケーションで段階的に変更を行い、[React Router v7][merging-remix-and-rr]へのスムーズな非破壊的なアップグレードを保証することができます。

また、[破壊的変更][breaking-changes]も確認してください。特に、シリアライゼーションやステータス/ヘッダーの動作に関する、いくつかの根本的な動作変更について理解しておく必要があります。

## シングルフェッチの有効化

**1. 未来のフラグを有効にする**

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

**2. 廃止された`fetch`ポリフィル**

シングルフェッチでは、`@remix-run/web-fetch`ポリフィルにはないAPIに依存しているため、[`undici`][undici]を`fetch`ポリフィルとして使用するか、Node 20+の組み込み`fetch`を使用する必要があります。詳細については、以下の2.9.0リリースノートの[Undici][undici-polyfill]セクションを参照してください。

- Node 20+を使用している場合は、`installGlobals()`への呼び出しを削除し、Nodeの組み込み`fetch`を使用します（これは`undici`と同じです）。

- 独自のサーバーを管理していて、`installGlobals()`を呼び出している場合は、`undici`を使用するために`installGlobals({ nativeFetch: true })`を呼び出す必要があります。

  ```diff
  - installGlobals();
  + installGlobals({ nativeFetch: true });
  ```

- `remix-serve`を使用している場合は、シングルフェッチが有効になっていると、自動的に`undici`が使用されます。

- `miniflare/cloudflare worker`をRemixプロジェクトで使用している場合は、[互換性フラグ][compatibility-flag]が`2023-03-01`以降に設定されていることを確認してください。

**3. `headers`の実装を調整する（必要に応じて）**

シングルフェッチを有効にすると、クライアント側のナビゲーションでは、複数のローダーを実行する場合でも、1つのリクエストしか行われなくなります。呼び出されるハンドラーのヘッダーをマージするために、[`headers`][headers]エクスポートは、`loader`/`action`のデータリクエストにも適用されるようになりました。多くの場合、すでにドキュメントリクエストに対して存在しているロジックは、新しいシングルフェッチのデータリクエストにほぼ十分なはずです。

**4. `<RemixServer>`に`nonce`を追加する（CSPを使用している場合）**

`<RemixServer>`コンポーネントは、クライアント側でストリーミングデータを処理するインラインスクリプトをレンダリングします。[スクリプトのコンテンツセキュリティポリシー][csp]に[nonceソース][csp-nonce]が含まれている場合は、`<RemixServer nonce>`を使用して、nonceをこれらの`<script>`タグに渡すことができます。

**5. `renderToString`を置き換える（使用している場合）**

ほとんどのRemixアプリでは、`renderToString`は使用されていないと思いますが、`entry.server.tsx`で使用するように選択している場合は、読み進めてください。そうでない場合は、この手順をスキップすることができます。

ドキュメントリクエストとデータリクエストの整合性を維持するために、`turbo-stream`も初期ドキュメントリクエストでのデータ送信形式として使用されます。つまり、シングルフェッチをオプトインすると、アプリケーションは[`renderToString`][rendertostring]を使用できなくなり、[`entry.server.tsx`][entry-server]で[`renderToPipeableStream`][rendertopipeablestream]や[`renderToReadableStream`][rendertoreadablestream]などのReactストリーミングレンダラーAPIを使用する必要があります。

これは、HTTPレスポンスをストリーミングする必要があるという意味ではありません。`renderToPipeableStream`の`onAllReady`オプション、または`renderToReadableStream`の`allReady`プロミスを活用することで、依然として一度に完全なドキュメントを送信することができます。

クライアント側では、ストリーミングされたデータが`Suspense`境界内にラップされてくるため、クライアント側の[`hydrateRoot`][hydrateroot]呼び出しを[`startTransition`][starttransition]呼び出しでラップする必要があります。

## 破壊的変更

シングルフェッチでは、いくつかの破壊的変更が導入されました。これらの変更の一部は、フラグを有効にしたときにすぐに対応する必要があるものですが、一部はフラグを有効にした後に段階的に対応することができます。次のメジャーバージョンにアップグレードする前に、すべての変更に対応していることを確認する必要があります。

**すぐに対応する必要がある変更:**

- **廃止された`fetch`ポリフィル**: 古い`installGlobals()`ポリフィルはシングルフェッチでは機能しません。[undiciベースのポリフィル][undici-polyfill]を取得するには、ネイティブのNode 20の`fetch`APIを使用するか、カスタムサーバーで`installGlobals({ nativeFetch: true })`を呼び出す必要があります。
- **`headers`エクスポートがデータリクエストに適用される**: [`headers`][headers]関数は、ドキュメントリクエストとデータリクエストの両方に適用されるようになりました。

**段階的に対応する必要がある変更:**

- **[新しいストリーミングデータ形式][streaming-format]**: シングルフェッチでは、[`turbo-stream`][turbo-stream]を使用して、新しいストリーミング形式が内部的に使用されます。そのため、JSONよりも複雑なデータをストリーミングすることができます。
- **自動シリアライゼーションなし**: `loader`および`action`関数から返されるネイキッドオブジェクトは、もはや自動的にJSON `Response`に変換されず、そのままワイヤー経由でシリアライズされます。
- **型推論の更新**: 型推論を最も正確にするには、次の2つのことを行う必要があります。
  - `tsconfig.json`の`compilerOptions.types`配列の最後に`@remix-run/react/future/single-fetch.d.ts`を追加する
  - ルートで`unstable_defineLoader`/`unstable_defineAction`を使用する
    - これは段階的に行うことができます。現在の状態では、ほぼ正確な型推論を行うことができます。
- [**デフォルトの再検証動作がGETナビゲーションでのオプトアウトに変更される**][revalidation]: 通常のナビゲーションにおけるデフォルトの再検証動作は、オプトインからオプトアウトに変更され、サーバーのローダーはデフォルトで再実行されます。
- [**`action`の再検証をオプトインにする**][action-revalidation]: `action`の`4xx`/`5xx` `Response`の後の再検証は、オプトアウトではなく、オプトインになります。

## シングルフェッチを使用した新しいルートの追加

シングルフェッチを有効にすると、より強力なストリーミング形式を活用するルートを作成することができます。

<docs-info>適切な型推論を行うには、まず`tsconfig.json`の`compilerOptions.types`配列の最後に`@remix-run/react/future/single-fetch.d.ts`を追加する必要があります。詳細については、[型推論セクション][type-inference-section]を参照してください。</docs-info>

シングルフェッチでは、ローダーから次のデータ型を返すことができます。`BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL`。

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

ローダーから`Response`インスタンス（つまり、`json`/`defer`）を返している場合は、シングルフェッチを利用するためにアプリケーションコードを大幅に変更する必要はありません。

ただし、将来[React Router v7][merging-remix-and-rr]にアップグレードする準備として、ルートごとに次の変更を段階的に行うことをお勧めします。これは、ヘッダーとデータ型の更新が問題を引き起こさないかどうかを検証する最も簡単な方法です。

### 型推論

シングルフェッチを使用しないと、`loader`または`action`から返されるプレーンなJavascriptオブジェクトは、自動的にJSONレスポンスにシリアライズされます（`json`を介して返したときと同じです）。型推論では、これが行われると仮定しており、ネイキッドオブジェクトの返却をJSONシリアライズされたものとして推論します。

シングルフェッチでは、ネイキッドオブジェクトは直接ストリーミングされるため、シングルフェッチをオプトインすると、組み込みの型推論はもはや正確ではなくなります。たとえば、`Date`はクライアント側で文字列にシリアライズされると仮定します😕。

#### シングルフェッチの型を有効にする

シングルフェッチの型に切り替えるには、`unstable_singleFetch: true`を使用してRemixの`Future`インターフェースを[拡張する][augment]必要があります。
これは、`tsconfig.json` > `include`でカバーされているすべてのファイルで行うことができます。
Remixプラグインの`future.unstable_singleFetch`未来のフラグと共存させるために、`vite.config.ts`で行うことをお勧めします。

```ts
declare module "@remix-run/server-runtime" {
  interface Future {
    unstable_singleFetch: true;
  }
}
```

これで、`useLoaderData`、`useActionData`、および`typeof loader`ジェネリックを使用する他のユーティリティは、シングルフェッチの型を使用するようになります。

```ts
import { useLoaderData } from "@remix-run/react";

export function loader() {
  return {
    planet: "world",
    date: new Date(),
  };
}

export default function Component() {
  const data = useLoaderData<typeof loader>();
  //    ^? { planet: string, date: Date }
}
```

#### 関数とクラスインスタンス

一般的に、関数はネットワーク経由で確実に送信することはできないため、`undefined`としてシリアライズされます。

```ts
import { useLoaderData } from "@remix-run/react";

export function loader() {
  return {
    planet: "world",
    date: new Date(),
    notSoRandom: () => 7,
  };
}

export default function Component() {
  const data = useLoaderData<typeof loader>();
  //    ^? { planet: string, date: Date, notSoRandom: undefined }
}
```

メソッドもシリアライズできないため、クラスインスタンスはシリアライズ可能なプロパティだけに絞られます。

```ts
import { useLoaderData } from "@remix-run/react";

class Dog {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  bark() {
    console.log("woof");
  }
}

export function loader() {
  return {
    planet: "world",
    date: new Date(),
    spot: new Dog("Spot", 3),
  };
}

export default function Component() {
  const data = useLoaderData<typeof loader>();
  //    ^? { planet: string, date: Date, spot: { name: string, age: number, bark: undefined } }
}
```

#### `clientLoader`と`clientAction`

<docs-warning>`clientLoader`の引数と`clientAction`の引数の型を必ず含めてください。これが、クライアントデータ関数を検出する方法です。</docs-warning>

クライアント側のローダーとアクションからのデータは、シリアライズされないため、これらの型は保持されます。

```ts
import {
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";

class Dog {
  /* ... */
}

// 引数の型を必ず注釈してください! 👇
export function clientLoader(_: ClientLoaderFunctionArgs) {
  return {
    planet: "world",
    date: new Date(),
    notSoRandom: () => 7,
    spot: new Dog("Spot", 3),
  };
}

export default function Component() {
  const data = useLoaderData<typeof clientLoader>();
  //    ^? { planet: string, date: Date, notSoRandom: () => number, spot: Dog }
}
```

### ヘッダー

[`headers`][headers]関数は、シングルフェッチが有効になっている場合、ドキュメントリクエストとデータリクエストの両方で使用されます。この関数を使用して、並行して実行されるローダーから返されたヘッダーをマージするか、指定された`actionHeaders`を返すことができます。

### 返されるレスポンス

シングルフェッチでは、`Response`インスタンスを返す必要がなくなり、ネイキッドオブジェクトを直接返すことでデータ返すことができます。そのため、`json`/`defer`ユーティリティは、シングルフェッチを使用する場合は廃止とみなされます。これらのユーティリティは、v2の期間中は残るため、すぐに削除する必要はありません。これらのユーティリティは、次のメジャーバージョンで削除される可能性が高いため、段階的に削除することをお勧めします。

v2では、通常の`Response`インスタンスを返し続け、`status`/`headers`はドキュメントリクエストの場合と同じように機能し（`headers()`関数を使用してヘッダーをマージします）、有効になります。

時間とともに、ローダーとアクションから返される`Response`を段階的に排除していく必要があります。

- `loader`/`action`が`status`/`headers`を設定せずに`json`/`defer`を返していた場合は、`json`/`defer`への呼び出しを削除し、データを直接返すことができます。
- `loader`/`action`が`json`/`defer`を使用してカスタムの`status`/`headers`を返していた場合は、新しい[`unstable_data()`][data-utility]ユーティリティを使用するように変更する必要があります。

### クライアントローダー

アプリケーションに[`clientLoader`][client-loader]関数を使用するルートがある場合は、シングルフェッチの動作が若干変更されることに注意することが重要です。`clientLoader`は、サーバーの`loader`関数を呼び出さないようにするための方法を提供することを意図しているため、シングルフェッチの呼び出しがサーバーのローダーを実行するのは正しくありません。しかし、すべてのローダーは並行して実行され、どの`clientLoader`が実際にサーバーのデータを要求しているかを知らなければ、呼び出しを遅らせることもできません。

たとえば、次の`/a/b/c`ルートを考えてみましょう。

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

ユーザーが`/ -> /a/b/c`に移動した場合、`a`と`b`のサーバーローダーと、`c`の`clientLoader`を実行する必要があります。これは、最終的に（またはしない可能性もあります）独自のサーバーの`loader`を呼び出します。`a`/`b`の`loader`を取得する際に、`c`のサーバー`loader`をシングルフェッチ呼び出しに含めるべきかどうかは判断できませんし、`c`が実際に`serverLoader`呼び出しを実行する（または返される）まで遅らせることはできません。これは、ウォーターフォールを導入することなくです。

そのため、シングルフェッチからオプトアウトする`clientLoader`をエクスポートすると、`serverLoader`を呼び出すと、そのルートのサーバー`loader`のみを取得するためのシングルフェッチが行われます。`clientLoader`をエクスポートしないすべてのルートは、1つのHTTPリクエストでフェッチされます。

そのため、上記のルート設定では、`/ -> /a/b/c`へのナビゲーションは、`a`と`b`のルートのシングルフェッチ呼び出しを1回行うことになります。

```
GET /a/b/c.data?_routes=routes/a,routes/b
```

そして、`c`が`serverLoader`を呼び出すと、`c`のサーバー`loader`のみの呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/c
```

### リソースルート

シングルフェッチで使用されている新しい[ストリーミング形式][streaming-format]のため、`loader`と`action`関数から返される生のJavascriptオブジェクトは、もはや`json()`ユーティリティを介して自動的に`Response`インスタンスに変換されなくなりました。代わりに、ナビゲーションデータの読み込みでは、他のローダーデータと結合され、`turbo-stream`レスポンスでストリーミングダウンされます。

これは、個別にヒットするように意図されている[リソースルート][resource-routes]にとって興味深いジレンマを生み出します。これは、常にRemix APIを介してアクセスされるわけではないためです。他のHTTPクライアント（`fetch`、`cURL`など）からアクセスすることもできます。

リソースルートが内部のRemix APIでの使用を意図している場合、`Date`や`Promise`インスタンスなどのより複雑な構造をストリーミングダウンできるように、`turbo-stream`エンコーディングを活用したいと考えます。しかし、外部からアクセスされた場合、より簡単に消費できるJSON構造を返すことを好むかもしれません。したがって、v2で生のオブジェクトを返す場合、動作は少し曖昧です。`turbo-stream`または`json()`を介してシリアライズするべきでしょうか？

後方互換性を維持し、シングルフェッチの未来のフラグの採用を容易にするため、Remix v2では、Remix APIからアクセスされたか、外部からアクセスされたかに基づいて、これを処理します。将来のRemixでは、外部からアクセスされた場合に生のオブジェクトをストリーミングダウンしたくない場合は、独自の[JSONレスポンス][returning-response]を返す必要があります。

シングルフェッチを有効にした場合のRemix v2の動作は次のとおりです。

- `useFetcher`などのRemix APIからアクセスした場合、生のJavascriptオブジェクトは、通常のローダーとアクションと同様に、`turbo-stream`レスポンスとして返されます（これは、`useFetcher`がリクエストに`.data`サフィックスを追加するためです）。

- `fetch`や`cURL`などの外部ツールからアクセスした場合、v2では後方互換性を維持するために、`json()`への自動変換を続行します。

  - このような状況が発生すると、Remixは非推奨の警告をログに出力します。
  - 必要に応じて、影響を受けるリソースルートハンドラーを更新して、`Response`オブジェクトを返すことができます。
  - これらの非推奨の警告に対処することで、最終的なRemix v3へのアップグレードをスムーズに行うことができます。

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

注: 特定の`Response`インスタンスを返す必要がある、外部からアクセス可能なリソースルートでは、`defineLoader`/`defineAction`を使用することはお勧めしません。これらの場合、`loader`/`LoaderFunctionArgs`を使用することをお勧めします。

## 詳細情報

### ストリーミングデータ形式

以前は、Remixは`JSON.stringify`を使用してローダー/アクションのデータをワイヤー経由でシリアライズし、`defer`レスポンスをサポートするためにカスタムのストリーミング形式を実装する必要がありました。

シングルフェッチでは、Remixは内部的に[`turbo-stream`][turbo-stream]を使用するようになりました。これにより、ストリーミングがファーストクラスでサポートされ、JSONよりも複雑なデータを自動的にシリアライズ/デシリアライズすることができます。`BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL`などのデータ型は、`turbo-stream`を介して直接ストリーミングダウンすることができます。クライアント側でグローバルに利用可能なコンストラクターを持つ`Error`のサブタイプもサポートされています（`SyntaxError`、`TypeError`など）。

シングルフェッチを有効にすると、コードをすぐに変更する必要がある場合もあれば、必要ない場合もあります。

- ✅ `loader`/`action`関数から返される`json`レスポンスは、引き続き`JSON.stringify`を使用してシリアライズされるため、`Date`を返した場合、`useLoaderData`/`useActionData`からは`string`を受け取ります。
- ⚠️ `defer`インスタンスまたはネイキッドオブジェクトを返している場合は、`turbo-stream`を介してシリアライズされるため、`Date`を返した場合、`useLoaderData`/`useActionData`からは`Date`を受け取ります。
  - 現在の動作（`defer`レスポンスのストリーミングを除く）を維持したい場合は、既存のネイキッドオブジェクトの返却を`json`でラップすればよいだけです。

これは、`Promise`インスタンスをワイヤー経由で送信するために`defer`ユーティリティを使用する必要がなくなったことを意味します！ネイキッドオブジェクトのどこにでも`Promise`を含めることができ、`useLoaderData().whatever`でそれを取得することができます。必要に応じて`Promise`をネストすることもできます。ただし、UXへの潜在的な影響に注意してください。

シングルフェッチを採用したら、`json`/`defer`の使用を段階的に排除し、生のオブジェクトを返すようにすることをお勧めします。

### ストリーミングタイムアウト

以前は、Remixには、デフォルトの[`entry.server.tsx`][entry-server]ファイルに組み込まれた`ABORT_TIMEOUT`という概念があり、Reactレンダラーを終了していましたが、保留中のDeferred Promiseをクリーンアップする特定の処理は行っていませんでした。

現在、Remixは内部的にストリーミングを行っているため、`turbo-stream`処理をキャンセルし、保留中のPromiseを自動的に拒否し、そのエラーをクライアントにストリーミングすることができます。デフォルトでは、これは4950ms後に発生します。これは、現在のほとんどの`entry.server.tsx`ファイルの`ABORT_DELAY`である5000msよりわずかに小さい値です。これは、Reactの側でアボートする前に、Promiseをキャンセルし、Reactレンダラーを介して拒否をストリーミングダウンする必要があるためです。

この値は、`entry.server.tsx`から数値の`streamTimeout`をエクスポートすることで制御できます。Remixはこの値を、`loader`/`action`からの保留中のPromiseを拒否するまでのミリ秒数として使用します。この値は、Reactレンダラーをアボートするまでのタイムアウトとは切り離すことをお勧めします。また、常にReactのタイムアウトをより大きな値に設定して、`streamTimeout`からの基礎となる拒否をストリーミングダウンする時間を与えるようにしてください。

```tsx filename=app/entry.server.tsx lines=[1-2,32-33]
// ハンドラー関数の保留中のすべてのPromiseを5秒後に拒否する
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

    // Reactレンダラーを10秒後に自動的にタイムアウトする
    setTimeout(abort, 10000);
  });
}
```

### 再検証

#### 通常のナビゲーションの動作

よりシンプルなメンタルモデルとドキュメントリクエストとデータリクエストの整合性に加えて、シングルフェッチのもう1つの利点は、よりシンプルで（おそらく）より良いキャッシュ動作です。一般的に、シングルフェッチは、以前の複数のフェッチの動作と比較して、より少ないHTTPリクエストを行い、より頻繁にキャッシュ結果を保存します。

キャッシュの断片化を減らすため、シングルフェッチではGETナビゲーションにおけるデフォルトの再検証動作が変更されます。以前は、Remixは、`shouldRevalidate`でオプトインしない限り、再利用された祖先ルートのローダーを再実行しませんでした。現在、Remixは、`GET /a/b/c.data`のようなシングルフェッチリクエストの単純なケースでは、デフォルトで再実行します。`shouldRevalidate`または`clientLoader`関数が存在しない場合、これがアプリケーションの動作になります。

アクティブなルートのいずれかに`shouldRevalidate`または`clientLoader`を追加すると、実行するルートのサブセットを指定する`_routes`パラメーターを含む、粒度の細かいシングルフェッチ呼び出しがトリガーされます。

`clientLoader`が内部的に`serverLoader()`を呼び出すと、その特定のルートの個別のHTTP呼び出しがトリガーされます。これは、以前の動作と同じです。

たとえば、`/a/b`にいて`/a/b/c`に移動した場合、次のようになります。

- `shouldRevalidate`または`clientLoader`関数が存在しない場合: `GET /a/b/c.data`
- すべてのルートにローダーがあるが、`routes/a`が`shouldRevalidate`を介してオプトアウトしている場合:
  - `GET /a/b/c.data?_routes=root,routes/b,routes/c`
- すべてのルートにローダーがあるが、`routes/b`に`clientLoader`がある場合:
  - `GET /a/b/c.data?_routes=root,routes/a,routes/c`
  - さらに、Bの`clientLoader`が`serverLoader()`を呼び出すと:
    - `GET /a/b/c.data?_routes=routes/b`

この新しい動作がアプリケーションに適していない場合は、親ルートに`shouldRevalidate`を追加し、`false`を返すことで、再検証しないという以前の動作をオプトインすることができます。

別のオプションは、高価な親ローダーの計算に対してサーバー側のキャッシュを活用することです。

#### サブミット再検証の動作

以前は、Remixは、アクションがどのような結果を返したかに関係なく、_すべて_のアクションのサブミット後に、アクティブなすべてのローダーを再検証していました。[`shouldRevalidate`][should-revalidate]を介して、ルートごとに再検証をオプトアウトすることができました。

シングルフェッチでは、`action`が`4xx/5xx`ステータスコードを持つ`Response`を返したり、スローしたりした場合、Remixはデフォルトで_ローダーを再検証しません_。`action`が`4xx/5xx`以外の`Response`を返したり、スローしたりした場合、再検証の動作は変わりません。これは、ほとんどの場合、`4xx`/`5xx`の`Response`を返す場合、実際にはデータを変更していないため、データを再読み込みする必要がないからです。

`4xx/5xx`アクションレスポンスの後にローダーを再検証したい場合は、[`shouldRevalidate`][should-revalidate]関数から`true`を返すことで、ルートごとに再検証をオプトインすることができます。`actionStatus`という新しいパラメーターも関数に渡されます。これは、アクションのステータスコードに基づいて判断する必要がある場合に使用できます。

再検証は、シングルフェッチHTTP呼び出しで`?_routes`クエリ文字列パラメーターを介して処理されます。これにより、呼び出されるローダーが制限されます。つまり、粒度の細かい再検証を行っている場合、リクエストされているルートに基づいてキャッシュの列挙が行われますが、すべての情報はURLにあるため、特別なCDNの設定は必要ありません（これは、CDNが`Vary`ヘッダーを尊重する必要があるカスタムヘッダーを介して行われる場合とは異なります）。

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
[breaking-changes]: #破壊的変更
[revalidation]: #通常のナビゲーションの動作
[action-revalidation]: #サブミット再検証の動作
[start]: #シングルフェッチの有効化
[type-inference-section]: #型推論
[compatibility-flag]: https://developers.cloudflare.com/workers/configuration/compatibility-dates
[data-utility]: ../utils/data
[augment]: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation



