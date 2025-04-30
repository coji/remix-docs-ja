---
title: シングルフェッチ
---

# シングルフェッチ

シングルフェッチは、新しいデータ読み込み戦略とストリーミング形式です。シングルフェッチを有効にすると、Remixはクライアント側の遷移でサーバーへのHTTP呼び出しを1回だけ行うようになり、複数のHTTP呼び出しを並列で行う必要がなくなります（ローダーごとに1回）。さらに、シングルフェッチでは、`Date`、`Error`、`Promise`、`RegExp`など、`loader`と`action`から生のオブジェクトを送信することもできます。

## 概要

Remixは`v2.9.0`（後に`v2.13.0`で`future.v3_singleFetch`として安定化）の[`future.unstable_singleFetch`][future-flags]フラグで「シングルフェッチ」([RFC][rfc])のサポートを導入しました。これにより、この動作を選択できます。シングルフェッチは[React Router v7][merging-remix-and-rr]ではデフォルトになります。

シングルフェッチの有効化は、初期段階では容易であり、その後、破壊的な変更を段階的に適用できます。[シングルフェッチを有効にする][start]ために必要な最小限の変更を適用してから、[移行ガイド][migration-guide]を使用してアプリケーションの段階的な変更を行い、[React Router v7][merging-remix-and-rr]へのスムーズな、破壊的ではないアップグレードを確保します。

また、シリアライゼーションとステータス/ヘッダーの動作に関するいくつかの基礎となる動作の変更について、[破壊的変更][breaking-changes]も確認してください。

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

**2. 非推奨の`fetch`ポリフィル**

シングルフェッチでは、`@remix-run/web-fetch`ポリフィルにはないAPIに依存しているため、`fetch`ポリフィルとして[`undici`][undici]を使用するか、Node 20以降の組み込み`fetch`を使用する必要があります。詳細については、以下の2.9.0リリースノートの[Undici][undici-polyfill]セクションを参照してください。

- Node 20以降を使用している場合は、`installGlobals()`への呼び出しをすべて削除し、Nodeの組み込み`fetch`を使用します（これは`undici`と同じです）。

- 独自のサーバーを管理していて`installGlobals()`を呼び出している場合は、`undici`を使用するために`installGlobals({ nativeFetch: true })`を呼び出す必要があります。

  ```diff
  - installGlobals();
  + installGlobals({ nativeFetch: true });
  ```

- `remix-serve`を使用している場合は、シングルフェッチが有効になっていると自動的に`undici`を使用します。

- miniflare/cloudflare workerでRemixプロジェクトを使用している場合は、[互換性フラグ][compatibility-flag]が`2023-03-01`以降に設定されていることを確認してください。

**3. `headers`の実装を調整する（必要に応じて）**

シングルフェッチを有効にすると、複数のローダーを実行する必要がある場合でも、クライアント側のナビゲーションで1つのリクエストしか行われなくなります。呼び出されたハンドラーのヘッダーのマージを処理するために、[`headers`][headers]エクスポートは`loader`/`action`データリクエストにも適用されるようになります。多くの場合、ドキュメントリクエストに対して既に持っているロジックは、新しいシングルフェッチデータリクエストに対してほぼ十分です。

**4. `nonce`を追加する（CSPを使用している場合）**

[nonceソース][csp-nonce]を持つ[スクリプトのコンテンツセキュリティポリシー][csp]がある場合は、ストリーミングシングルフェッチ実装のために2つの場所に`nonce`を追加する必要があります。

- `<RemixServer nonce={yourNonceValue}>` - これにより、クライアント側でストリーミングデータを処理するこのコンポーネントによってレンダリングされるインラインスクリプトに`nonce`が追加されます。
- `entry.server.tsx`の[`renderToPipeableStream`][rendertopipeablestream]/[`renderToReadableStream`][rendertoreadablestream]への`options.nonce`パラメーター。Remixの[ストリーミングドキュメント][streaming-nonce]も参照してください。

**5. `renderToString`を置き換える（使用している場合）**

ほとんどのRemixアプリでは`renderToString`を使用している可能性は低いですが、`entry.server.tsx`で使用することを選択している場合は、読み進めてください。そうでない場合は、この手順をスキップできます。

ドキュメントリクエストとデータリクエストの一貫性を維持するために、`turbo-stream`は初期ドキュメントリクエストでのデータ送信の形式としても使用されます。つまり、シングルフェッチを選択すると、アプリケーションでは[`renderToString`][rendertostring]を使用できなくなり、[`renderToPipeableStream`][rendertopipeablestream]または[`renderToReadableStream`][rendertoreadablestream]などのReactストリーミングレンダラーAPIを[`entry.server.tsx`][entry-server]で使用しなければなりません。

これは、HTTPレスポンスをストリーミングする必要があるという意味ではありません。`renderToPipeableStream`の`onAllReady`オプション、または`renderToReadableStream`の`allReady`プロミスを利用して、ドキュメント全体を一度に送信することもできます。

クライアント側では、ストリーミングデータは`Suspense`境界でラップされてくるため、クライアント側の[`hydrateRoot`][hydrateroot]呼び出しを[`startTransition`][starttransition]呼び出しでラップする必要があります。

## 破壊的変更

シングルフェッチでは、いくつかの破壊的な変更が導入されています。その一部は、フラグを有効にしたときにすぐに処理する必要があるもの、一部はフラグを有効にした後に段階的に処理できるものがあります。次のメジャーバージョンに更新する前に、これらすべてが処理されていることを確認する必要があります。

**すぐに対応する必要がある変更:**

- **非推奨の`fetch`ポリフィル**: 古い`installGlobals()`ポリフィルはシングルフェッチでは機能しません。ネイティブのNode 20 `fetch` APIを使用するか、カスタムサーバーで`installGlobals({ nativeFetch: true })`を呼び出して[undiciベースのポリフィル][undici-polyfill]を取得する必要があります。
- **`headers`エクスポートがデータリクエストに適用される**: [`headers`][headers]関数は、ドキュメントリクエストとデータリクエストの両方に適用されるようになります。

**時間をかけて処理する必要がある変更について:**

- **[新しいストリーミングデータ形式][streaming-format]**: シングルフェッチは[`turbo-stream`][turbo-stream]を介して新しいストリーミング形式を内部的に使用するため、JSONよりも複雑なデータをストリーミングできます。
- **自動シリアライゼーションなし**: `loader`と`action`関数から返された生のオブジェクトは、自動的にJSON `Response`に変換されなくなり、ワイヤ上でそのままシリアライズされます。
- [**型推論の更新**][type-inference-section]: 最も正確な型推論を得るには、`v3_singleFetch: true`を使用してRemixの`Future`インターフェースを[拡張する][augment]必要があります。
- [**GETナビゲーションでのオプトアウトへのデフォルトの再検証動作の変更**][revalidation]: 通常のナビゲーションでのデフォルトの再検証動作はオプトインからオプトアウトに変更され、サーバーローダーはデフォルトで再実行されます。
- [**オプトイン`action`再検証**][action-revalidation]: `action` `4xx`/`5xx` `Response`後の再検証は、オプトアウトではなくオプトインになります。

## シングルフェッチを使用した新しいルートの追加

シングルフェッチを有効にすると、より強力なストリーミング形式を利用するルートを作成できます。

<docs-info>適切な型推論を得るには、`v3_singleFetch: true`を使用してRemixの`Future`インターフェースを[拡張する][augment]必要があります。詳細については、[型推論セクション][type-inference-section]を参照してください。</docs-info>

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

現在、ローダーから`Response`インスタンス（つまり、`json`/`defer`）を返している場合、シングルフェッチを利用するためにアプリコードを大幅に変更する必要はありません。

ただし、将来の[React Router v7][merging-remix-and-rr]へのアップグレードをより適切に準備するために、ルートごとに以下の変更を開始することをお勧めします。これは、ヘッダーとデータ型を更新しても何も壊れないことを検証する最も簡単な方法です。

### 型推論

シングルフェッチがない場合、`loader`または`action`から返されたプレーンなJavaScriptオブジェクトは、自動的にJSONレスポンスにシリアライズされます（`json`を介して返された場合と同じ）。型推論ではこれが当てはまると仮定し、生のオブジェクトの戻り値をJSONシリアライズされたものとして推論します。

シングルフェッチでは、生のオブジェクトが直接ストリーミングされるため、シングルフェッチを選択すると、組み込みの型推論は正確ではなくなります。たとえば、`Date`がクライアント側で文字列にシリアライズされると仮定します😕。

#### シングルフェッチの型を有効にする

シングルフェッチの型に切り替えるには、`v3_singleFetch: true`を使用してRemixの`Future`インターフェースを[拡張する][augment]必要があります。
これは、`tsconfig.json` > `include`でカバーされている任意のファイルで行うことができます。Remixプラグインの`future.v3_singleFetch` futureフラグと共存させるために、`vite.config.ts`で行うことをお勧めします。

```ts
declare module "@remix-run/server-runtime" {
  // or cloudflare, deno, etc.
  interface Future {
    v3_singleFetch: true;
  }
}
```

これで、`useLoaderData`、`useActionData`、`typeof loader`ジェネリックを使用するその他のユーティリティは、シングルフェッチの型を使用するようになります。

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

一般的に、関数はネットワーク経由で確実に送信できないため、`undefined`としてシリアライズされます。

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

メソッドもシリアライズできないため、クラスインスタンスはシリアライズ可能なプロパティのみに絞り込まれます。

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

<docs-warning>`clientLoader`引数と`clientAction`引数の型を含めるようにしてください。これは、クライアントデータ関数を検出する方法です。</docs-warning>

クライアント側のローダーとアクションからのデータは決してシリアライズされないため、それらの型は保持されます。

```ts
import {
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";

class Dog {
  /* ... */
}

// Make sure to annotate the types for the args! 👇
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

[`headers`][headers]関数は、シングルフェッチが有効になっている場合、ドキュメントリクエストとデータリクエストの両方で使用されます。この関数を使用して、並列実行されたローダーから返されたヘッダーをマージするか、指定された`actionHeaders`を返すことができます。

### 返されたレスポンス

シングルフェッチでは、`Response`インスタンスを返す必要がなくなり、生のオブジェクトの戻り値を介してデータを直接返すことができます。したがって、`json`/`defer`ユーティリティは、シングルフェッチを使用する場合は非推奨と見なされます。これらはv2の間は残りますが、すぐに削除する必要はありません。次のメジャーバージョンで削除される可能性が高いため、それまでに段階的に削除することをお勧めします。

v2では、通常の`Response`インスタンスを返し続けることができ、その`status`/`headers`はドキュメントリクエストと同じように機能します（`headers()`関数を使用してヘッダーをマージします）。

時間をかけて、ローダーとアクションから返される`Response`を削除する必要があります。

- `loader`/`action`が`status`/`headers`を設定せずに`json`/`defer`を返していた場合、`json`/`defer`への呼び出しを削除してデータを直接返すことができます。
- `loader`/`action`が`json`/`defer`を介してカスタム`status`/`headers`を返していた場合、新しい[`data()`][data-utility]ユーティリティを使用するように切り替える必要があります。

### クライアントローダー

アプリに[`clientLoader`][client-loader]関数を使用するルートがある場合、シングルフェッチの動作がわずかに変わることに注意することが重要です。`clientLoader`はサーバーの`loader`関数の呼び出しをオプトアウトする方法を意図しているため、シングルフェッチ呼び出しでそのサーバーローダーを実行することは正しくありません。しかし、すべてのローダーを並列で実行し、実際にサーバーデータを求めている`clientLoader`がどれであるかを知るまで、呼び出しを行うのを待つことは望ましくありません。

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

ユーザーが`/ -> /a/b/c`に移動する場合、`a`と`b`のサーバーローダーと、独自のサーバー`loader`を最終的に（またはしない可能性もある）呼び出す可能性のある`c`の`clientLoader`を実行する必要があります。`a`/`b`の`loader`を取得したいときに、`c`のサーバー`loader`をシングルフェッチ呼び出しに含めるかどうかを決定することはできませんし、ウォーターフォールを導入せずに`c`が実際に`serverLoader`呼び出しを行う（または返す）まで遅らせることもできません。

したがって、`clientLoader`をエクスポートするルートはシングルフェッチをオプトアウトし、`serverLoader`を呼び出すと、そのルートのサーバー`loader`のみを取得するためのシングルフェッチが行われます。`clientLoader`をエクスポートしないすべてのルートは、単一のHTTPリクエストでフェッチされます。

したがって、上記のルート設定では、`/ -> /a/b/c`へのナビゲーションにより、ルート`a`と`b`に対して最初に単一のシングルフェッチ呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/a,routes/b
```

そして、`c`が`serverLoader`を呼び出すと、`c`のサーバー`loader`に対して独自の呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/c
```

### リソースルート

シングルフェッチで使用される新しい[ストリーミング形式][streaming-format]のため、`loader`と`action`関数から返された生のJavaScriptオブジェクトは、`json()`ユーティリティを介して`Response`インスタンスに自動的に変換されなくなりました。代わりに、ナビゲーションデータロードでは、他のローダーデータと組み合わされ、`turbo-stream`レスポンスでストリーミングされます。

これは、個別にヒットすることを意図しており、常にRemix APIを介してヒットするとは限らないため、一意の[リソースルート][resource-routes]にとって興味深いジレンマをもたらします。他のHTTPクライアント（`fetch`、`cURL`など）からもアクセスできます。

リソースルートが内部Remix APIによって消費されることを意図している場合、`Date`や`Promise`インスタンスなどのより複雑な構造をストリーミングできるようにするために、`turbo-stream`エンコーディングを利用できるようにしたいと考えています。ただし、外部からアクセスする場合、より簡単に消費できるJSON構造を返す方がおそらく望ましいでしょう。したがって、v2で生のオブジェクトを返す場合、動作はわずかに曖昧です。`turbo-stream`または`json()`を介してシリアライズする必要がありますか？

後方互換性を容易にし、シングルフェッチfutureフラグの採用を容易にするために、Remix v2はRemix APIからアクセスされているか外部からアクセスされているかによってこれを処理します。将来、Remixでは、外部消費のために生のオブジェクトをストリーミングしたくない場合は、独自の[JSONレスポンス][returning-response]を返す必要があります。

シングルフェッチが有効になっているRemix v2の動作は次のとおりです。

- `useFetcher`などのRemix APIからアクセスする場合、生のJavaScriptオブジェクトは通常のローダーとアクションと同様に`turbo-stream`レスポンスとして返されます（これは、`useFetcher`がリクエストに`.data`サフィックスを追加するためです）。

- `fetch`や`cURL`などの外部ツールからアクセスする場合、v2の後方互換性のために、引き続き自動的に`json()`に変換されます。

  - この状況が発生したときに、Remixは非推奨の警告をログに記録します。
  - 必要に応じて、影響を受けるリソースルートハンドラーを更新して`Response`オブジェクトを返すことができます。
  - これらの非推奨の警告に対処することで、最終的なRemix v3へのアップグレードの準備がより適切になります。

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

以前は、Remixは`JSON.stringify`を使用してローダー/アクションデータをワイヤ上でシリアライズし、`defer`レスポンスをサポートするためにカスタムストリーミング形式を実装する必要がありました。

シングルフェッチでは、Remixは内部的に[`turbo-stream`][turbo-stream]を使用するようになり、ストリーミングのファーストクラスのサポートを提供し、JSONよりも複雑なデータを自動的にシリアライズ/デシリアライズできます。`BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL`などのデータ型は、`turbo-stream`を介して直接ストリーミングできます。`Error`のサブタイプも、クライアントでグローバルに利用可能なコンストラクターがある限りサポートされます（`SyntaxError`、`TypeError`など）。

シングルフェッチを有効にした後、コードをすぐに変更する必要があるかどうかは次のとおりです。

- ✅ `loader`/`action`関数から返された`json`レスポンスは引き続き`JSON.stringify`を介してシリアライズされるため、`Date`を返す場合、`useLoaderData`/`useActionData`から`string`を受け取ります。
- ⚠️ `defer`インスタンスまたは生のオブジェクトを返している場合、`turbo-stream`を介してシリアライズされるようになるため、`Date`を返す場合、`useLoaderData`/`useActionData`から`Date`を受け取ります。
  - 現在の動作（ストリーミング`defer`レスポンスを除く）を維持する場合は、既存の生のオブジェクトの戻り値を`json`でラップするだけです。

これは、ワイヤ上で`Promise`インスタンスを送信するために`defer`ユーティリティを使用する必要がなくなったことも意味します！生のオブジェクトのどこにでも`Promise`を含めて、`useLoaderData().whatever`で取得できます。必要に応じて`Promise`をネストすることもできますが、潜在的なUXへの影響に注意してください。

シングルフェッチを採用したら、`json`/`defer`の使用をアプリケーション全体で段階的に削除し、生のオブジェクトを返すことをお勧めします。

### ストリーミングタイムアウト

以前は、Remixにはデフォルトの[`entry.server.tsx`][entry-server]ファイルに組み込まれた`ABORT_TIMEOUT`という概念があり、Reactレンダラーを終了していましたが、保留中の遅延プロミスをクリーンアップするために特に何もしていませんでした。

Remixが内部的にストリーミングされるようになったため、`turbo-stream`処理をキャンセルし、保留中のプロミスを自動的に拒否し、それらのエラーをクライアントにストリーミングできます。デフォルトでは、これは4950ms後に発生します。これは、ほとんどの`entry.server.tsx`ファイルの現在の5000ms `ABORT_DELAY`よりもわずかに短い値です。Reactレンダラーを中止する前に、プロミスをキャンセルして、拒否をReactレンダラーを介してストリーミングする必要があるためです。

これは、`entry.server.tsx`から`streamTimeout`数値エクスポートをエクスポートすることで制御できます。Remixはこれを、`loader`/`action`からの保留中のPromiseを拒否するミリ秒数として使用します。この値をReactレンダラーを中止するタイムアウトから切り離すことをお勧めします。基礎となる拒否をストリーミングする時間があるように、常にReactタイムアウトをより高い値に設定する必要があります。

```tsx filename=app/entry.server.tsx lines=[1-2,32-33]
// Reject all pending promises from handler functions after 5 seconds
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

    // Automatically timeout the react renderer after 10 seconds
    setTimeout(abort, 10000);
  });
}
```

### 再検証

#### 通常のナビゲーション動作

より単純なメンタルモデルとドキュメントリクエストとデータリクエストの整合性に加えて、シングルフェッチのもう1つの利点は、より単純な（そしておそらくより良い）キャッシング動作です。一般的に、シングルフェッチは、以前の複数フェッチ動作と比較して、HTTPリクエストの回数が少なくなり、結果がより頻繁にキャッシュされる可能性があります。

キャッシュの断片化を減らすために、シングルフェッチはGETナビゲーションでのデフォルトの再検証動作を変更します。以前は、`shouldRevalidate`を介してオプトインしない限り、Remixは再利用された祖先ルートのローダーを再実行しませんでした。現在、Remixは`GET /a/b/c.data`のようなシングルフェッチリクエストの単純なケースでは、デフォルトでそれらを再実行します。`shouldRevalidate`関数または`clientLoader`関数がない場合、これがアプリの動作になります。

アクティブなルートのいずれかに`shouldRevalidate`または`clientLoader`を追加すると、`_routes`パラメーターを含む詳細なシングルフェッチ呼び出しがトリガーされ、実行するルートのサブセットが指定されます。

`clientLoader`が内部的に`serverLoader()`を呼び出す場合、古い動作と同様に、その特定のルートに対して個別のHTTP呼び出しがトリガーされます。

たとえば、`/a/b`にいて`/a/b/c`に移動する場合。

- `shouldRevalidate`関数または`clientLoader`関数が存在しない場合：`GET /a/b/c.data`
- すべてのルートにローダーがあるが、`routes/a`が`shouldRevalidate`を介してオプトアウトする場合：
  - `GET /a/b/c.data?_routes=root,routes/b,routes/c`
- すべてのルートにローダーがあるが、`routes/b`に`clientLoader`がある場合：
  - `GET /a/b/c.data?_routes=root,routes/a,routes/c`
  - そして、Bの`clientLoader`が`serverLoader()`を呼び出す場合：
    - `GET /a/b/c.data?_routes=routes/b`

この新しい動作がアプリケーションにとって最適でない場合、必要なシナリオで`false`を返す`shouldRevalidate`を親ルートに追加することで、ローダーを再検証しないという古い動作にオプトバックインできます。

別のオプションは、高価な親ローダー計算のためにサーバー側のキャッシュを利用することです。

#### 送信再検証動作

以前は、Remixはアクションの送信結果に関係なく、常にすべてのアクティブなローダーを再検証していました。[`shouldRevalidate`][should-revalidate]を介してルートごとに再検証をオプトアウトできました。

シングルフェッチでは、`action`が`4xx/5xx`ステータスコードを持つ`Response`を返し、またはスローした場合、Remixはデフォルトでローダーを再検証しません。`action`が`4xx/5xx` Responseではないものを返し、またはスローした場合、再検証動作は変更されません。ここの理由は、ほとんどの場合、`4xx`/`5xx` Responseを返す場合、実際にはデータを変更していないため、データを再読み込みする必要がないためです。

`4xx/5xx`アクションレスポンス後に1つ以上のローダーを再検証する場合は、[`shouldRevalidate`][should-revalidate]関数から`true`を返すことで、ルートごとに再検証をオプトインできます。必要に応じてアクションステータスコードに基づいて決定できる新しい`actionStatus`パラメーターも渡されます。

再検証は、呼び出されるローダーを制限するシングルフェッチHTTP呼び出しの`?_routes`クエリ文字列パラメーターを介して処理されます。つまり、詳細な再検証を行っている場合、要求されているルートに基づいてキャッシュの列挙が行われますが、すべての情報はURLにあるため、特別なCDN構成は必要ありません（これは、CDNが`Vary`ヘッダーを尊重する必要があるカスタムヘッダーを介して行われた場合とは異なります）。


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
[streaming-format]: #streaming-data-format
[undici-polyfill]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#undici
[undici]: https://github.com/nodejs/undici
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
[csp-nonce]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources
[merging-remix-and-rr]: https://remix.run/blog/merging-remix-and-react-router
[migration-guide]: #シングルフェッチを使用したルートの移行
[breaking-changes]: #破壊的変更
[revalidation]: #通常のナビゲーション動作
[action-revalidation]: #送信再検証動作
[start]: #シングルフェッチの有効化
[type-inference-section]: #型推論
[compatibility-flag]: https://developers.cloudflare.com/workers/configuration/compatibility-dates
[data-utility]: ../utils/data
[augment]: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
[streaming-nonce]: ./streaming#streaming-with-a-content-security-policy


