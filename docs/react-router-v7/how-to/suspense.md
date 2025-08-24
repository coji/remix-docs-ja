---
title: Suspense を使用したストリーミング
---

# Suspense を使用したストリーミング

[MODES: framework, data]

<br/>
<br/>

React Suspense を使用したストリーミングにより、重要でないデータを遅延させ、UI レンダリングのブロックを解除することで、アプリの初期レンダリングを高速化できます。

React Router は、ローダーとアクションからプロミスを返すことで React Suspense をサポートします。

## 1. ローダーからプロミスを返す

React Router は、ルートコンポーネントをレンダリングする前にルートローダーを待機します。重要でないデータのローダーのブロックを解除するには、ローダーでプロミスを待機するのではなく、プロミスを返します。

```tsx
import type { Route } from "./+types/my-route";

export async function loader({}: Route.LoaderArgs) {
  // note this is NOT awaited
  let nonCriticalData = new Promise((res) =>
    setTimeout(() => res("non-critical"), 5000),
  );

  let criticalData = await new Promise((res) =>
    setTimeout(() => res("critical"), 300),
  );

  return { nonCriticalData, criticalData };
}
```

単一のプロミスを返すことはできず、キーを持つオブジェクトである必要があることに注意してください。

## 2. フォールバックと解決された UI をレンダリングする

プロミスは `loaderData` で利用可能になり、`<Await>` はプロミスを待機し、`<Suspense>` をトリガーしてフォールバック UI をレンダリングします。

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

React 19 を試している場合は、`Await` の代わりに `React.use` を使用できますが、サスペンスフォールバックをトリガーするために新しいコンポーネントを作成し、プロミスを渡す必要があります。

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

デフォルトでは、ローダーとアクションは、4950ms 後に未処理のプロミスを拒否します。これは、`entry.server.tsx` から `streamTimeout` の数値を出力することで制御できます。

```ts filename=entry.server.tsx
// Reject all pending promises from handler functions after 10 seconds
export const streamTimeout = 10_000;
```