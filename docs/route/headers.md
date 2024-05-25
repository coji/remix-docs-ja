---
title: ヘッダー
---

# `headers`

各ルートは独自の HTTP ヘッダーを定義できます。一般的なヘッダーの 1 つは、[`Cache-Control` ヘッダー][cache-control-header] であり、ブラウザーと CDN キャッシュに、ページをどこでどのくらいの期間キャッシュできるかを指示します。

```tsx
import type { HeadersFunction } from "@remix-run/node"; // または cloudflare/deno

export const headers: HeadersFunction = ({
  actionHeaders,
  errorHeaders,
  loaderHeaders,
  parentHeaders,
}) => ({
  "X-Stretchy-Pants": "its for fun",
  "Cache-Control": "max-age=300, s-maxage=3600",
});
```

通常、データはルートモジュールよりもキャッシュ期間のより良い指標となるため（データはマークアップよりも動的になりがちです）、[`action`][action] および [`loader`][loader] のヘッダーも `headers()` に渡されます。

```tsx
import type { HeadersFunction } from "@remix-run/node"; // または cloudflare/deno

export const headers: HeadersFunction = ({
  loaderHeaders,
}) => ({
  "Cache-Control": loaderHeaders.get("Cache-Control"),
});
```

注: `actionHeaders` と `loaderHeaders` は、[Web Fetch API `Headers`][headers] クラスのインスタンスです。

`action` または `loader` が [`Response`][response] をスローし、境界を描画している場合、スローされた `Response` のヘッダーは `errorHeaders` で使用できます。これにより、親エラー境界でスローされた子ローダーのヘッダーにアクセスできます。

## ネストされたルート

Remix にはネストされたルートがあるため、ネストされたルートが一致したときにヘッダーの戦いを勝ち取る必要があります。デフォルトの動作では、Remix はレンダリング可能な一致の中で見つかった最も深い `headers` 関数の結果のヘッダーのみを利用します（エラーが存在する場合は、境界ルートまで含みます）。

```
├── users.tsx
├── users.$userId.tsx
└── users.$userId.profile.tsx
```

`/users/123/profile` を見ている場合、3 つのルートがレンダリングされます。

```tsx
<Users>
  <UserId>
    <Profile />
  </UserId>
</Users>
```

ユーザーが `/users/123/profile` を見ていて、`users.$userId.profile.tsx` が `headers` 関数をエクスポートしていない場合、Remix は `users.$userId.tsx` の `headers` 関数の戻り値を使用します。そのファイルがそれをエクスポートしていない場合、`users.tsx` の戻り値を使用し、以降も同様です。

3 つすべてが `headers` を定義している場合、最も深いモジュールが勝ちます。この場合は `users.$userId.profile.tsx` です。ただし、`users.$userId.profile.tsx` の `loader` がスローされ、`users.userId.tsx` の境界にバブルアップした場合、`users.userId.tsx` の `headers` 関数が使用されます。これは、レンダリングされたルートのリーフであるためです。

応答に予期しないヘッダーが入り込むのを避けるために、必要に応じてマージするのはあなたの仕事です。Remix は、`headers` 関数に `parentHeaders` を渡します。そのため、`users.tsx` のヘッダーは `users.$userId.tsx` に渡され、`users.$userId.tsx` のヘッダーは `users.$userId.profile.tsx` の `headers` に渡されます。

つまり、Remix は足を撃つための非常に大きな銃をあなたに与えているということです。親ルートよりも攻撃的な `Cache-Control` を子ルートモジュールから送信しないように注意する必要があります。以下は、これらのケースで最も攻撃的でないキャッシュを選択するコードの例です。

```tsx
import type { HeadersFunction } from "@remix-run/node"; // または cloudflare/deno
import parseCacheControl from "parse-cache-control";

export const headers: HeadersFunction = ({
  loaderHeaders,
  parentHeaders,
}) => {
  const loaderCache = parseCacheControl(
    loaderHeaders.get("Cache-Control")
  );
  const parentCache = parseCacheControl(
    parentHeaders.get("Cache-Control")
  );

  // 親とローダーの間で最も保守的なものを取得します。そうしないと、一方に対して攻撃的になりすぎます。
  const maxAge = Math.min(
    loaderCache["max-age"],
    parentCache["max-age"]
  );

  return {
    "Cache-Control": `max-age=${maxAge}`,
  };
};
```

とはいえ、この問題全体を、_親ルートではなくリーフルートでのみ_ ヘッダーを定義することで回避できます。直接アクセスできるレイアウトはすべて、「インデックスルート」を持つ可能性があります。リーフルートではなく、親ルートでヘッダーを定義した場合、ヘッダーのマージについて心配する必要はなくなります。

グローバルにする必要があるものについては、[`entry.server.tsx`][entry-server] ファイルにヘッダーを追加することもできます。たとえば、

```tsx filename=app/entry.server.tsx lines=[20]
import type {
  AppLoadContext,
  EntryContext,
} from "@remix-run/node"; // または cloudflare/deno
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");
  responseHeaders.set("X-Powered-By", "Hugs");

  return new Response("<!DOCTYPE html>" + markup, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
```

これを行うと、_すべての_ ドキュメント要求に適用されることに注意してください。ただし、`data` 要求（クライアント側の遷移など）には適用されません。それらについては、[`handleDataRequest`][handle-data-request] を使用してください。

[cache-control-header]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[action]: ./action
[loader]: ./loader
[headers]: https://developer.mozilla.org/en-US/docs/Web/API/Headers
[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[entry-server]: ../file-conventions/entry.server
[handle-data-request]: ../file-conventions/entry.server#handledatarequest


