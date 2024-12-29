---
title: Suspenseを使ったストリーミング
---

# Suspenseを使ったストリーミング

React Suspenseを使ったストリーミングにより、重要でないデータを後回しにし、UIレンダリングをブロックしないようにすることで、アプリの初期レンダリングを高速化できます。

React Routerは、ローダーとアクションからPromiseを返すことで、React Suspenseをサポートしています。

## 1. ローダーからPromiseを返す

React Routerは、ルートコンポーネントをレンダリングする前にルートローダーを待ちます。重要でないデータのためにローダーをブロックしないようにするには、ローダーで`await`する代わりにPromiseを返します。

```tsx
import type { Route } from "./+types/my-route";

export async function loader({}: Route.LoaderArgs) {
  // これはawaitされないことに注意
  let nonCriticalData = new Promise((res) =>
    setTimeout(() => res("non-critical"), 5000)
  );

  let criticalData = await new Promise((res) =>
    setTimeout(() => res("critical"), 300)
  );

  return { nonCriticalData, criticalData };
}
```

## 2. フォールバックと解決されたUIをレンダリングする

Promiseは`loaderData`で利用可能になり、`<Await>`はPromiseを待ち、`<Suspense>`をトリガーしてフォールバックUIをレンダリングします。

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
      <h2>クリティカルなデータの値: {criticalData}</h2>

      <React.Suspense fallback={<div>読み込み中...</div>}>
        <Await resolve={nonCriticalData}>
          {(value) => <h3>重要でない値: {value}</h3>}
        </Await>
        <NonCriticalUI p={nonCriticalData} />
      </React.Suspense>
    </div>
  );
}
```

## React 19の場合

React 19を試している場合、`Await`の代わりに`React.use`を使用できますが、Suspenseフォールバックをトリガーするには、新しいコンポーネントを作成してPromiseを渡す必要があります。

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

