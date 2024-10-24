---
title: シングルフェッチ
---

# シングルフェッチ

シングルフェッチは、新しいデータローディング戦略とストリーミングフォーマットです。 シングルフェッチを有効にすると、Remixはクライアント側の遷移でサーバーに対して単一のHTTP呼び出しを行うようになり、複数のHTTP呼び出しを並行して（ローダーごとに1つずつ）行うことはなくなります。 さらに、シングルフェッチでは、`Date`、`Error`、`Promise`、`RegExp`など、`loader`と`action`から生のオブジェクトを送信することもできます。

## 概要

Remixは、[`v2.9.0`][2.9.0]（後に[`v2.13.0`][2.13.0]で`future.v3_singleFetch`として安定化）の[`future.unstable_singleFetch`][future-flags]フラグの後ろに「シングルフェッチ」([RFC][rfc])のサポートを追加しました。 これにより、この動作を選択できます。 シングルフェッチは[React Router v7][merging-remix-and-rr]でデフォルトになります。

シングルフェッチの有効化は、当初は低労力で、その後は時間をかけてすべての破壊的な変更を段階的に導入することを目的としています。 最初は[シングルフェッチを有効にする][start]ために必要な最小限の変更を適用し、その後は[移行ガイド][migration-guide]を使用してアプリケーションの段階的な変更を行い、[React Router v7][merging-remix-and-rr]へのスムーズで非破壊的なアップグレードを確実にします。

また、[破壊的な変更][breaking-changes]も確認して、特にシリアル化とステータス/ヘッダーの動作に関する根本的な動作の変更を把握しておく必要があります。

## シングルフェッチの有効化

**1. 未来フラグを有効にする**

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

**2. 廃止された`fetch`ポリフィル**

シングルフェッチでは、[`undici`][undici]を`fetch`ポリフィルとして使用するか、Node 20+の組み込み`fetch`を使用する必要があります。 これは、`@remix-run/web-fetch`ポリフィルにはない、そこで利用可能なAPIに依存しているためです。 詳しくは、以下の2.9.0リリースノートの[Undici][undici-polyfill]セクションを参照してください。

- Node 20+を使用している場合は、`installGlobals()`への呼び出しをすべて削除し、Nodeの組み込み`fetch`（これは`undici`と同じです）を使用します。

- 独自のサーバーを管理していて`installGlobals()`を呼び出している場合は、`undici`を使用するために`installGlobals({ nativeFetch: true })`を呼び出す必要があります。

  ```diff
  - installGlobals();
  + installGlobals({ nativeFetch: true });
  ```

- `remix-serve`を使用している場合は、シングルフェッチが有効になっていると、自動的に`undici`を使用します。

- Remixプロジェクトにminiflare/cloudflare workerを使用している場合は、[互換性フラグ][compatibility-flag]が`2023-03-01`以降に設定されていることを確認してください。

**3. 必要に応じて`headers`の実装を調整する**

シングルフェッチを有効にすると、複数のローダーを実行する場合でも、クライアント側のナビゲーションで実行されるリクエストは1つだけになります。 呼び出されるハンドラーのヘッダーのマージを処理するために、[`headers`][headers]エクスポートは、`loader`/`action`データリクエストにも適用されるようになりました。 多くの場合、ドキュメントリクエストで既に持っているロジックは、新しいシングルフェッチデータリクエストに対して十分に近いはずです。

**4. `nonce`を追加する（CSPを使用している場合）**

スクリプトの[コンテンツセキュリティポリシー][csp]を[nonceソース][csp-nonce]で設定している場合は、ストリーミングシングルフェッチの実装のために2つの場所に`nonce`を追加する必要があります。

- `<RemixServer nonce={yourNonceValue}>` - これにより、クライアント側でストリーミングデータ処理を行うこのコンポーネントによってレンダリングされたインラインスクリプトに`nonce`が追加されます。
- `entry.server.tsx`の[`renderToPipeableStream`][rendertopipeablestream]/[`renderToReadableStream`][rendertoreadablestream]への`options.nonce`パラメーターに。 Remixの[ストリーミングドキュメント][streaming-nonce]も参照してください。

**5. `renderToString`を置き換える（使用している場合）**

ほとんどのRemixアプリでは`renderToString`は使用していませんが、`entry.server.tsx`で使用することを選択している場合は、以下を読み進めてください。 そうでない場合は、この手順をスキップできます。

ドキュメントリクエストとデータリクエストの整合性を維持するために、`turbo-stream`は初期ドキュメントリクエストでのデータ送信にもフォーマットとして使用されます。 つまり、シングルフェッチを選択すると、アプリケーションでは[`renderToString`][rendertostring]を使用できなくなり、[`entry.server.tsx`][entry-server]で[`renderToPipeableStream`][rendertopipeablestream]や[`renderToReadableStream`][rendertoreadablestream]などのReactストリーミングレンダラーAPIを使用する必要があります。

これは、HTTPレスポンスをストリーミングする必要があるという意味ではありません。 `renderToPipeableStream`の`onAllReady`オプションまたは`renderToReadableStream`の`allReady`プロミスを活用することで、引き続きフルドキュメントを一度に送信できます。

クライアント側では、ストリーミングされたデータは`Suspense`境界でラップされているため、クライアント側の[`hydrateRoot`][hydrateroot]呼び出しを[`startTransition`][starttransition]呼び出しでラップする必要があります。

## 破壊的な変更

シングルフェッチでは、いくつかの破壊的な変更が導入されました。 その中には、フラグを有効にしたときにすぐに処理する必要があるものもあれば、フラグを有効にした後に段階的に処理できるものもあります。 次のメジャーバージョンにアップグレードする前に、これらの変更がすべて処理されていることを確認する必要があります。

**最初に処理する必要がある変更:**

- **廃止された`fetch`ポリフィル**: 古い`installGlobals()`ポリフィルはシングルフェッチでは機能しません。 Node 20のネイティブ`fetch`APIを使用するか、カスタムサーバーで`installGlobals({ nativeFetch: true })`を呼び出して、[undiciベースのポリフィル][undici-polyfill]を取得する必要があります。
- **`headers`エクスポートがデータリクエストに適用される**: [`headers`][headers]関数は、ドキュメントリクエストとデータリクエストの両方に適用されるようになりました。

**時間をかけて処理する必要がある変更:**

- **[新しいストリーミングデータフォーマット][streaming-format]**: シングルフェッチは、[`turbo-stream`][turbo-stream]を介して新しいストリーミングフォーマットを使用するため、JSONだけでなく、より複雑なデータをストリーミングできます。
- **自動シリアル化は不要**: `loader`と`action`関数から返される生のオブジェクトは、自動的にJSON`Response`に変換されなくなり、そのままワイヤー上でシリアル化されます。
- [**タイプ推論の更新**][type-inference-section]: 最も正確なタイプ推論を得るには、`v3_singleFetch: true`でRemixの`Future`インターフェースを[拡張][augment]する必要があります。
- [**GETナビゲーションでのデフォルトの再検証動作はオプトアウトに変更される**][revalidation]: 通常のナビゲーションでのデフォルトの再検証動作は、オプトインからオプトアウトに変更され、サーバーローダーはデフォルトで再実行されます。
- [**`action`再検証のオプトイン**][action-revalidation]: `action`の`4xx`/`5xx` `Response`後の再検証は、オプトアウトではなく、オプトインになりました。

## シングルフェッチを使用した新しいルートの追加

シングルフェッチを有効にすると、より強力なストリーミングフォーマットを活用したルートを作成できます。

<docs-info>適切なタイプ推論を得るには、`v3_singleFetch: true`でRemixの`Future`インターフェースを[拡張][augment]する必要があります。 詳細は、[タイプ推論セクション][type-inference-section]をご覧ください。</docs-info>

シングルフェッチでは、ローダーから以下のデータ型を返すことができます。 `BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL`。

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

現在ローダーから`Response`インスタンス（つまり、`json`/`defer`）を返している場合は、シングルフェッチを活用するために、アプリコードを大幅に変更する必要はありません。

しかし、将来的に[React Router v7][merging-remix-and-rr]にアップグレードする準備を整えるために、ルート単位で以下の変更を開始することをお勧めします。 これは、ヘッダーとデータ型の更新が何も壊さないことを検証する最も簡単な方法です。

### タイプ推論

シングルフェッチがない場合、`loader`または`action`から返されるプレーンなJavaScriptオブジェクトは、自動的にJSONレスポンスにシリアル化されます（`json`を介して返された場合と同じです）。 タイプ推論は、これが事実であると仮定し、裸のオブジェクトの戻り値をJSONシリアル化されたものとして推論します。

シングルフェッチでは、裸のオブジェクトは直接ストリーミングされるため、シングルフェッチを選択すると、組み込みのタイプ推論は正確ではなくなります。 たとえば、`Date`がクライアント側で文字列にシリアル化されると仮定されます 😕。

#### シングルフェッチのタイプを有効にする

シングルフェッチのタイプに切り替えるには、`v3_singleFetch: true`でRemixの`Future`インターフェースを[拡張][augment]する必要があります。
これは、`tsconfig.json` > `include`でカバーされている任意のファイルで行うことができます。
Remixプラグインの`future.v3_singleFetch`未来フラグと併せて、`vite.config.ts`で行うことをお勧めします。

```ts
declare module "@remix-run/server-runtime" {
  // またはcloudflare、denoなど
  interface Future {
    v3_singleFetch: true;
  }
}
```

これで、`useLoaderData`、`useActionData`、および`typeof loader`ジェネリックを使用するその他のユーティリティは、シングルフェッチのタイプを使用するようになりました。

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

一般的に、関数はネットワークを介して確実に送信することはできないため、`undefined`としてシリアル化されます。

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

メソッドもシリアル化できないため、クラスインスタンスはシリアル化可能なプロパティに絞られます。

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

<docs-warning>`clientLoader`の引数と`clientAction`の引数の型を含めてください。 これは、クライアントデータ関数を検出する方法です。</docs-warning>

クライアント側のローダーとアクションからのデータはシリアル化されないため、これらの型は保持されます。

```ts
import {
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";

class Dog {
  /* ... */
}

// 引数の型を注釈する！ 👇
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

[`headers`][headers]関数は、シングルフェッチが有効になっている場合、ドキュメントリクエストとデータリクエストの両方で使用されます。 この関数を使用して、並行して実行されるローダーから返されたヘッダーをマージするか、特定の`actionHeaders`を返します。

### 返されるレスポンス

シングルフェッチでは、`Response`インスタンスを返す必要がなくなり、生のオブジェクトを直接返すことができます。 したがって、`json`/`defer`ユーティリティは、シングルフェッチを使用する場合は廃止されたものとして扱う必要があります。 これらは、v2の間は残るので、すぐに削除する必要はありません。 次のメジャーバージョンでは削除される可能性があるため、それまでに段階的に削除することをお勧めします。

v2では、引き続き通常の`Response`インスタンスを返し続け、`status`/`headers`はドキュメントリクエストと同様に（`headers()`関数を介してヘッダーをマージして）有効になります。

時間をかけて、ローダーとアクションから返されるレスポンスを排除する必要があります。

- `loader`/`action`が`status`/`headers`を設定せずに`json`/`defer`を返していた場合、`json`/`defer`への呼び出しを削除して、データを直接返すことができます。
- `loader`/`action`が`json`/`defer`を介してカスタム`status`/`headers`を返していた場合は、新しい[`data()`][data-utility]ユーティリティを使用するように切り替える必要があります。

### クライアントローダー

アプリに[`clientLoader`][client-loader]関数を使用するルートがある場合、シングルフェッチの動作がわずかに変化することに注意することが重要です。 `clientLoader`は、サーバーの`loader`関数の呼び出しをオプトアウトするための方法として意図されているため、シングルフェッチの呼び出しがそのサーバーの`loader`を実行することは正しくありません。 しかし、すべてのローダーは並行して実行され、サーバーデータを求めている`clientLoader`が実際にどれであるかを知るまで、呼び出しを待つことはできません。

たとえば、以下の`/a/b/c`ルートを考えてみます。

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

ユーザーが`/ -> /a/b/c`にナビゲートする場合、`a`と`b`のサーバーローダー、および`c`の`clientLoader`を実行する必要があります。 これは、最終的に（またはしない可能性がありますが）独自のサーバーの`loader`を呼び出します。 `a`/`b`の`loader`を取得したいときに、`c`のサーバーの`loader`をシングルフェッチ呼び出しに含めることはできませんし、`c`が実際に`serverLoader`を呼び出す（または返す）まで遅延させることもできません。 ウォーターフォールが発生するのを防ぐためです。

したがって、`clientLoader`をエクスポートするルートは、シングルフェッチをオプトアウトし、`serverLoader`を呼び出すと、そのルートのサーバー`loader`のみを取得するための単一のフェッチが行われます。 `clientLoader`をエクスポートしていないすべてのルートは、単一のHTTPリクエストでフェッチされます。

そのため、上記のルート設定では、`/ -> /a/b/c`へのナビゲーションは、`a`と`b`のルートに対して、最初に単一のシングルフェッチ呼び出しを行います。

```
GET /a/b/c.data?_routes=routes/a,routes/b
```

そして、`c`が`serverLoader`を呼び出すと、`c`のサーバーの`loader`のみを取得するための独自の呼び出しを行います。

```
GET /a/b/c.data?_routes=routes/c
```

### リソースルート

シングルフェッチで使用される新しい[ストリーミングフォーマット][streaming-format]のため、`loader`と`action`関数から返される生のJavaScriptオブジェクトは、`json()`ユーティリティを介して自動的に`Response`インスタンスに変換されなくなりました。 代わりに、ナビゲーションデータロードでは、他のローダーデータと組み合わせて`turbo-stream`レスポンスでストリーミングされます。

これは、[リソースルート][resource-routes]にとって興味深いジレンマをもたらします。 リソースルートは、個別にヒットするように意図されており、必ずしもRemix APIを介してヒットするとは限りません。 また、他のHTTPクライアント（`fetch`、`cURL`など）からもアクセスできます。

リソースルートが内部のRemix APIで使用されることを目的としている場合、`turbo-stream`エンコーディングを活用して、`Date`や`Promise`インスタンスなどのより複雑な構造をストリーミングできるようになります。 しかし、外部からアクセスされた場合、JSON構造の方が使いやすく、消費しやすいでしょう。 したがって、v2で生のオブジェクトを返した場合、その動作は少し曖昧になります。 `turbo-stream`または`json()`でシリアル化すべきでしょうか？

後方互換性を容易にし、シングルフェッチの未来フラグの導入を容易にするために、Remix v2では、Remix APIからアクセスされたか、外部からアクセスされたかによって処理されます。 将来的には、Remixでは、生のオブジェクトを外部からの消費のためにストリーミングさせたくない場合は、独自の[JSONレスポンス][returning-response]を返す必要があります。

シングルフェッチが有効な場合のRemix v2の動作は、次のとおりです。

- `useFetcher`などのRemix APIからアクセスした場合、生のJavaScriptオブジェクトは、通常のローダーとアクションと同じように、`turbo-stream`レスポンスとして返されます（これは、`useFetcher`がリクエストに`.data`サフィックスを追加するためです）。

- `fetch`や`cURL`などの外部ツールからアクセスした場合、v2では後方互換性のために、引き続き自動的に`json()`に変換されます。

  - Remixは、この状況が発生した場合、非推奨の警告をログに出力します。
  - 必要なときに、影響を受けるリソースルートハンドラーを更新して、`Response`オブジェクトを返すことができます。
  - これらの非推奨の警告に対処することで、将来的にRemix v3へのアップグレードの準備が整います。

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

## 詳細情報

### ストリーミングデータフォーマット

以前は、Remixは`JSON.stringify`を使用してローダー/アクションデータをワイヤー上でシリアル化し、`defer`レスポンスをサポートするためにカスタムストリーミングフォーマットを実装する必要がありました。

シングルフェッチでは、Remixは現在、[`turbo-stream`][turbo-stream]を内部で使用しています。 これは、ストリーミングをファーストクラスでサポートしており、JSONよりも複雑なデータを自動的にシリアル化/デシリアル化できます。 以下のデータ型は、`turbo-stream`を介して直接ストリーミングできます。 `BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL`。 `Error`のサブタイプも、クライアント側でグローバルに利用可能なコンストラクターがある場合はサポートされます（`SyntaxError`、`TypeError`など）。

これは、シングルフェッチを有効にしたときに、コードにすぐに変更を加える必要があるかどうかに影響を与える可能性があります。

- ✅ `loader`/`action`関数から返される`json`レスポンスは、引き続き`JSON.stringify`を介してシリアル化されます。 したがって、`Date`を返すと、`useLoaderData`/`useActionData`から`string`を受け取ります。
- ⚠️ `defer`インスタンスまたは裸のオブジェクトを返した場合、`turbo-stream`を介してシリアル化されます。 したがって、`Date`を返すと、`useLoaderData`/`useActionData`から`Date`を受け取ります。
  - 現在の動作（ストリーミング`defer`レスポンスを除く）を維持したい場合は、既存の裸のオブジェクトの戻り値を`json`でラップするだけです。

これは、ワイヤー上で`Promise`インスタンスを送信するために、`defer`ユーティリティを使用する必要がなくなったことも意味します。 裸のオブジェクトに`Promise`を含めることができ、`useLoaderData().whatever`で取得できます。 必要に応じて`Promise`をネストすることもできますが、潜在的なUXへの影響に注意してください。

シングルフェッチを採用したら、アプリケーション全体で`json`/`defer`の使用を段階的に削除し、生のオブジェクトを返すようにすることをお勧めします。

### ストリーミングタイムアウト

以前、Remixは、デフォルトの[`entry.server.tsx`][entry-server]ファイルに組み込まれた`ABORT_TIMEOUT`の概念を持っていましたが、これはReactレンダラーを終了させるものでしたが、保留中の遅延プロミスをクリーンアップするための具体的な処理は行いませんでした。

Remixが内部でストリーミングするようになったため、`turbo-stream`処理をキャンセルし、保留中のプロミスを自動的に拒否し、それらのエラーをクライアントにストリーミングできます。 デフォルトでは、これは4950ms後に発生します。 これは、現在のほとんどのentry.server.tsxファイルの`ABORT_DELAY`である5000msより少し短い値です。 これは、Reactの処理を中止する前に、プロミスをキャンセルし、その拒否をReactレンダラーを介してストリーミングする必要があるためです。

これは、`entry.server.tsx`から`streamTimeout`という数値をエクスポートすることで制御できます。 Remixは、その値をミリ秒で、`loader`/`action`の保留中の`Promise`を拒否するまでの時間として使用します。 Reactレンダラーを中止するタイムアウトとは、この値を分離することをお勧めします。 また、Reactのタイムアウトをより長い値に設定する必要があります。 これにより、`streamTimeout`からの根本的な拒否をストリーミングする時間を与えることができます。

```tsx filename=app/entry.server.tsx lines=[1-2,32-33]
// ハンドラー関数の保留中のすべてのプロミスを5秒後に拒否する
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

シングルフェッチの利点は、シンプルな精神モデルとドキュメントリクエストとデータリクエストの整合性に加えて、よりシンプルで（うまくいけば）より良いキャッシュ動作です。 一般的に、シングルフェッチではHTTPリクエストの数が減り、以前の複数フェッチの動作と比較して、キャッシュされた結果が多くなることが期待されます。

キャッシュの断片化を減らすため、シングルフェッチではGETナビゲーションでのデフォルトの再検証動作が変更されています。 以前は、Remixは、`shouldRevalidate`を介してオプトインしない限り、再利用された祖先ルートのローダーを再実行しませんでした。 現在は、Remixは`GET /a/b/c.data`のようなシングルフェッチリクエストの簡単なケースでは、デフォルトでこれらのローダーを再実行します。 `shouldRevalidate`や`clientLoader`関数が存在しない場合、これがアプリの動作になります。

いずれかのアクティブなルートに`shouldRevalidate`または`clientLoader`を追加すると、`_routes`パラメーターを含む、細かいシングルフェッチ呼び出しがトリガーされます。 このパラメーターは、実行するルートのサブセットを指定します。

`clientLoader`が内部で`serverLoader()`を呼び出すと、その特定のルートに対して別々のHTTP呼び出しがトリガーされ、以前の動作と同じになります。

たとえば、`/a/b`にいて、`/a/b/c`にナビゲートする場合、次のようになります。

- `shouldRevalidate`または`clientLoader`関数が存在しない場合: `GET /a/b/c.data`
- すべてのルートにローダーがあるが、`routes/a`が`shouldRevalidate`を介してオプトアウトしている場合:
  - `GET /a/b/c.data?_routes=root,routes/b,routes/c`
- すべてのルートにローダーがあるが、`routes/b`に`clientLoader`がある場合:
  - `GET /a/b/c.data?_routes=root,routes/a,routes/c`
  - そして、Bの`clientLoader`が`serverLoader()`を呼び出す場合:
    - `GET /a/b/c.data?_routes=routes/b`

この新しい動作がアプリケーションに適していない場合は、親ルートに`shouldRevalidate`を追加して、`false`を返すことで、再検証しないという以前の動作にオプトインできます。 これにより、必要なシナリオでの再検証を防ぐことができます。

別のオプションは、高価な親ローダーの計算用にサーバー側のキャッシュを活用することです。

#### 送信再検証の動作

以前は、Remixは、アクションの送信後、アクションの結果に関係なく、アクティブなすべてのローダーを再検証していました。 [`shouldRevalidate`][should-revalidate]を介して、ルート単位で再検証をオプトアウトできました。

シングルフェッチでは、`action`が`4xx/5xx`ステータスコードの`Response`を返したりスローしたりした場合、Remixはデフォルトでローダーを再検証しません。 `action`が`4xx/5xx`以外のResponseを返したりスローしたりした場合、再検証の動作は変わりません。 ここでは、`4xx`/`5xx` Responseを返すと、ほとんどの場合、実際にはデータが変更されていないため、データを再読み込みする必要がないと判断しています。

`4xx/5xx`アクションレスポンス後に、1つ以上のローダーを再検証したい場合は、[`shouldRevalidate`][should-revalidate]関数から`true`を返すことで、ルート単位で再検証をオプトインできます。 また、アクションのステータスコードに基づいて決定する必要がある場合は、`actionStatus`パラメーターが関数に渡されます。

再検証は、シングルフェッチHTTP呼び出しの`?_routes`クエリ文字列パラメーターを介して処理され、呼び出されるローダーが制限されます。 これは、細かい再検証を行っている場合、リクエストされているルートに基づいてキャッシュの列挙が発生することを意味しますが、すべての情報はURLに含まれているため、特別なCDNの設定は必要ありません（これは、CDNが`Vary`ヘッダーを尊重する必要があるカスタムヘッダーを介して行われた場合とは異なります）。

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
[returning-response]: ../route/loader#returning-response-instances
[streaming-format]: #ストリーミングデータフォーマット
[undici-polyfill]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#undici
[undici]: https://github.com/nodejs/undici
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
[csp-nonce]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources
[merging-remix-and-rr]: https://remix.run/blog/merging-remix-and-react-router
[migration-guide]: #シングルフェッチを使用したルートの移行
[breaking-changes]: #破壊的な変更
[revalidation]: #通常のナビゲーションの動作
[action-revalidation]: #送信再検証の動作
[start]: #シングルフェッチの有効化
[type-inference-section]: #タイプ推論
[compatibility-flag]: https://developers.cloudflare.com/workers/configuration/compatibility-dates
[data-utility]: ../utils/data
[augment]: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
[streaming-nonce]: ./streaming#ストリーミングとコンテンツセキュリティポリシー



