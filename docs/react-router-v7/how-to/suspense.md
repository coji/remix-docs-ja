---
title: Suspense を使ったストリーミング
---

# Suspense を使ったストリーミング

[MODES: framework, data]

<br/>
<br/>

React Suspense を使ったストリーミングにより、重要でないデータを遅延させ、UI レンダリングをブロック解除することで、アプリの初期レンダリングを高速化できます。

React Router は、ローダーとアクションから Promise を返すことで、React Suspense をサポートします。

## 1. ローダーから Promise を返す

React Router は、ルートコンポーネントをレンダリングする前にルートローダーを待機します。重要でないデータのローダーをブロック解除するには、ローダーで待機するのではなく、Promise を返します。

```tsx
import type { Route } from "./+types/my-route";

export async function loader({}: Route.LoaderArgs) {
  // これは待機されないことに注意してください
  let nonCriticalData = new Promise((res) =>
    setTimeout(() => res("non-critical"), 5000),
  );

  let criticalData = await new Promise((res) =>
    setTimeout(() => res("critical"), 300),
  );

  return { nonCriticalData, criticalData };
}
```

単一の Promise を返すことはできず、キーを持つオブジェクトである必要があります。

## 2. フォールバックと解決された UI をレンダリングする

Promise は `loaderData` で利用可能になり、`<Await>` は Promise を待機し、`<Suspense>` がフォールバック UI をレンダリングするようにトリガーします。

```tsx
import * as React from "react";
import { Await } from "react-router";

// [previous code]

export default function MyComponent({
  loaderData,
}: Route.ComponentProps) {
  let { criticalData, nonCriticalData } = loaderData;

  return (
    <div>
      <h1>Streaming example</h1>
      <h2>Critical data value: {criticalData}</h2>

      <React.Suspense fallback={<div>Loading...</div>}>
        <Await resolve={nonCriticalData}>
          {(value) => <h3>Non critical value: {value}</h3>}
        </Await>
      </React.Suspense>
    </div>
  );
}
```

## React 19 を使用する場合

React 19 を試している場合は、`Await` の代わりに `React.use` を使用できますが、新しいコンポーネントを作成し、Promise を渡してサスペンスフォールバックをトリガーする必要があります。

```tsx
<React.Suspense fallback={<div>Loading...</div>}>
  <NonCriticalUI p={nonCriticalData} />
</React.Suspense>
```

```tsx
function NonCriticalUI({ p }: { p: Promise<string> }) {
  let value = React.use(p);
  return <h3>Non critical value {value}</h3>;
}
```

## タイムアウト

デフォルトでは、ローダーとアクションは、未処理の Promise を 4950ms 後に拒否します。これは、`entry.server.tsx` から `streamTimeout` という数値の値をエクスポートすることで制御できます。

```ts filename=entry.server.tsx
// ハンドラー関数からのすべての保留中の Promise を 10 秒後に拒否します
export const streamTimeout = 10_000;
```