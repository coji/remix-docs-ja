---
title: headers
---

# `headers`

各ルートは独自の HTTP ヘッダーを定義できます。一般的なヘッダーの 1 つは、ブラウザーと CDN キャッシュにページをキャッシュできる場所と期間を示す [`Cache-Control` ヘッダー][cache-control-header]です。

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

通常、データはルートモジュールよりもキャッシュ期間を示すのに適しています（データはマークアップよりも動的になる傾向があるため）。そのため、[`action`][action] と [`loader`][loader] のヘッダーも `headers()` に渡されます。

```tsx
import type { HeadersFunction } from "@remix-run/node"; // または cloudflare/deno

export const headers: HeadersFunction = ({
  loaderHeaders,
}) => ({
  "Cache-Control": loaderHeaders.get("Cache-Control"),
});
```

注: `actionHeaders` と `loaderHeaders` は、[Web Fetch API `Headers`][headers] クラスのインスタンスです。

`action` または `loader` が [`Response`][response] をスローし、境界をレンダリングしている場合、スローされた `Response` からのヘッダーは `errorHeaders` で利用できます。これにより、親エラー境界でスローされた子ローダーからのヘッダーにアクセスできます。

## ネストされたルート

Remix にはネストされたルートがあるため、ネストされたルートが一致した場合、ヘッダーの戦いに勝つ必要があります。デフォルトの動作では、Remix はレンダリング可能な一致箇所で見つかった最も深い `headers` 関数（エラーが存在する場合は境界ルートまで含む）からの結果のヘッダーのみを利用します。

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

ユーザーが `/users/123/profile` を見ていて、`users.$userId.profile.tsx` が `headers` 関数をエクスポートしていない場合、Remix は `users.$userId.tsx` の `headers` 関数の戻り値を使用します。そのファイルがエクスポートしていない場合は、`users.tsx` の結果を使用します。

3 つすべてが `headers` を定義している場合、最も深いモジュールが勝ちます。この場合は `users.$userId.profile.tsx` です。ただし、`users.$userId.profile.tsx` の `loader` がスローされ、`users.userId.tsx` の境界にバブルした場合、`users.userId.tsx` の `headers` 関数が、レンダリングされたリーフルートとして使用されます。

レスポンスに予期しないヘッダーを含めたくないため、必要に応じてそれらをマージするのはあなたの仕事です。Remix は `parentHeaders` を `headers` 関数に渡します。したがって、`users.tsx` ヘッダーは `users.$userId.tsx` に渡され、次に `users.$userId.tsx` の `headers` は `users.$userId.profile.tsx` の `headers` に渡されます。

つまり、Remix は足元を撃つための非常に大きな銃をあなたに与えたということです。親ルートよりもアグレッシブな `Cache-Control` を子ルートモジュールから送信しないように注意する必要があります。以下は、このような場合に最もアグレッシブでないキャッシュを選択するコードです。

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

  // 親とローダーの間で最も保守的なものを取得します。そうしないと、
  // それらのいずれかに対してアグレッシブになりすぎます。
  const maxAge = Math.min(
    loaderCache["max-age"],
    parentCache["max-age"]
  );

  return {
    "Cache-Control": `max-age=${maxAge}`,
  };
};
```

とはいえ、親ルートでヘッダーを定義せず、リーフルートでのみ定義することで、この問題全体を回避できます。直接アクセスできるすべてのレイアウトには、おそらく「インデックスルート」があります。リーフルートでのみヘッダーを定義し、親ルートでは定義しない場合、ヘッダーのマージについて心配する必要はありません。

また、[`entry.server.tsx`][entry-server] ファイルで、グローバルに適用する必要があるもの（例：）のヘッダーを追加することもできます。

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

これを行うと、_すべての_ ドキュメントリクエストに適用されますが、`data` リクエスト（クライアント側のトランジションなど）には適用されないことに注意してください。これらについては、[`handleDataRequest`][handle-data-request] を使用してください。

[cache-control-header]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[action]: ./action
[loader]: ./loader
[headers]: https://developer.mozilla.org/en-US/docs/Web/API/Headers
[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[entry-server]: ../file-conventions/entry.server
[handle-data-request]: ../file-conventions/entry.server#handledatarequest
