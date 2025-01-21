---
title: Suspense を使ったストリーミング
---

# Suspense を使ったストリーミング

React Suspense を使ったストリーミングにより、重要でないデータを遅延させ、UI レンダリングをブロック解除することで、アプリの初期レンダリングを高速化できます。

React Router は、ローダーとアクションから Promise を返すことで、React Suspense をサポートします。

## 1. ローダーから Promise を返す

React Router は、ルートコンポーネントをレンダリングする前にルートローダーを待機します。重要でないデータのローダーをブロック解除するには、ローダーで待機するのではなく、Promise を返します。

```tsx
import type { Route } from "./+types/my-route";

export async function loader({}: Route.LoaderArgs) {
  // これは待機されないことに注意してください
  let nonCriticalData = new Promise((res) =>
    setTimeout(() => res("non-critical"), 5000)
  );

  let criticalData = await new Promise((res) =>
    setTimeout(() => res("critical"), 300)
  );

  return { nonCriticalData, criticalData };
}
```

## 2. フォールバックと解決された UI をレンダリングする

Promise は `loaderData` で利用可能になり、`<Await>` は Promise を待機し、`<Suspense>` がフォールバック UI をレンダリングするようにトリガーします。

```tsx
import * as React from "react";
import { Await } from "react-router";

// [前のコード]

export default function MyComponent({
  loaderData,
}: Route.ComponentProps) {
  let { criticalData, nonCriticalData } = loaderData;

  return (
    <div>
      <h1>ストリーミングの例</h1>
      <h2>重要なデータの値: {criticalData}</h2>

      <React.Suspense fallback={<div>読み込み中...</div>}>
        <Await resolve={nonCriticalData}>
          {(value) => <h3>重要でない値: {value}</h3>}
        </Await>
      </React.Suspense>
    </div>
  );
}
```

## React 19 を使用する場合

React 19 を試している場合は、`Await` の代わりに `React.use` を使用できますが、新しいコンポーネントを作成し、Promise を渡してサスペンスフォールバックをトリガーする必要があります。

```tsx
<React.Suspense fallback={<div>読み込み中...</div>}>
  <NonCriticalUI p={nonCriticalData} />
</React.Suspense>
```

```tsx
function NonCriticalUI({ p }: { p: Promise<string> }) {
  let value = React.use(p);
  return <h3>重要でない値 {value}</h3>;
}
```

