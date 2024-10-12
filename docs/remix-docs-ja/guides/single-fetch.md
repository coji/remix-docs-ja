---
title: シングルフェッチ
---

# シングルフェッチ

シングルフェッチは、新しいデータローディング戦略とストリーミング形式です。シングルフェッチを有効にすると、Remixはクライアント側遷移でサーバーに対して1回のHTTP呼び出しのみを行います。以前は、ローダーごとに複数のHTTP呼び出しが並行して行われていました。さらに、シングルフェッチでは、`loader`と`action`から`Date`、`Error`、`Promise`、`RegExp`など、生のオブジェクトを送信することもできます。

## 概要

Remixは、`v2.9.0`（後に`v2.13.0`で`future.v3_singleFetch`として安定化）の[`future.unstable_singleFetch`][future-flags]フラグの背後にある"シングルフェッチ"（[RFC][rfc]）のサポートを導入しました。これにより、この動作を選択できます。シングルフェッチは、[React Router v7][merging-remix-and-rr]でデフォルトになります。

シングルフェッチを有効にすることは、事前に労力が少なく、その後、すべての破壊的変更を徐々に採用できます。[シングルフェッチを有効にする][start]ために必要な最小限の変更を適用してから、[移行ガイド][migration-guide]を使用してアプリケーションの増分変更を行い、[React Router v7][merging-remix-and-rr]へのスムーズな、非破壊的なアップグレードを確保できます。

また、[破壊的変更][breaking-changes]も確認して、特にシリアル化とステータス/ヘッダーの動作に関する基礎となる動作変更について理解しておきましょう。

## シングルフェッチの有効化

**1. futureフラグを有効にする**

```ts filename=vite.config.ts lines=[6]
export default defineConfig({
  plugins: [
    remix({
      future: {
        // ...
        v3_singleFetch: true,
      },
    }),
    // ...
  ],
});
```

**2. `fetch`ポリフィルの廃止**

シングルフェッチでは、`@remix-run/web-fetch`ポリフィルにはないAPIに依存するため、`fetch`ポリフィルとして[`undici`][undici]を使用するか、Node 20+の組み込み`fetch`を使用する必要があります。詳細については、以下の2.9.0リリースノートの[Undici][undici-polyfill]セクションを参照してください。

- Node 20+を使用している場合は、`installGlobals()`への呼び出しをすべて削除し、Nodeの組み込み`fetch`を使用してください（これは`undici`と同じです）。

- 独自のサーバーを管理していて`installGlobals()`を呼び出している場合は、`undici`を使用するために`installGlobals({ nativeFetch: true })`を呼び出す必要があります。

  ```diff
  - installGlobals();
  + installGlobals({ nativeFetch: true });
  ```

- `remix-serve`を使用している場合は、シングルフェッチが有効になっていると自動的に`undici`を使用します。

- miniflare/cloudflare workerでremixプロジェクトを使用している場合は、[互換性フラグ][compatibility-flag]が`2023-03-01`以降に設定されていることを確認してください。

**3. `headers`の実装を調整する（必要に応じて）**

シングルフェッチが有効になっていると、クライアント側ナビゲーションでは、複数のローダーを実行する場合でも、1回の要求のみが行われます。呼び出されるハンドラーのヘッダーのマージを処理するために、[`headers`][headers]エクスポートは、`loader`/`action`のデータ要求にも適用されるようになりました。多くの場合、ドキュメント要求にすでに存在するロジックは、新しいシングルフェッチデータ要求にほぼ十分です。

**4. `<RemixServer>`に`nonce`を追加する（CSPを使用している場合）**

`<RemixServer>`コンポーネントは、クライアント側でストリーミングデータを処理するインラインスクリプトをレンダリングします。[スクリプトのコンテンツセキュリティポリシー][csp]が[nonce-sources][csp-nonce]を使用している場合は、`<RemixServer nonce>`を使用してnonceをこれらの`<script>`タグに渡すことができます。

**5. `renderToString`を置き換える（使用している場合）**

ほとんどのRemixアプリでは、`renderToString`を使用している可能性は低いですが、`entry.server.tsx`で使用するように選択した場合、読み続けてください。そうでない場合は、この手順をスキップできます。

ドキュメント要求とデータ要求の間の一貫性を維持するために、`turbo-stream`は、初期ドキュメント要求でのデータの送信にも使用される形式です。つまり、シングルフェッチを選択すると、アプリケーションでは[`renderToString`][rendertostring]を使用できなくなり、[`entry.server.tsx`][entry-server]で[`renderToPipeableStream`][rendertopipeablestream]または[`renderToReadableStream`][rendertoreadablestream])などのReactストリーミングレンダラーAPIを使用する必要があります。

これは、HTTPレスポンスをストリーミングする必要があるという意味ではありません。`renderToPipeableStream`の`onAllReady`オプションまたは`renderToReadableStream`の`allReady`プロミスを利用することで、引き続きドキュメント全体を一度に送信できます。

クライアント側では、ストリーミングされたデータは`Suspense`境界でラップされて配信されるため、クライアント側の[`hydrateRoot`][hydrateroot]呼び出しを[`startTransition`][starttransition]呼び出しでラップする必要があります。

## 破壊的変更

シングルフェッチでは、いくつかの破壊的変更が導入されています。その中には、フラグを有効にしたときにすぐに処理する必要があるものと、フラグを有効にした後に段階的に処理できるものがあります。次のメジャーバージョンにアップグレードする前に、これらの変更がすべて処理されていることを確認する必要があります。

**事前に処理する必要がある変更：**

- **`fetch`ポリフィルの廃止**: 古い`installGlobals()`ポリフィルはシングルフェッチでは機能しません。[undiciベースのポリフィル][undici-polyfill]を取得するには、ネイティブのNode 20 `fetch` APIを使用するか、カスタムサーバーで`installGlobals({ nativeFetch: true })`を呼び出す必要があります。
- **`headers`エクスポートがデータ要求に適用される**: [`headers`][headers]関数は、ドキュメント要求とデータ要求の両方に適用されるようになりました。

**処理が必要になる可能性のある、認識しておく必要がある変更：**

- **[新しいストリーミングデータ形式][streaming-format]**: シングルフェッチは、[`turbo-stream`][turbo-stream]を介して新しいストリーミング形式を内部で使用しています。これは、JSONよりも複雑なデータをストリーミングできるようになったことを意味します。
- **自動シリアル化なし**: `loader`と`action`関数が返す生のオブジェクトは、もはや自動的にJSON `Response`に変換されず、ワイヤー上でそのままシリアル化されます。
- [**型推論の更新**][type-inference-section]: 最も正確な型推論を得るには、`unstable_singleFetch: true`を使用してRemixの`Future`インターフェースを[拡張][augment]する必要があります。
- [**GETナビゲーションでのデフォルトの再検証動作がオプトアウトに変更される**][revalidation]: 通常のナビゲーションでのデフォルトの再検証動作は、オプトインからオプトアウトに変更され、サーバーのローダーはデフォルトで再実行されます。
- [**`action`の再検証をオプトインにする**][action-revalidation]: `action`の`4xx`/`5xx` `Response`後の再検証は、オプトアウトではなく、オプトインになりました。

## シングルフェッチを使用した新しいルートの追加

シングルフェッチが有効になっていると、より強力なストリーミング形式を利用したルートを作成できます。

<docs-info>適切な型推論を得るには、`unstable_singleFetch: true`を使用してRemixの`Future`インターフェースを[拡張][augment]する必要があります。詳細については、[型推論セクション][type-inference-section]を参照してください。</docs-info>

シングルフェッチでは、`BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL`などのデータ型をローダーから返すことができます。

```tsx
// routes/blog.$slug.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { slug } = params;

  const comments = fetchComments(slug);
  const blogData = await fetchBlogData(slug);

  return {
    content: blogData.content, // <- string
    published: blogData.date, // <- Date
    comments, // <- Promise
  };
}

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

現在、ローダーから`Response`インスタンス（つまり、`json`/`defer`）を返している場合は、シングルフェッチを利用するためにアプリコードを変更する必要はありません。

ただし、将来の[React Router v7][merging-remix-and-rr]へのアップグレードをより適切に準備するために、ルートごとに以下の変更を始めることをお勧めします。これは、ヘッダーとデータ型を更新しても何も壊れないことを検証する最も簡単な方法です。

### 型推論

シングルフェッチを使用していない場合は、`loader`または`action`から返されたプレーンなJavaScriptオブジェクトは、自動的にJSONレスポンスにシリアル化されます（`json`で返された場合と同様）。型推論はこれが事実であると想定し、生のオブジェクトの返値を、JSONシリアル化されたものとして推論します。

シングルフェッチでは、生のオブジェクトは直接ストリーミングされるため、シングルフェッチを選択すると、組み込みの型推論はもはや正確ではありません。たとえば、`Date`はクライアントで文字列にシリアル化されると想定されます😕。

#### シングルフェッチ型の有効化

シングルフェッチ型に切り替えるには、`v3_singleFetch: true`を使用してRemixの`Future`インターフェースを[拡張][augment]する必要があります。
これは、`tsconfig.json` > `include`でカバーされている任意のファイルで行うことができます。
Remixプラグインの`future.v3_singleFetch` futureフラグと共存させるために、`vite.config.ts`で行うことをお勧めします。

```ts
declare module "@remix-run/server-runtime" {
  // またはcloudflare、denoなど
  interface Future {
    v3_singleFetch: true;
  }
}
```

これで、`useLoaderData`、`useActionData`、および`typeof loader`ジェネリックを使用するその他のユーティリティは、シングルフェッチ型を使用するようになりました。

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

#### 関数とクラスのインスタンス

一般的に、関数はネットワークを介して確実に送信できないため、`undefined`としてシリアル化されます。

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

メソッドもシリアル化できないため、クラスのインスタンスはシリアル化可能なプロパティのみに絞られます。

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

<docs-warning>`clientLoader`引数と`clientAction`引数の型を含めることを確認してください。これは、型がクライアントデータ関数を検出する方法です。</docs-warning>

クライアント側のローダーとアクションからのデータは決してシリアル化されないため、それらの型は保持されます。

```ts
import {
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";

class Dog {
  /* ... */
}

// 引数の型を注釈することを確認してください！ 👇
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

[`headers`][headers]関数は、シングルフェッチが有効になっている場合、ドキュメント要求とデータ要求の両方で使用されるようになりました。この関数を使用して、並行して実行されるローダーから返されたヘッダーをマージするか、特定の`actionHeaders`を返してください。

### 返されるレスポンス

シングルフェッチでは、`Response`インスタンスを返す必要がなくなり、生のオブジェクトの返値を介してデータを直接返すことができます。そのため、シングルフェッチを使用する場合は、`json`/`defer`ユーティリティは廃止されたと見なしてください。これらは、v2の間は残っているため、すぐに削除する必要はありません。これらは、次のメジャーバージョンで削除される可能性が高いため、今後は段階的に削除することをお勧めします。

v2では、引き続き通常の`Response`インスタンスを返し、`status`/`headers`はドキュメント要求の場合と同じように適用されます（`headers()`関数を介してヘッダーをマージします）。

時間とともに、ローダーとアクションから返されるレスポンスを段階的に排除する必要があります。

- `loader`/`action`が`status`/`headers`を設定せずに`json`/`defer`を返していた場合は、`json`/`defer`への呼び出しを削除し、データを直接返すことができます。
- `loader`/`action`が`json`/`defer`を介してカスタム`status`/`headers`を返していた場合は、新しい[`data()`][data-utility]ユーティリティを使用するように切り替える必要があります。

### クライアントローダー

アプリに[`clientLoader`][client-loader]関数を使用するルートがある場合、シングルフェッチの動作がわずかに変更されることに注意することが重要です。`clientLoader`は、サーバーの`loader`関数の呼び出しをオプトアウトするための方法を提供することを目的としているため、シングルフェッチ呼び出しでそのサーバーのローダーを実行することは不適切です。しかし、すべてのローダーは並行して実行され、実際にサーバーデータを求めている`clientLoader`がどれであるかを知るまで、呼び出しを待つことはできません。

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

ユーザーが`/ -> /a/b/c`に移動した場合、`a`と`b`のサーバーローダーと、`c`の`clientLoader`を実行する必要があります。これは、最終的に（またはそうでない場合）、独自のサーバー`loader`を呼び出す可能性があります。`a`/`b`の`loader`を取得する必要があるときに、シングルフェッチ呼び出しに`c`のサーバー`loader`を含めるかどうかを判断することはできません。また、`c`が実際に`serverLoader`を呼び出す（または返す）まで遅らせることもできません。ウォーターフォールが発生するためです。

そのため、`clientLoader`をエクスポートして、そのルートがシングルフェッチをオプトアウトした場合、`serverLoader`を呼び出すと、そのルートのサーバー`loader`のみを取得するための単一のフェッチが行われます。`clientLoader`をエクスポートしていないすべてのルートは、単一のHTTP要求でフェッチされます。

したがって、上記のルート設定では、`/ -> /a/b/c`へのナビゲーションにより、最初に`a`と`b`のルートに対して単一のシングルフェッチ呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/a,routes/b
```

その後、`c`が`serverLoader`を呼び出すと、`c`のサーバー`loader`のみに対する独自の呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/c
```

### リソースルート

シングルフェッチで使用される新しい[ストリーミング形式][streaming-format]のため、`loader`と`action`関数から返された生のJavaScriptオブジェクトは、`json()`ユーティリティを使用して`Response`インスタンスに自動的に変換されなくなりました。代わりに、ナビゲーションデータロードでは、他のローダーデータと結合され、`turbo-stream`レスポンスでストリーミングされます。

これは、個別にアクセスされることを目的とした、[リソースルート][resource-routes]にとって興味深いジレンマをもたらします。これは、常にRemix APIを介してアクセスされるわけではなく、他のHTTPクライアント（`fetch`、`cURL`など）からもアクセスできます。

リソースルートが内部のRemix APIでの消費を目的としている場合、より複雑な構造（`Date`や`Promise`インスタンスなど）をストリーミングダウンする機能を解放するために、`turbo-stream`エンコーディングを活用したいと考えています。ただし、外部からアクセスされる場合は、より簡単に消費できるJSON構造を返すことを好むでしょう。したがって、v2で生のオブジェクトを返した場合、動作はわずかに曖昧です。`turbo-stream`または`json()`でシリアル化する必要がありますか？

後方互換性を容易にし、シングルフェッチfutureフラグの採用を容易にするために、Remix v2は、これがRemix APIからアクセスされているか、外部からアクセスされているかによって処理します。将来的には、Remixでは、生のオブジェクトを外部から消費するためにストリーミングダウンしない場合は、独自の[JSONレスポンス][returning-response]を返す必要があります。

シングルフェッチが有効になっているRemix v2の動作は次のとおりです。

- `useFetcher`などのRemix APIからアクセスする場合、生のJavaScriptオブジェクトは、通常のローダーとアクションと同様に`turbo-stream`レスポンスとして返されます（これは、`useFetcher`がリクエストに`.data`サフィックスを追加するためです）。

- `fetch`や`cURL`などの外部ツールからアクセスする場合、v2では後方互換性のために、`json()`への自動変換を継続します。

  - Remixは、この状況が発生すると、廃止警告をログ出力します。
  - 適宜、影響を受けるリソースルートハンドラーを更新して、`Response`オブジェクトを返すことができます。
  - これらの廃止警告に対処することで、最終的なRemix v3へのアップグレードをより適切に準備できます。

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

## 詳細

### ストリーミングデータ形式

以前、Remixは`JSON.stringify`を使用してローダー/アクションデータをワイヤー上でシリアル化し、`defer`レスポンスをサポートするためにカスタムストリーミング形式を実装する必要がありました。

シングルフェッチでは、Remixは内部で[`turbo-stream`][turbo-stream]を使用するようになりました。これにより、ストリーミングが第一級のサポートされ、JSONよりも複雑なデータを自動的にシリアル化/デシリアル化できます。`BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL`などのデータ型は、`turbo-stream`を介して直接ストリーミングダウンできます。`Error`のサブタイプも、クライアントでグローバルに利用可能なコンストラクターがある場合はサポートされます（`SyntaxError`、`TypeError`など）。

シングルフェッチを有効にした後、コードを変更する必要があるかどうかは、状況によって異なります。

- ✅ `loader`/`action`関数から返された`json`レスポンスは、引き続き`JSON.stringify`を介してシリアル化されます。そのため、`Date`を返した場合、`useLoaderData`/`useActionData`からは`string`を受け取ります。
- ⚠️ `defer`インスタンスまたは生のオブジェクトを返した場合、`turbo-stream`を介してシリアル化されるようになりました。そのため、`Date`を返した場合、`useLoaderData`/`useActionData`からは`Date`を受け取ります。
  - 現状の動作を維持する場合は（ストリーミング`defer`レスポンスを除く）、既存の生のオブジェクトの返値を`json`でラップすればよいでしょう。

これは、ワイヤー上で`Promise`インスタンスを送信するために`defer`ユーティリティを使用する必要がなくなったことも意味します！生のオブジェクトに`Promise`を含めることができ、`useLoaderData().whatever`で取得できます。必要に応じて`Promise`をネストすることもできますが、潜在的なUXへの影響に注意してください。

シングルフェッチを採用したら、アプリケーション全体で`json`/`defer`の使用を段階的に削除し、生のオブジェクトを返すようにすることをお勧めします。

### ストリーミングタイムアウト

以前、Remixはデフォルトの[`entry.server.tsx`][entry-server]ファイルに組み込まれた`ABORT_TIMEOUT`という概念を持っていましたが、これはReactレンダラーを終了させるだけで、保留中の遅延プロミスのクリーンアップは何も行いませんでした。

Remixは内部でストリーミングされるようになったため、`turbo-stream`処理をキャンセルし、保留中のプロミスを自動的に拒否して、それらのエラーをクライアントにストリーミングアップできます。デフォルトでは、これは4950ミリ秒後に発生します。これは、ほとんどの`entry.server.tsx`ファイルで現在の5000ミリ秒の`ABORT_DELAY`をわずかに下回る値です。これは、プロミスをキャンセルして、Reactレンダラーが終了する前に、React側の処理に拒否をストリーミングアップする必要があるためです。

これは、`entry.server.tsx`から数値の`streamTimeout`をエクスポートすることで制御できます。Remixは、この値を、`loader`/`action`の保留中のプロミスを拒否するミリ秒数として使用します。この値は、Reactレンダラーを中止するタイムアウトと切り離すことをお勧めします。また、常にReactのタイムアウトをより高い値に設定して、`streamTimeout`の基礎となる拒否をストリーミングダウンする時間を与える必要があります。

```tsx filename=app/entry.server.tsx lines=[1-2,32-33]
// ハンドラー関数の保留中のプロミスをすべて5秒後に拒否する
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

    // Reactレンダラーを10秒後に自動的にタイムアウトさせる
    setTimeout(abort, 10000);
  });
}
```

### 再検証

#### 通常のナビゲーション動作

よりシンプルな精神モデルと、ドキュメント要求とデータ要求の整合性に加えて、シングルフェッチのもう1つの利点は、よりシンプルで（おそらくは）優れたキャッシュ動作です。一般的に、シングルフェッチでは、以前の複数フェッチ動作と比較して、HTTP要求が少なくなり、その結果をより頻繁にキャッシュできる可能性があります。

キャッシュの断片化を減らすために、シングルフェッチでは、GETナビゲーションでのデフォルトの再検証動作が変更されました。以前は、Remixは、`shouldRevalidate`を介してオプトインしない限り、再利用された祖先ルートのローダーを再実行しませんでした。現在、Remixは、`GET /a/b/c.data`などのシングルフェッチ要求の単純なケースでは、デフォルトでそれらを再実行します。`shouldRevalidate`または`clientLoader`関数が存在しない場合、これがアプリの動作になります。

`shouldRevalidate`または`clientLoader`のいずれかをアクティブなルートに追加すると、実行されるルートのサブセットを指定する`_routes`パラメーターを含む、粒度の細かいシングルフェッチ呼び出しがトリガーされます。

`clientLoader`が内部で`serverLoader()`を呼び出すと、その特定のルートに対する別のHTTP呼び出しが、以前の動作と同様にトリガーされます。

たとえば、`/a/b`にいて`/a/b/c`に移動した場合：

- `shouldRevalidate`または`clientLoader`関数が存在しない場合：`GET /a/b/c.data`
- すべてのルートにローダーがあるが、`routes/a`が`shouldRevalidate`でオプトアウトしている場合：
  - `GET /a/b/c.data?_routes=root,routes/b,routes/c`
- すべてのルートにローダーがあるが、`routes/b`に`clientLoader`がある場合：
  - `GET /a/b/c.data?_routes=root,routes/a,routes/c`
  - Bの`clientLoader`が`serverLoader()`を呼び出すと：
    - `GET /a/b/c.data?_routes=routes/b`

この新しい動作がアプリケーションに適していない場合は、親ルートに`shouldRevalidate`を追加して、`false`を返し、必要なシナリオで古い動作をオプトインすることができます。

別のオプションとして、高価な親ローダー計算のためにサーバー側のキャッシュを活用できます。

#### サブミットの再検証動作

以前は、Remixは、アクションのサブミット後、アクションの結果に関係なく、常にすべてのアクティブなローダーを再検証していました。[`shouldRevalidate`][should-revalidate]を使用して、ルートごとに再検証をオプトアウトできます。

シングルフェッチでは、`action`が`4xx/5xx`ステータスコードを含む`Response`を返したり、スローしたりした場合、Remixはデフォルトでローダーを再検証しません。`action`が`4xx/5xx` Responseではないものを返したり、スローしたりした場合、再検証動作は変わりません。これは、ほとんどの場合、`4xx`/`5xx` Responseを返す場合は、実際にはデータを変更していないため、データを再読み込みする必要がないためです。

`4xx/5xx`アクションレスポンス後にローダーを1つ以上再検証する必要がある場合は、[`shouldRevalidate`][should-revalidate]関数から`true`を返すことで、ルートごとに再検証をオプトインできます。アクションのステータスコードに基づいて判断する必要がある場合は、`actionStatus`という新しいパラメーターが関数に渡されます。

再検証は、シングルフェッチHTTP呼び出しの`?_routes`クエリ文字列パラメーターを介して処理されます。これにより、呼び出されるローダーが制限されます。つまり、粒度の細かい再検証を行っている場合、要求されているルートに基づいてキャッシュ列挙が行われます。しかし、すべての情報はURLにあるため、特別なCDN設定は必要ありません（これが、CDNが`Vary`ヘッダーを尊重することを要求するカスタムヘッダーを介して行われた場合とは対照的です）。

[future-flags]: ../file-conventions/remix-config#future
[should-revalidate]: ../route/should-revalidate
[entry-server]: ../file-conventions/entry.server
[client-loader]: ../route/client-loader
[2.9.0]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#v290
[2.13.0]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#v2130
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
[revalidation]: #通常のナビゲーション動作
[action-revalidation]: #サブミットの再検証動作
[start]: #シングルフェッチの有効化
[type-inference-section]: #型推論
[compatibility-flag]: https://developers.cloudflare.com/workers/configuration/compatibility-dates
[data-utility]: ../utils/data
[augment]: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation

