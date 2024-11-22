---
title: HTTP ヘッダー
---

# HTTP ヘッダー

ヘッダーは主にルートモジュール`headers`エクスポートで定義されます。`entry.server.tsx`でもヘッダーを設定できます。

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

[`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers)インスタンスまたは`HeadersInit`のいずれかを返すことができます。

## ローダーとアクションから

ヘッダーがローダーデータに依存する場合、ローダーとアクションでもヘッダーを設定できます。

### 1. 戻り値を`data`でラップする

```tsx lines=[1,8]
import { data } from "react-router";

export async function loader({ params }: LoaderArgs) {
  let [page, ms] = await fakeTimeCall(
    await getPage(params.id)
  );

  return data(page, {
    headers: {
      "Server-Timing": `page;dur=${ms};desc="Page query"`,
    },
  });
}
```

### 2. `headers`エクスポートから返す

ローダーとアクションからのヘッダーは隠れた方法では送信されません。`headers`エクスポートから返す必要があります。

```tsx
export function headers({
  actionHeaders,
  loaderHeaders,
}: HeadersArgs) {
  return actionHeaders ? actionHeaders : loaderHeaders;
}
```

## 親ヘッダーとのマージ

これらのネストされたルートを考えてみましょう。

```ts filename=routes.ts
route("pages", "pages-layout-with-nav.tsx", [
  route(":slug", "page.tsx"),
]);
```

両方のルートモジュールがヘッダーを設定する場合、最も深く一致するルートからのヘッダーが送信されます。

親ヘッダーと子ヘッダーの両方を保持する必要がある場合、子ルートでそれらをマージする必要があります。

### 追加

最も簡単な方法は、親ヘッダーに単純に追加することです。これにより、親が設定したヘッダーの上書きが避けられ、どちらも重要になります。

```tsx
export function headers({ parentHeaders }: HeadersArgs) {
  parentHeaders.append(
    "Permissions-Policy: geolocation=()"
  );
  return parentHeaders;
}
```

### 設定

場合によっては、親ヘッダーを上書きすることが重要です。これには、`append`ではなく`set`を使用します。

```tsx
export function headers({ parentHeaders }: HeadersArgs) {
  parentHeaders.set(
    "Cache-Control",
    "max-age=3600, s-maxage=86400"
  );
  return parentHeaders;
}
```

「リーフルート」（インデックスルートと子を持たない子ルート）でのみヘッダーを定義し、親ルートでは定義しないことで、ヘッダーのマージの必要性を回避できます。

## `entry.server.tsx`から

`handleRequest`エクスポートは、ルートモジュールからのヘッダーを引数として受け取ります。ここではグローバルヘッダーを追加できます。

```tsx
export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  routerContext,
  loadContext
) {
  // グローバルヘッダーの設定、追加
  responseHeaders.set(
    "X-App-Version",
    routerContext.manifest.version
  );

  return new Response(await getStream(), {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
```

`entry.server.tsx`がない場合は、`reveal`コマンドを実行します。

```shellscript nonumber
react-router reveal
```

