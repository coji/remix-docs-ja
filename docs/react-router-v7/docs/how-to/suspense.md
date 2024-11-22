---
title: サスペンスを使ったストリーミング
---

# サスペンスを使ったストリーミング

React Suspense を使用したストリーミングにより、重要でないデータを遅延させることでアプリの初期レンダリングを高速化し、UI レンダリングのブロックを解除できます。

React Router は、ローダーとアクションから Promise を返すことで React Suspense をサポートしています。

## 1. ローダーから Promise を返す

React Router は、ルートコンポーネントをレンダリングする前にルートローダーを待機します。重要でないデータのローダーのブロックを解除するには、ローダー内で await を行う代わりに Promise を返します。

```tsx
import type { Route } from "./+types/my-route";

export async function loader({}: Route.LoaderArgs) {
  // これは await されません
  let nonCriticalData = new Promise((res) =>
    setTimeout(() => "non-critical", 5000)
  );

  let criticalData = await new Promise((res) =>
    setTimeout(() => "critical", 300)
  );

  return { nonCriticalData, criticalData };
}
```

## 2. フォールバックと解決済みのUIをレンダリングする

Promise は `loaderData` で利用可能になり、`<Await>` は Promise を待機し、`<Suspense>` にフォールバック UI をレンダリングするようにトリガーします。

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
      <h1>ストリーミング例</h1>
      <h2>重要なデータ値: {criticalData}</h2>

      <React.Suspense fallback={<div>読み込み中...</div>}>
        <Await resolve={nonCriticalData}>
          {(value) => <h3>重要なデータではない値: {value}</h3>}
        </Await>
        <NonCriticalUI p={nonCriticalData} />
      </React.Suspense>
    </div>
  );
}
```

## React 19の場合

React 19 を試している場合は、`Await` の代わりに `React.use` を使用できますが、新しいコンポーネントを作成し、サスペンスのフォールバックをトリガーするために Promise を渡す必要があります。

```tsx
<React.Suspense fallback={<div>読み込み中...</div>}>
  <NonCriticalUI p={nonCriticalData} />
</React.Suspense>
```

```tsx
function NonCriticalUI({ p }: { p: Promise<string> }) {
  let value = React.use(p);
  return <h3>重要なデータではない値 {value}</h3>;
}
```

