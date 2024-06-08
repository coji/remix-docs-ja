---
title: シングルフェッチ
---

# シングルフェッチ

<docs-warning>これは不安定なAPIであり、今後も変更され続ける可能性があります。本番環境では採用しないでください。</docs-warning>

シングルフェッチは、新しいデータのデータ読み込み戦略とストリーミング形式です。シングルフェッチを有効にすると、Remixはクライアント側の遷移時にサーバーに対して単一のHTTP呼び出しを行うようになり、複数のHTTP呼び出しを並行して行う（ローダーごとに1回）ことはありません。さらに、シングルフェッチでは、`Date`、`Error`、`Promise`、`RegExp`など、`loader`と`action`から裸のオブジェクトをダウンストリーム送信することもできます。

## 概要

Remixは、[`v2.9.0`][2.9.0]の[`future.unstable_singleFetch`][future-flags]フラグで、"シングルフェッチ"（[RFC][rfc]）のサポートを導入しました。これにより、この動作を選択できます。シングルフェッチは、[React Router v7][merging-remix-and-rr]でデフォルトになります。

シングルフェッチを有効にすることで、初期段階での労力を抑え、時間をかけて段階的にすべての破壊的変更を採用することができます。[シングルフェッチを有効にする][start]ために必要な最小限の変更を適用し、[移行ガイド][migration-guide]を使用してアプリケーションの段階的な変更を行うことで、[React Router v7][merging-remix-and-rr]へのスムーズで破壊的でないアップグレードを保証できます。

また、[破壊的変更][breaking-changes]も確認してください。特にシリアル化とステータス/ヘッダーの動作に関する、いくつかの根本的な動作変更について理解しておく必要があります。

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

シングルフェッチでは、[`undici`][undici]を`fetch`ポリフィルとして使用するか、Node 20+の組み込みの`fetch`を使用する必要があります。これは、`@remix-run/web-fetch`ポリフィルには存在しない、そこに利用可能なAPIに依存しているためです。詳細は、以下の2.9.0リリースノートの[Undici][undici-polyfill]セクションを参照してください。

- Node 20+を使用している場合は、`installGlobals()`への呼び出しを削除し、Nodeの組み込みの`fetch`（これは`undici`と同じです）を使用します。

- 独自サーバーを管理し、`installGlobals()`を呼び出している場合は、`undici`を使用するために`installGlobals({ nativeFetch: true })`を呼び出す必要があります。

  ```diff
  - installGlobals();
  + installGlobals({ nativeFetch: true });
  ```

- `remix-serve`を使用している場合は、シングルフェッチが有効になっていると自動的に`undici`が使用されます。

- miniflare/cloudflare workerをRemixプロジェクトで使用している場合は、[互換性フラグ][compatibility-flag]が`2023-03-01`以降に設定されていることを確認してください。

**3. ドキュメントレベルの`headers`実装を削除する（存在する場合）**

シングルフェッチが有効になっている場合は、[`headers`][headers]エクスポートは使用されなくなります。多くの場合、ローダーの`Response`インスタンスからヘッダーを再返却してドキュメントリクエストに適用していた可能性があり、その場合はエクスポートを削除するだけで、これらのRepsonseヘッダーがドキュメントリクエストに自動的に適用されます。`headers`関数でより複雑なロジックをドキュメントヘッダーに適用していた場合は、`loader`関数内の新しい[Responseスタブ][responsestub]インスタンスにそれらを移行する必要があります。

**4. `<RemixServer>`に`nonce`を追加する（CSPを使用している場合）**

`<RemixServer>`コンポーネントは、クライアント側でストリーミングデータを処理するインラインスクリプトをレンダリングします。[スクリプトのコンテンツセキュリティポリシー][csp]を[nonceソース][csp-nonce]とともに使用している場合は、`<RemixServer nonce>`を使用してnonceをこれらの`<script>`タグに渡すことができます。

**5. `renderToString`を置き換える（使用している場合）**

ほとんどのRemixアプリでは`renderToString`を使用していないと考えられますが、`entry.server.tsx`で使用するように選択した場合は、以下を読み進めてください。そうでなければ、この手順はスキップできます。

ドキュメントリクエストとデータリクエスト間の整合性を維持するために、`turbo-stream`も初期ドキュメントリクエストでデータを送信するための形式として使用されます。つまり、シングルフェッチを選択すると、アプリケーションでは[`renderToString`][rendertostring]を使用できなくなり、[`entry.server.tsx`][entry-server]で[`renderToPipeableStream`][rendertopipeablestream]または[`renderToReadableStream`][rendertoreadablestream]などのReactストリーミングレンダラーAPIを使用する必要があります。

これは、HTTPレスポンスをストリーミングする必要があるという意味ではありません。`renderToPipeableStream`の`onAllReady`オプションまたは`renderToReadableStream`の`allReady`プロミスを活用することで、引き続き一度に完全なドキュメントを送信することができます。

クライアント側では、ストリーミングされたデータは`Suspense`境界でラップされて配信されるため、クライアント側の[`hydrateRoot`][hydrateroot]呼び出しを[`startTransition`][starttransition]呼び出しでラップする必要があることも意味します。

## 破壊的変更

シングルフェッチには、いくつかの破壊的変更が導入されています。一部はフラグを有効にしたときにすぐに処理する必要があるもの、一部はフラグを有効にした後に段階的に処理できるものです。次のメジャーバージョンにアップグレードする前に、これらのすべてが処理されていることを確認する必要があります。

**すぐに処理する必要がある変更:**

- **廃止された`fetch`ポリフィル**: 古い`installGlobals()`ポリフィルはシングルフェッチでは機能しません。[undiciベースのポリフィル][undici-polyfill]を取得するには、ネイティブのNode 20の`fetch`APIを使用するか、カスタムサーバーで`installGlobals({ nativeFetch: true })`を呼び出す必要があります。
- **廃止された`headers`エクスポート**: [`headers`][headers]関数は、シングルフェッチが有効になっている場合は使用されなくなり、代わりに`loader` / `action`関数に渡される新しい`response`スタブが使用されます。

**時間をかけて処理する必要があることを理解しておくべき変更:**

- **[新しいストリーミングデータ形式][streaming-format]**: シングルフェッチは、[`turbo-stream`][turbo-stream]を介して新しいストリーミング形式を内部で使用します。これは、JSONよりも複雑なデータをストリーミングできることを意味します。
- **自動シリアル化なし**: `loader`と`action`関数から返された裸のオブジェクトは、もはや自動的にJSON`Response`に変換されず、ワイヤー上でそのままシリアル化されます。
- **タイプ推論の更新**: 最も正確なタイプ推論を得るためには、次の2つのことを行う必要があります。
  - `tsconfig.json`の`compilerOptions.types`配列の最後に`@remix-run/react/future/single-fetch.d.ts`を追加します。
  - ルートで`unstable_defineLoader`/`unstable_defineAction`を使用し始めます。
    - これは段階的に行うことができます。現在の状態では、ほとんどの場合、正確なタイプ推論が得られます。
- [**オプトインの`action`再検証**][action-revalidation]: `action`の`4xx`/`5xx` `Response`後の再検証は、オプトアウトではなく、オプトインになりました。

## シングルフェッチを使用した新しいルートの追加

シングルフェッチが有効になっている場合、より強力なストリーミング形式と[`response`スタブ][responsestub]を活用するルートを作成することができます。

<docs-info>適切なタイプ推論を得るためには、最初に`tsconfig.json`の`compilerOptions.types`配列の最後に`@remix-run/react/future/single-fetch.d.ts`を追加する必要があります。これについては、[タイプ推論セクション][type-inference-section]で詳しく説明します。</docs-info>

シングルフェッチでは、`BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL`などのデータ型をローダーから返すことができます。

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

現在ローダーから`Response`インスタンス（つまり、`json`/`defer`）を返している場合は、シングルフェッチの利点を活用するためにアプリケーションコードを変更する必要はありません。

ただし、将来的に[React Router v7][merging-remix-and-rr]にアップグレードする準備として、ルートごとに以下の変更を行うことをお勧めします。これは、ヘッダーとデータ型を更新しても何も壊れないことを検証する最も簡単な方法です。

### 型推論

シングルフェッチなしでは、`loader`または`action`から返されたプレーンなJavaScriptオブジェクトは自動的にJSONレスポンスにシリアル化されます（`json`を介して返された場合と同じです）。タイプ推論では、これが事実であると想定され、裸のオブジェクトの返却値は、JSONシリアル化された場合と同じように推論されます。

シングルフェッチでは、裸のオブジェクトは直接ストリーミングされるため、シングルフェッチを選択すると、組み込みのタイプ推論はもはや正確ではありません。たとえば、`Date`はクライアント側で文字列にシリアル化されると想定されます😕。

シングルフェッチを使用するときに適切なタイプを取得するには、`tsconfig.json`の`compilerOptions.types`配列に含めることができる、一連のタイプオーバーライドを用意しました。これにより、タイプがシングルフェッチの動作と一致するようになります。

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

🚨 シングルフェッチのタイプは、`types`内の他のRemixパッケージの後にあることを確認してください。これにより、既存のタイプをオーバーライドできます。

#### ローダー/アクション定義ユーティリティ

シングルフェッチを使用してローダーとアクションを定義する場合、タイプセーフティを高めるために、新しい`unstable_defineLoader`と`unstable_defineAction`ユーティリティを使用できます。

```ts
import { unstable_defineLoader as defineLoader } from "@remix-run/node";

export const loader = defineLoader(({ request }) => {
  //                                  ^? Request
});
```

これにより、引数のタイプが得られるだけでなく（`LoaderFunctionArgs`は廃止されます）、シングルフェッチと互換性のあるタイプを返していることも保証されます。

```ts
export const loader = defineLoader(() => {
  return { hello: "world", badData: () => 1 };
  //                       ^^^^^^^ タイプエラー: `badData`はシリアル化できません
});

export const action = defineAction(() => {
  return { hello: "world", badData: new CustomType() };
  //                       ^^^^^^^ タイプエラー: `badData`はシリアル化できません
});
```

シングルフェッチは、以下の返却タイプをサポートしています。

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

`defineClientLoader`/`defineClientAction`というクライアント側の同等のユーティリティもあります。これらは、`clientLoader`/`clientAction`から返されるデータはワイヤー上でシリアル化する必要がないため、同じ返却値の制限はありません。

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

<docs-info>これらのユーティリティは、主に`useLoaderData`とその同等のユーティリティに対するタイプ推論のためです。特定の`Response`を返し、Remix API（`useFetcher`など）では使用されないリソースルートがある場合は、通常の`loader`/`action`定義のままにすることができます。これらのルートを`defineLoader`/`defineAction`を使用して変換すると、`turbo-stream`は`Response`インスタンスをシリアル化できないため、タイプエラーが発生します。</docs-info>

#### `useLoaderData`、`useActionData`、`useRouteLoaderData`、`useFetcher`

これらのメソッドは、コードの変更を必要としません。シングルフェッチのタイプを追加すると、ジェネリックが正しく逆シリアル化されます。

```ts
export const loader = defineLoader(async () => {
  const data = await fetchSomeData();
  return {
    message: data.message, // <- string
    date: data.date, // <- Date
  };
});

export default function Component() {
  // ❌ シングルフェッチの前は、タイプはJSON.stringifyを介してシリアル化されていました。
  const data = useLoaderData<typeof loader>();
  //    ^? { message: string, date: string }

  // ✅ シングルフェッチでは、タイプはturbo-streamを介してシリアル化されます。
  const data = useLoaderData<typeof loader>();
  //    ^? { message: string, date: Date }
}
```

#### `useMatches`

`useMatches`では、手動でキャストしてローダータイプを指定する必要があります。これにより、`match.data`に対する適切なタイプ推論が得られます。シングルフェッチを使用する場合は、`UIMatch`タイプを`UIMatch_SingleFetch`に置き換える必要があります。

```diff
  let matches = useMatches();
- let rootMatch = matches[0] as UIMatch<typeof loader>;
+ let rootMatch = matches[0] as UIMatch_SingleFetch<typeof loader>;
```

#### `meta`関数

`meta`関数も、現在のルートローダーと祖先ルートローダーのタイプを示すジェネリックを必要とし、これにより`data`と`matches`パラメーターが正しく型付けされます。シングルフェッチを使用する場合は、`MetaArgs`タイプを`MetaArgs_SingleFetch`に置き換える必要があります。

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

[`headers`][headers]関数は、シングルフェッチが有効になっている場合は使用されなくなります。
代わりに、`loader` / `action`関数には、その実行に固有の変更可能な`ResponseStub`が渡されます。

- HTTPレスポンスのステータスを変更するには、`status`フィールドを直接設定します。
  - `response.status = 201`
- HTTPレスポンスのヘッダーを設定するには、標準の[`Headers`][mdn-headers]APIを使用します。
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

各`loader`/`action`には、それぞれ固有の`response`インスタンスが渡されるため、他の`loader`/`action`関数で設定された内容を確認することはできません（これは競合状態が発生する可能性があります）。結果として得られるHTTPレスポンスのステータスとヘッダーは、以下のように決定されます。

- ステータスコード
  - すべてのステータスコードが設定されていないか、値が<300の場合は、最も深いステータスコードがHTTPレスポンスに使用されます。
  - すべてのステータスコードが設定されているか、値が>=300の場合は、最も浅い>=300の値がHTTPレスポンスに使用されます。
- ヘッダー
  - Remixはヘッダー操作を追跡し、すべてのハンドラーが完了した後に新しい`Headers`インスタンスでそれらを再生します。
  - これらは、順序どおりに、最初にアクション（存在する場合）、次に上から下にローダーの順で再生されます。
  - 子ハンドラーの`headers.set`は、親ハンドラーの値を上書きします。
  - `headers.append`を使用すると、親ハンドラーと子ハンドラーの両方から同じヘッダーを設定できます。
  - `headers.delete`を使用すると、親ハンドラーで設定された値を削除できますが、子ハンドラーで設定された値を削除することはできません。

シングルフェッチは裸のオブジェクトの返却をサポートしており、ステータス/ヘッダーを設定するために`Response`インスタンスを返す必要がなくなったため、`json`/`redirect`/`redirectDocument`/`defer`ユーティリティは、シングルフェッチを使用する場合は廃止されているとみなしてください。これらはv2の間は残りますが、すぐに削除する必要はありません。次のメジャーバージョンでは、おそらく削除されるため、できるだけ早く段階的に削除することをお勧めします。

これらのユーティリティは、Remix v2の残りの期間は引き続き使用できます。今後のバージョンでは、[`remix-utils`][remix-utils]などのものから利用できるようになる可能性があります（または、自分で簡単に再実装することもできます）。

v2では、引き続き通常の`Response`インスタンスを返すことができ、`response`スタブと同じ方法でステータスコードが適用され、すべてのヘッダーが`headers.set`を介して適用され、親からの同じ名前のヘッダーの値は上書きされます。ヘッダーを追加する必要がある場合は、`Response`インスタンスを返すことから、新しい`response`パラメーターを使用するように切り替える必要があります。

これらの機能を段階的に採用できるようにするために、シングルフェッチを有効にしても、すべての`loader`/`action`関数を変更して`response`スタブを利用する必要はありません。その後、時間をかけて個々のルートを段階的に変換して、新しい`response`スタブを利用することができます。

### クライアントローダー

アプリケーションで[`clientLoader`][client-loader]関数を使用するルートがある場合は、シングルフェッチの動作がわずかに変化することに注意することが重要です。`clientLoader`は、サーバーの`loader`関数の呼び出しをオプトアウトする方法を提供することを目的としているため、シングルフェッチの呼び出しでそのサーバーローダーを実行することは正しくありません。しかし、すべてのローダーは並行して実行され、どの`clientLoader`が実際にサーバーデータを求めているかを知るまでは、その呼び出しを待つべきではありません。

たとえば、以下の`/a/b/c`ルートを考えてみましょう。

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

ユーザーが`/ -> /a/b/c`にナビゲートする場合、`a`と`b`のサーバーローダーと`c`の`clientLoader`を実行する必要があります。これは最終的に（またはそうでなければ）独自のサーバー`loader`を呼び出す可能性があります。`c`のサーバー`loader`を`a`/`b`の`loader`を取得するためのシングルフェッチ呼び出しに含めるかどうかを決定することはできませんし、ウォーターフォールを導入せずに`c`が実際に`serverLoader`呼び出しを行ったり（または返したり）するまで遅らせることもできません。

したがって、`clientLoader`をエクスポートするルートは、シングルフェッチをオプトアウトし、`serverLoader`を呼び出すと、そのルートのサーバー`loader`のみを取得するための単一のフェッチが行われます。`clientLoader`をエクスポートしないすべてのルートは、単一のHTTPリクエストでフェッチされます。

したがって、上記のルート設定で`/ -> /a/b/c`にナビゲートすると、最初に`a`と`b`のルートに対して単一のシングルフェッチ呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/a,routes/b
```

そして、`c`が`serverLoader`を呼び出すと、`c`のサーバー`loader`だけを取得するための独自の呼び出しが行われます。

```
GET /a/b/c.data?_routes=routes/c
```

### リソースルート

シングルフェッチで使用される新しい[ストリーミング形式][streaming-format]により、`loader`と`action`関数から返される生のJavaScriptオブジェクトは、もはや`json()`ユーティリティを介して自動的に`Response`インスタンスに変換されなくなりました。代わりに、ナビゲーションデータの読み込みでは、他のローダーデータと結合され、`turbo-stream`レスポンスでダウンストリーム送信されます。

これは、個別にヒットすることを目的とした[リソースルート][resource-routes]にとっては興味深いジレンマです。これは、常にRemix APIを介するとは限りません。また、他のHTTPクライアント（`fetch`、`cURL`など）からもアクセスできます。

リソースルートが内部のRemix APIで消費されることを目的としている場合は、より複雑な構造（`Date`や`Promise`インスタンスなど）をストリーミングダウンできるように、`turbo-stream`エンコーディングを活用したいと考えています。しかし、外部からアクセスされる場合は、より簡単に消費できるJSON構造を返す方が良いでしょう。したがって、生のオブジェクトをv2で返す場合、動作は少し曖昧です。`turbo-stream`と`json()`のどちらでシリアル化する必要がありますか？

Remix v2では、後方互換性を維持し、シングルフェッチの未来のフラグの採用を容易にするために、Remix APIからアクセスされる場合と外部からアクセスされる場合で動作が異なります。将来的には、Remixでは、外部からアクセスされる場合に生のオブジェクトをストリーミングダウンしたくない場合は、独自の[JSONレスポンス][returning-response]を返す必要があります。

シングルフェッチが有効になっている場合のRemix v2の動作は次のとおりです。

- `useFetcher`などのRemix APIからアクセスする場合、生のJavaScriptオブジェクトは、通常のローダーとアクションと同様に`turbo-stream`レスポンスとして返されます（これは、`useFetcher`がリクエストに`.data`サフィックスを追加するためです）。

- `fetch`や`cURL`などの外部ツールからアクセスする場合、v2の後方互換性を維持するために、引き続き自動的に`json()`に変換されます。

  - Remixはこの状況が発生すると、廃止予定の警告をログに記録します。
  - 必要に応じて、影響を受けるリソースルートハンドラーを更新して、`Response`オブジェクトを返すことができます。
  - これらの廃止予定の警告に対処することで、今後のRemix v3へのアップグレードの準備が整います。

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

注: 特定の`Response`インスタンスを返す必要がある外部からアクセスされるリソースルートに`defineLoader`/`defineAction`を使用することはお勧めしません。これらの場合は、`loader`/`LoaderFunctionArgs`を使用することをお勧めします。

#### レスポンススタブとリソースルート

上記のように、[`headers`][headers]エクスポートは廃止され、代わりに`loader`と`action`関数に渡される新しい[`response`スタブ][responsestub]が使用されます。これは、リソースルートではやや混乱する可能性がありますが、これは、実際には"スタブ"の概念が必要ないためです。複数のローダーの結果を単一のレスポンスにマージする必要がないからです。

```tsx filename=app/routes/resource.tsx
// 独自のリソースを使用するのが最も簡単な方法です。
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

一貫性を保つために、リソースルートの`loader`/`action`関数には引き続き`response`スタブが渡されます。必要に応じて使用できます（非リソースルートハンドラー間でコードを共有する場合など）。

```tsx filename=app/routes/resource.tsx
// しかし、responseスタブで値を設定することもできます。
export async function loader({
  response,
}: LoaderFunctionArgs) {
  const data = await getData();
  response?.status = 200;
  response?.headers.set("X-Custom", "whatever");
  return Response.json(data);
}
```

`response`スタブと、カスタムステータス/ヘッダーを持つ`Response`を返すのを避けるのが最善ですが、そうした場合、以下のロジックが適用されます。

- `Response`インスタンスのステータスは、`response`スタブのステータスよりも優先されます。
- `response`スタブの`headers`に対するヘッダー操作は、返された`Response`のヘッダーインスタンスに再適用されます。

## その他の詳細

### ストリーミングデータ形式

以前は、Remixは`JSON.stringify`を使用してローダー/アクションのデータをワイヤー上でシリアル化していました。また、`defer`レスポンスをサポートするためにカスタムのストリーミング形式を実装する必要がありました。

シングルフェッチでは、Remixは内部で[`turbo-stream`][turbo-stream]を使用するようになりました。これは、ストリーミングをファーストクラスでサポートし、JSONよりも複雑なデータを自動的にシリアル化/逆シリアル化することができます。`BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL`などのデータ型は、`turbo-stream`を介して直接ストリーミングダウンできます。`Error`のサブタイプも、クライアントにグローバルに利用可能なコンストラクターがある場合はサポートされます（`SyntaxError`、`TypeError`など）。

シングルフェッチを有効にしたときにコードを変更する必要があるかどうかは、以下のとおりです。

- ✅ `loader`/`action`関数から返された`json`レスポンスは引き続き`JSON.stringify`を介してシリアル化されるため、`Date`を返すと、`useLoaderData`/`useActionData`から`string`が受け取られます。
- ⚠️ `defer`インスタンスまたは裸のオブジェクトを返している場合は、`turbo-stream`を介してシリアル化されるようになりました。そのため、`Date`を返すと、`useLoaderData`/`useActionData`から`Date`が受け取られます。
  - 現在の動作（ストリーミングされた`defer`レスポンスを除く）を維持する場合は、既存の裸のオブジェクトの返却値を`json`でラップするだけです。

これは、`Promise`インスタンスをワイヤー上で送信するために`defer`ユーティリティを使用する必要がなくなったことも意味します！`Promise`は裸のオブジェクトのどこにでも含めることができ、`useLoaderData().whatever`で取得することができます。必要に応じて`Promise`をネストすることもできますが、UXへの影響に注意してください。

シングルフェッチを採用したら、`json`/`defer`の使用を段階的に削除し、生のオブジェクトを返すようにすることをお勧めします。

### ストリーミングタイムアウト

以前は、Remixには、デフォルトの[`entry.server.tsx`][entry-server]ファイルに組み込まれた`ABORT_TIMEOUT`という概念があり、Reactレンダラーを終了していましたが、保留中の遅延プロミスをクリーンアップする特別なことは行いませんでした。

Remixが内部でストリーミングするようになったため、`turbo-stream`処理をキャンセルし、保留中のプロミスを自動的に拒否し、それらのエラーをクライアントにストリーミングアップすることができます。デフォルトでは、これは4950ミリ秒後に発生します。これは、ほとんどのentry.server.tsxファイルの現在の5000ミリ秒の`ABORT_DELAY`よりわずかに小さい値で、プロミスをキャンセルし、React側の処理を中止する前に、拒否をReactレンダラーを介してストリーミングアップする必要があるためです。

これは、`entry.server.tsx`から`streamTimeout`という数値をエクスポートすることで制御できます。Remixはこの値を、`loader`/`action`の保留中のプロミスを拒否するミリ秒数として使用します。この値は、Reactレンダラーを中止するタイムアウトとは切り離しておくことをお勧めします。また、Reactのタイムアウトを常に高い値に設定しておく必要があります。これにより、`streamTimeout`から基礎となる拒否をストリーミングダウンする時間があります。

```tsx filename=app/entry.server.tsx lines=[1-2,32-33]
// ハンドラー関数の保留中のすべてのプロミスを5秒後に拒否します。
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

    // Reactレンダラーを10秒後に自動的にタイムアウトします。
    setTimeout(abort, 10000);
  });
}
```

### 再検証

以前は、Remixはすべての`action`送信後に、アクティブなすべてのローダーを再検証していました。これは、`action`の結果に関係なく行われていました。[`shouldRevalidate`][should-revalidate]を使用して、ルートごとに再検証をオプトアウトすることができました。

シングルフェッチでは、`action`が`4xx/5xx`ステータスコードを持つ`Response`を返し、またはスローした場合、Remixはデフォルトではローダーを再検証しません。`action`が`4xx/5xx`レスポンスではないものを返し、またはスローした場合、再検証の動作は変更されません。ここでの理由は、ほとんどの場合、`4xx`/`5xx`レスポンスを返す場合、実際にはデータを変更していないため、データを再読み込みする必要がないからです。

`4xx/5xx`アクションレスポンス後に、1つ以上のローダーを再検証する必要がある場合は、[`shouldRevalidate`][should-revalidate]関数から`true`を返すことで、ルートごとに再検証をオプトインすることができます。また、`action`のステータスコードに基づいて決定する必要がある場合は、関数に渡される新しい`unstable_actionStatus`パラメーターもあります。

再検証は、シングルフェッチのHTTP呼び出しの`?_routes`クエリ文字列パラメーターを介して処理され、呼び出されるローダーが制限されます。つまり、細かい再検証を行う場合、リクエストされているルートに基づいてキャッシュ列挙が行われます。ただし、すべての情報はURLに含まれているため、特別なCDN構成は不要です（これはカスタムヘッダーを介して行われた場合とは異なり、CDNで`Vary`ヘッダーを尊重する必要がありました）。

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
[returning-response]: ../route/loader.md#returning-response-instances
[responsestub]: #headers
[streaming-format]: #streaming-data-format
[undici-polyfill]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#undici
[undici]: https://github.com/nodejs/undici
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
[csp-nonce]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources
[remix-utils]: https://github.com/sergiodxa/remix-utils
[merging-remix-and-rr]: https://remix.run/blog/merging-remix-and-react-router
[migration-guide]: #migrating-a-route-with-single-fetch
[breaking-changes]: #breaking-changes
[action-revalidation]: #streaming-data-format
[start]: #enabling-single-fetch
[type-inference-section]: #type-inference
[compatibility-flag]: https://developers.cloudflare.com/workers/configuration/compatibility-dates

