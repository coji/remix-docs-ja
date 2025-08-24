---
title: HTTP ヘッダー
---

# HTTP ヘッダー

[MODES: framework]

<br/>
<br/>

ヘッダーは主にルートモジュールの `headers` エクスポートで定義されます。`entry.server.tsx` でヘッダーを設定することもできます。

## ルートモジュールから

```tsx filename=some-route.tsx
import { Route } from "./+types/some-route";

export function headers(_: Route.HeadersArgs) {
  return {
    "Content-Security-Policy": "default-src 'self'",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "max-age=3600, s-maxage=86400",
  };
}
```

[`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) インスタンスまたは `HeadersInit` のいずれかを返すことができます。

## ローダーとアクションから

ヘッダーがローダーデータに依存する場合、ローダーとアクションもヘッダーを設定できます。

### 1. 戻り値を `data` でラップする

```tsx lines=[1,8]
import { data } from "react-router";

export async function loader({ params }: LoaderArgs) {
  let [page, ms] = await fakeTimeCall(
    await getPage(params.id),
  );

  return data(page, {
    headers: {
      "Server-Timing": `page;dur=${ms};desc="Page query"`,
    },
  });
}
```

### 2. `headers` エクスポートから返す

ローダーとアクションからのヘッダーは自動的に送信されません。`headers` エクスポートから明示的に返す必要があります。

```tsx
function hasAnyHeaders(headers: Headers): boolean {
  return [...headers].length > 0;
}

export function headers({
  actionHeaders,
  loaderHeaders,
}: HeadersArgs) {
  return hasAnyHeaders(actionHeaders)
    ? actionHeaders
    : loaderHeaders;
}
```

注目すべき例外は `Set-Cookie` ヘッダーで、これは子ルートから `headers` をエクスポートしなくても、親ルートの `headers`、`loader`、および `action` から自動的に保持されます。

## 親ヘッダーとのマージ

次のネストされたルートを検討してください。

```ts filename=routes.ts
route("pages", "pages-layout-with-nav.tsx", [
  route(":slug", "page.tsx"),
]);
```

両方のルートモジュールがヘッダーを設定したい場合、最も深く一致するルートからのヘッダーが送信されます。

親と子の両方のヘッダーを保持する必要がある場合は、子ルートでそれらをマージする必要があります。

### 追加

最も簡単な方法は、親ヘッダーに追加することです。これにより、親が設定した可能性のあるヘッダーを上書きすることを回避し、両方が重要になります。

```tsx
export function headers({ parentHeaders }: HeadersArgs) {
  parentHeaders.append(
    "Permissions-Policy: geolocation=()",
  );
  return parentHeaders;
}
```

### 設定

親ヘッダーを上書きすることが重要な場合があります。`append` の代わりに `set` でこれを行います。

```tsx
export function headers({ parentHeaders }: HeadersArgs) {
  parentHeaders.set(
    "Cache-Control",
    "max-age=3600, s-maxage=86400",
  );
  return parentHeaders;
}
```

ヘッダーをマージする必要性を回避するには、「リーフルート」（インデックスルートと子を持たない子ルート）でのみヘッダーを定義し、親ルートでは定義しないようにします。

## `entry.server.tsx` から

`handleRequest` エクスポートは、ルートモジュールからのヘッダーを引数として受け取ります。ここでグローバルヘッダーを追加できます。

```tsx
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  routerContext,
  loadContext,
) {
  // set, append global headers
  responseHeaders.set(
    "X-App-Version",
    routerContext.manifest.version,
  );

  return new Response(await getStream(), {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
```

`entry.server.tsx` がない場合は、`reveal` コマンドを実行します。

```shellscript nonumber
react-router reveal
```