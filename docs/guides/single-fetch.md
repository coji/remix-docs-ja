---
title: シングルフェッチ
---

# シングルフェッチ

<docs-warning>このAPIは不安定で今後も変更される可能性があります。本番環境での採用は避けてください</docs-warning>

シングルフェッチは新しいデータロード戦略とストリーミングフォーマットです。シングルフェッチを有効にすると、Remixは通常のようにコンポーネントごとに個別のHTTPリクエストを行うのではなく、クライアント側の遷移時に単一のHTTPリクエストを行います。さらに、シングルフェッチではローダーやアクションから生の(シリアル化されていない)オブジェクト、例えば`Date`、`Error`、`Promise`、`RegExp`などを返せるようになりました。

## シングルフェッチの有効化

Remix は [`future.unstable_singleFetch`][future-flags] フラグを使って、[`v2.9.0`][2.9.0]からこの "シングルフェッチ" ([RFC][rfc])を導入し、この動作を選択できるようになりました。シングルフェッチはやがて[React Router v7][merging-remix-and-rr]のデフォルトになる予定です。

シングルフェッチの有効化は非常に簡単です。現在ローダーから`Response`インスタンスを返している (つまり`json`/`defer`を使っている) 場合、アプリケーションコードにほとんど変更を加える必要はありませんが、以下の "breaking" 変更について知っておいてください - 特にシリアル化や状態/ヘッダーの動作に関する変更です。

**1. フューチャーフラグを有効化**

```diff
  remix({
    future: {
      // ...
+     unstable_singleFetch: true,
    },
  }),
```

**2. `installGlobals`を更新または削除**

シングルフェッチでは、`fetch`ポリフィルとして[`undici`][undici]を使う必要があるか、Node 20以降の組み込み`fetch`を使う必要があります。これは、`@remix-run/web-fetch`ポリフィルにない API に依存しているためです。詳細については、以下の[Undici][undici-polyfill]セクションをご覧ください。

- Node 20以降の場合は`installGlobals()`を削除し、Node組み込みの`fetch`を使ってください (これは`undici`と同じです)。

- 独自のサーバーを使っていて`installGlobals()`を呼び出している場合は、`installGlobals({ nativeFetch: true })`と呼び出す必要があります。

  ```diff
  - installGlobals()
  + installGlobals({ nativeFetch: true })
  ```

- `remix-serve`を使っている場合は、シングルフェッチが有効な時に自動的に`undici`を使います。

**3. `renderToString`を置き換え**

ほとんどのRemixアプリではおそらく`renderToString`を使っていないと思いますが、`entry.server.tsx`で使っている場合は続きを読んでください。それ以外は飛ばしてください。

ドキュメントとデータリクエストの一貫性を維持するために、[`turbo-stream`][turbo-stream]もドキュメントの初期リクエストでデータを送信するフォーマットとして使用されます。これは、シングルフェッチに切り替えると、アプリケーションは`renderToString`を使えなくなり、[`renderToPipeableStream`][rendertopipeablestream]や[`renderToReadableStream`][rendertoreadablestream]などのReactストリーミングレンダラーAPIを使う必要があります。[`entry.server.tsx`][entry-server]

これは、HTTPレスポンスをストリーミングする必要があることを意味しているわけではありません。`renderToPipeableStream`の`onAllReady`オプションや`renderToReadableStream`の`allReady`プロミスを利用して、一度にフル文書を送信することができます。

クライアント側では、ストリームされたデータが `Suspense`境界でラップされるため、クライアントサイドの `hydrateRoot`呼び出しを `startTransition`呼び出しで囲む必要があります。

## 破壊的変更

先述のとおり、ローダーから`Response`インスタンスを返している (つまり`json`/`defer`を使っている) 場合、アプリケーションコードにほとんど変更を加える必要はありません。より良い型推論を得て、React Router v7に備えるには、[ルートを一つずつ移行][migration-guide]することができます。

シングルフェッチが導入する重要な破壊的変更がいくつかあります:

- **[新しいストリーミングデータフォーマット][streaming-format]**: シングルフェッチは、内部で[`turbo-stream`][turbo-stream]を使う新しいストリーミングフォーマットを使用しており、単なるJSONだけでなく、より複雑なデータをストリーミングできるようになりました
- **自動シリアル化の廃止**: `loader`および`action`関数から返された生のオブジェクトは、もはずJSON`Response`に自動的に変換されず、そのままネットワーク経由で送信されます
- **型推論の更新**: 最も正確な型推論を得るには、次の2つのことを行う必要があります:
  - `tsconfig.json`の`compilerOptions.types`配列の末尾に`@remix-run/react/future/single-fetch.d.ts`を追加する
  - ルートで`unstable_defineLoader`/`unstable_defineAction`の使用を開始する
    - これは段階的に行えます - 現在の状態でも、ほとんど正確な型推論が得られます
- [**オプトイン`action`の再検証**][action-revalidation]: `4xx`/`5xx`の`Response`を返すアクションの再検証がオプトアウトからオプトインに変更されました
- **非推奨の`headers`エクスポート**: シングルフェッチが有効な場合、ローダーやアクション関数に渡される新しい`response`スタブに置き換えられ、[`headers`][headers]関数は使用されなくなりました
- **非推奨の`fetch`ポリフィル**: 以前の`installGlobals()`ポリフィルはシングルフェッチでは機能しません。代わりにNode 20の組み込み`fetch` APIを使うか、[undici ベースのポリフィル][undici-polyfill]を使うために`installGlobals({ nativeFetch: true })`を呼び出す必要があります

## シングルフェッチを使った新しいルートの追加

シングルフェッチを有効にすると、より強力なストリーミングフォーマットと`response`スタブを活用するルートを作成できます。

<docs-info>適切な型推論を得るには、まず`tsconfig.json`の`compilerOptions.types`配列の末尾に`@remix-run/react/future/single-fetch.d.ts`を追加する必要があります。これについては[型推論のセクション][type-inference-section]で詳しく説明しています。</docs-info>

シングルフェッチでは、ローダーから次のデータ型を返すことができます: `BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL`。

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

## シングルフェッチへの移行

以下の変更は、シングルフェッチを利用するために必要というわけではありません (開始するには[シングルフェッチの有効化][start]を参照してください)。ヘッダーやデータ型の変更を確認しやすいように、ルートごとにこれらの変更を行うことをお勧めします。

これらの変更を行うことで、React Router v7への円滑で破壊的ではないアップグレードが可能になります。

### 型推論

シングルフェッチ無しの場合、`loader`や`action`から返されるすべての単純Javascriptオブジェクトは自動的にJSON応答にシリアル化されます (あたかも`json`で返したかのように)。型推論はこのようなケースを前提としており、生のオブジェクトの返却を JSON シリアライズされたものと推論します。

シングルフェッチを使用すると、生のオブジェクトは直接ストリーミングされるため、シングルフェッチに切り替えた後の組み込みの型推論は正確ではなくなります。例えば、`Date`がクライアントでは文字列としてシリアル化されると推論してしまいます 😕。

シングルフェッチを使用する際に適切な型を得るために、`tsconfig.json`の`compilerOptions.types`配列に型オーバーライドセットを含めることができます。これにより、シングルフェッチの動作に合わせて型がアラインされます:

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

🚨 single-fetchの型が他のRemixパッケージの型より前に来るようにしてください。そうしないと上書きされません。

#### ローダー/アクション定義ユーティリティ

シングルフェッチでローダーとアクションを定義する際のタイプセーフティを高めるために、新しい`unstable_defineLoader`と`unstable_defineAction`ユーティリティを使うことができます:

```ts
import { unstable_defineLoader as defineLoader } from "@remix-run/node";

export const loader = defineLoader(({ request }) => {
  //                                  ^? Request
});
```

これにより、引数の型が得られるだけでなく、シングルフェッチ対応の型を返していることも確認されます:

```ts
export const loader = defineLoader(() => {
  return { hello: "world", badData: () => 1 };
  //                       ^^^^^^^ エラー: `badData`はシリアライズ可能ではありません
});

export const action = defineAction(() => {
  return { hello: "world", badData: new CustomType() };
  //                       ^^^^^^^ エラー: `badData`はシリアライズ可能ではありません
});
```

シングルフェッチでサポートされる返却型は以下のとおりです:

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

クライアント側の`defineClientLoader`/`defineClientAction`にも同様の機能がありますが、ネットワーク経由でシリアル化する必要がないため、返り値の制限はありません:

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

<docs-info>これらのユーティリティは主に`useLoaderData`とその相当物の型推論のためのものです。`Response`を返しているリソースルートで、Remix API(`useFetcher`など)によって消費されていない場合は、通常の`loader`/`action`定義を続けることができます。これらのルートを`defineLoader`/`defineAction`に変換すると、`turbo-stream`がResponse インスタンスをシリアル化できないため、型エラーが発生します。</docs-info>

#### `useLoaderData`、`useActionData`、`useRouteLoaderData`、`useFetcher`

これらのメソッドはコードの変更は不要です - シングルフェッチの型を追加するだけで、正しくデシリアライズされるようになります:


```ts
export const loader = defineLoader(async () => {
  const data = await fetchSomeData();
  return {
    message: data.message, // <- string
    date: data.date, // <- Date
  };
});

export default function Component() {
  // ❌ シングルフェッチ前は、型はJSON.stringifyでシリアル化されていました
  const data = useLoaderData<typeof loader>();
  //    ^? { message: string, date: string }

  // ✅ シングルフェッチ使用後は、型はturbo-streamでシリアル化されます
  const data = useLoaderData<typeof loader>();
  //    ^? { message: string, date: Date }
}
```

#### `useMatches`

`useMatches`では、ある`match.data`の型推論を得るために、手動でキャストする必要があります。シングルフェッチを使う場合は、`UIMatch`型を`UIMatch_SingleFetch`に置き換える必要があります:

```diff
  let matches = useMatches();
- let rootMatch = matches[0] as UIMatch<typeof loader>;
+ let rootMatch = matches[0] as UIMatch_SingleFetch<typeof loader>;
```

#### `meta`関数

`meta`関数では、現在のルートとそのひいき先のルートのローダー型を示すジェネリックを指定する必要があります。これにより、`data`と`matches`パラメータを適切に型付けできます。シングルフェッチを使う場合は、`MetaArgs`型を`MetaArgs_SingleFetch`に置き換える必要があります:

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

シングルフェッチが有効な場合、[`headers`][headers]関数は使用されなくなりました。
代わりに、`loader`/`action`関数に固有の変更可能な`ResponseStub`が渡されます:

- HTTPレスポンスのステータスを変更するには、`status`フィールドに直接設定します:
  - `response.status = 201`
- HTTPレスポンスのヘッダーを設定するには、標準の [`Headers`][mdn-headers] APIを使います:
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

これらのレスポンススタブをスローすることで、ローダーやアクションの実行フローを短絡させることもできます:

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

それぞれの`loader`/`action`には固有の`response`インスタンスが渡されるので、他の`loader`/`action`関数が設定したものを見ることはできません(これはレースコンディションの原因となります)。最終的なHTTPレスポンスのステータスとヘッダーは以下のように決まります:

- ステータスコード
  - すべてのステータスコードが未設定または300未満の場合は、最も深いステータスコードが使用されます
  - 300以上のステータスコードが設定された場合は、最も浅い300以上の値が使用されます
- ヘッダー
  - Remixはヘッダー操作を追跡し、すべてのハンドラー完了後に新しい`Headers`インスタンスに再生します
  - これらは順番に再生されます - アクションファーストで、その後トップダウン順にローダー
  - 任意の子ハンドラーでの`headers.set`は、親ハンドラーの値を上書きします
  - `headers.append`を使うと、親と子の両方からヘッダーを設定できます
  - `headers.delete`を使うと、親ハンドラーで設定された値は削除できますが、子ハンドラーで設定された値は削除できません

シングルフェッチは生のオブジェクトの返却をサポートし、ステータス/ヘッダーを設定するために`Response`インスタンスを返す必要がなくなったため、`json`/`redirect`/`redirectDocument`/`defer`ユーティリティはシングルフェッチ使用時には非推奨とみなされます。これらはv2の期間中は残りますので、すぐに削除する必要はありません。次のメジャーバージョンでは恐らく削除されると思われますので、その間に段階的に削除するのがよいでしょう。

これらのユーティリティは Remix v2 の残りの期間中も存続し、将来的には[`remix-utils`][remix-utils]のようなものに移動されるか、簡単に自分で再実装できるようになるでしょう。

v2では、通常の`Response`インスタンスを返し続けることができ、ステータスコードは`response`スタブと同じように適用され、すべてのヘッダーは`headers.set`で適用されます - 親から同名のヘッダー値を上書きします。ヘッダーを追加する必要がある場合は、`Response`インスタンスを返す代わりに新しい`response`パラメータを使う必要があります。

これらの機能を段階的に採用できるように、`loader`/`action`関数全てを`response`スタブを利用するように変更する必要はなく、シングルフェッチを有効にできるようにすることが目標です。その後、個別のルートを段階的に新しい`response`スタブを利用するように変更していくことができます。

### クライアントローダー

アプリに[`clientLoader`][client-loader]機能を持つルートがある場合、シングルフェッチの動作がわずかに変わることに注意が必要です。`clientLoader`はサーバーの`loader`関数を呼び出さずにすむようにするためのものですが、シングルフェッチの呼び出しでは、その server loader を実行するのは正しくありません。しかし、すべてのローダーを並列に実行し、どの`clientLoader`が実際にサーバーデータを要求するかを待つわけにはいきません。

例えば、次のような `/a/b/c` ルートを考えてみましょう:

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

ユーザーが`/ -> /a/b/c`と遷移した場合、`a`と`b`のサーバーローダーを実行し、`c`のクライアントローダーを実行する必要があります。このクライアントローダーは最終的に (あるいは最終的にではない) 自身のサーバーローダーを呼び出す可能性があります。シングルフェッチのコールに`c`のサーバーローダーを含めるか、`c`が実際にサーバーローダーの呼び出し (または返却) を待つまで遅延させるかを決めるのは、ウォーターフォールを導入してしまうため難しいです。

したがって、`clientLoader`をエクスポートしているルートはシングルフェッチから外れ、`serverLoader`を呼び出す際はそのルートのサーバーローダーのみを取得するため、単一のフェッチになります。`clientLoader`をエクスポートしていないすべてのルートは、単一のHTTPリクエストでフェッチされます。

上記のルート設定で`/ -> /a/b/c`に遷移すると、最初に`a`と`b`のルートについての単一のフェッチコールが行われます:

```
GET /a/b/c.data?_routes=routes/a,routes/b
```

そして`c`が`serverLoader`を呼び出すときに、`c`のサーバーローダーについての個別のコールが行われます:

```
GET /a/b/c.data?_routes=routes/c
```

### リソースルート

[ストリーミングフォーマット][streaming-format]の変更により、`loader`と`action`関数から返された生のJavaScriptオブジェクトは、もはや`json()`ユーティリティ経由での`Response`インスタンスへの自動変換は行われません。代わりに、Remix APIによる操縦的なデータロードでは、他のローダーデータと組み合わされて`turbo-stream`レスポンスでストリーミングされます。

これは[リソースルート][resource-routes]に対して興味深い問題を提起します。リソースルートは、Remix APIを通じてのみアクセスされることを前提としていないからです。他のHTTPクライアント(`fetch`、`cURL`など)からもアクセスできます。

リソースルートがRemix内部APIによって消費されることを意図している場合、`turbo-stream`エンコーディングを活用して、`Date`や`Promise`インスタンスなどの複雑な構造をストリーミングダウンできるようにしたいです。一方で、外部からアクセスされた場合は、より簡単に使えるJSONストラクチャーを返したい可能性があります。したがって、v2でオブジェクトを直接返すとどのように扱うべきか微妙な点があります - `turbo-stream`でシリアル化するべきか、それとも`json()`でシリアル化するべきか?

下位互換性を確保し、シングルフェッチの将来のフラグの採用を容易にするために、Remix v2ではアクセス元(Remix API or 外部)によって動作が変わることにしました。今後のVersionでは、生のオブジェクトをストリーミングダウンしたくない場合は、自分で[JSONレスポンス][returning-response]を返す必要があります。

Remix v2のシングルフェッチ有効時の動作は以下の通りです:

- Remix API(例えば`useFetcher`)からアクセスする場合、生のJavaScriptオブジェクトは通常のローダーやアクションと同様に`turbo-stream`レスポンスで返されます(これは`useFetcher`が`.data`サフィックスをリクエストに付加するためです)

- `fetch`や`cURL`などの外部ツールからアクセスする場合、v2の下位互換性のため、引き続き自動的に`json()`に変換されます:

  - この場合、Remixがデプリケーション警告をログに出します
  - ご都合の良い時に、影響を受けたリソースルートのハンドラーを`Response`オブジェクトを返すように更新してください
  - これらのデプリケーション警告に対処することで、最終的なRemix v3アップグレードの準備が整います

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

注意: 外部からアクセスされるリソースルートで特定の`Response`インスタンスを返す必要がある場合、`defineLoader`/`defineAction`の使用は推奨されません。`loader`/`LoaderFunctionArgs`を使い続けるのがベストです。

#### Responseスタブとリソースルート

上述のとおり、`headers`エクスポートは、`loader`および`action`関数に渡される新しい[`response`スタブ][responsestub]に置き換えられました。ただし、リソースルートでは少し混乱しやすいかもしれません。なぜなら、実際の`Response`を返すことができるので、複数のローダーの結果をマージする必要がないため、"スタブ"の概念はそれほど必要ありません:

```tsx filename=app/routes/resource.tsx
// 自分で`Response`を使うのが最も簡単な方法
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

一貫性を保つために、リソースルートの`loader`/`action`関数にも`response`スタブが渡されるので、必要に応じてそれを使うことができます(例えば、非リソースルートのハンドラーと共有するコードがある場合など):

```tsx filename=app/routes/resource.tsx
// しかし、`response`スタブの値を設定することもできます
export async function loader({
  response,
}: LoaderFunctionArgs) {
  const data = await getData();
  response?.status = 200;
  response?.headers.set("X-Custom", "whatever");
  return Response.json(data);
}
```

`response`スタブを使いつつ、カスタムステータス/ヘッダーを持つ`Response`インスタンスを返すのは避ける
状況によっては不可避かもしれませんが、それ以外は避けるようにしましょう:

- `Response`インスタンスのステータスが、`response`スタブのステータスよりも優先されます
- `response`スタブの`headers`操作は、返された`Response`ヘッダーインスタンスに再適用されます

## 追加情報

### ストリーミングデータフォーマット

これまで、Remixは`loader`/`action`データを `JSON.stringify`してネットワーク経由で送信していました。また、`defer`レスポンスをサポートするために、カスタムのストリーミングフォーマットを実装していました。

シングルフェッチでは、内部で[`turbo-stream`][turbo-stream]を使用しており、ストリーミングの直接サポートや、JSONを超えた複雑なデータのシリアル化/デシリアル化が可能になりました。以下のデータ型は `turbo-stream` を介して直接ストリーミングできます: `BigInt`、`Date`、`Error`、`Map`、`Promise`、`RegExp`、`Set`、`Symbol`、`URL`。`Error`のサブタイプも、クライアントで大域的に利用可能なコンストラクタがある限り、サポートされます(`SyntaxError`、`TypeError`など)。

これにより、シングルフェッチを有効にした時点で、直ちにコードに変更が必要になるわけではありません:

- ✅ `loader`/`action`関数から返された`json`レスポンスは、依然として`JSON.stringify`でシリアル化されるため、`Date`を返すと`useLoaderData`/`useActionData`からは`string`が得られます
- ⚠️ `defer`インスタンスや生のオブジェクトを返す場合は、今度は`turbo-stream`でシリアル化されるため、`Date`を返すと`useLoaderData`/`useActionData`からは`Date`が得られます
  - 現在の動作を維持したい場合(streaming `defer`レスポンスを除く)、生のオブジェクトの返却を`json`で囲むことができます

これにより、`Promise`インスタンスをネットワーク経由で送信するために`defer`ユーティリティを使う必要がなくなりました! 生のオブジェクトのどこにでも`Promise`を含めることができ、`useLoaderData().whatever`で取得できます。必要に応じて`Promise`をネストすることもできます - ただし、UXへの影響に注意が必要です。

シングルフェッチを採用したら、アプリケーション全体から`json`/`defer`の使用を段階的に削除し、生のオブジェクトを返すようにすることをお勧めします。

### ストリーミングタイムアウト

これまでRemixには、デフォルトの[`entry.server.tsx`][entry-server]ファイルに組み込まれていた`ABORT_TIMEOUT`という概念がありました。これはReactレンダラーを終了させますが、保留中の遅延プロミスをクリーンアップするための特別な処理はありませんでした。

Remixがストリーミングを内部で行うようになったため、`turbo-stream`処理をキャンセルし、保留中のプロミスを自動的に拒否し、それらの拒否をReactレンダラーを通じてクライアントにストリーミングアップできるようになりました。デフォルトでは、これらは4950ms後に行われます - これは、Reactサイドの終了前にそれらの拒否をストリーミングアップする必要があるため、ほとんどのentry.server.tsxファイルの現在の5000ms `ABORT_DELAY`の少し下の値に選択されました。

`entry.server.tsx`から`streamTimeout`数値値をエクスポートすることで、この値を制御できます。Remixは、ミリ秒単位のこの値を使って、`loader`/`action`からの保留中のプロミスを拒否します。Reactレンダラーを中止するタイムアウトよりも高い値に設定することをお勧めします。

```tsx filename=app/entry.server.tsx lines=[1-2,32-33]
// ハンドラー関数からの保留中のプロミスを5秒後に拒否
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

    // Reactレンダラーを10秒後に自動的に中止
    setTimeout(abort, 10000);
  });
}
```

### 再検証

これまでは、アクションの結果に関わらず、アクション送信後にすべてのアクティブなローダーが再検証されていました。個別のルートでの再検証をオプトアウトできる`shouldRevalidate`機能もありました。

シングルフェッチでは、アクションが`4xx`/`5xx`のレスポンスを返す/投げた場合、デフォルトでは再検証は行われません。アクションが`4xx`/`5xx`以外のものを返す/投げた場合は、従来の再検証動作のままです。これは、ほとんどの場合`4xx`/`5xx`レスポンスを返す際は、データが変更されていないため再検証の必要がないと考えられるためです。

特定のローダーを`4xx`/`5xx`アクションレスポンス後も再検証したい場合は、[`shouldRevalidate`][should-revalidate]関数から`true`を返すことでオプトインできます。また、`unstable_actionStatus`パラメータが新しく追加されており、アクションのステータスコードに基づいて判断できます。

再検証は`?_routes`クエリパラメータを介して処理されます。これにより、fine-grainedな再検証を行う際にルートベースのキャッシュ番号が得られ、CDNの設定を変更する必要もなくなります(カスタムヘッダーを使ってVary ヘッダーを尊重する必要があった場合とは対照的)。

### インラインスクリプト

`<RemixServer>`コンポーネントは、クライアント側のストリーミングデータを処理するためのインラインスクリプトをレンダリングします。[スクリプトの内容セキュリティポリシー][csp]に[ノンス ソース][csp-nonce]がある場合は、`<RemixServer nonce>`を使ってこれらの`<script>`タグにノンスを渡すことができます。


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
[responsestub]: #ヘッダー
[streaming-format]: #ストリーミングデータフォーマット
[undici-polyfill]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#undici
[undici]: https://github.com/nodejs/undici
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
[csp-nonce]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources
[remix-utils]: https://github.com/sergiodxa/remix-utils
[merging-remix-and-rr]: https://remix.run/blog/merging-remix-and-react-router
[migration-guide]: #migrating-a-route-with-single-fetch
[action-revalidation]: #ストリーミングデータフォーマット
[start]: #シングルフェッチの有効化
[type-inference-section]: #型推論
