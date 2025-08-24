---
title: Await
---

# Await

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/components.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Await.html)

自動エラー処理で Promise の値をレンダリングするために使用されます。

**注:** `<Await>` は [`<React.Suspense>`](https://react.dev/reference/react/Suspense) の内部でレンダリングされることを想定しています。

```tsx
import { Await, useLoaderData } from "react-router";

export async function loader() {
  // await されない
  const reviews = getReviews();
  // await される (トランジションをブロックする)
  const book = await fetch("/api/book").then((res) =>
    res.json()
  );
  return { book, reviews };
}

function Book() {
  const { book, reviews } = useLoaderData();
  return (
    <div>
      <h1>{book.title}</h1>
      <p>{book.description}</p>
      <React.Suspense fallback={<ReviewsSkeleton />}>
        <Await
          resolve={reviews}
          errorElement={
            <div>レビューをロードできませんでした 😬</div>
          }
          children={(resolvedReviews) => (
            <Reviews items={resolvedReviews} />
          )}
        />
      </React.Suspense>
    </div>
  );
}
```

## シグネチャ

```tsx
function Await<Resolve>({
  children,
  errorElement,
  resolve,
}: AwaitProps<Resolve>)
```

## Props

### children

関数を使用する場合、解決された値がパラメータとして提供されます。

```tsx [2]
<Await resolve={reviewsPromise}>
  {(resolvedReviews) => <Reviews items={resolvedReviews} />}
</Await>
```

React 要素を使用する場合、[useAsyncValue](../hooks/useAsyncValue) が解決された値を提供します。

```tsx [2]
<Await resolve={reviewsPromise}>
  <Reviews />
</Await>;

function Reviews() {
  const resolvedReviews = useAsyncValue();
  return <div>...</div>;
}
```

### errorElement

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) がリジェクトされた場合、children の代わりにエラー要素がレンダリングされます。

```tsx
<Await
  errorElement={<div>おっと</div>}
  resolve={reviewsPromise}
>
  <Reviews />
</Await>
```

よりコンテキストに沿ったエラーを提供するには、子コンポーネントで [useAsyncError](../hooks/useAsyncError) を使用できます。

```tsx
<Await
  errorElement={<ReviewsError />}
  resolve={reviewsPromise}
>
  <Reviews />
</Await>;

function ReviewsError() {
  const error = useAsyncError();
  return <div>レビューのロード中にエラーが発生しました: {error.message}</div>;
}
```

errorElement を提供しない場合、リジェクトされた値は最も近いルートレベルの [`ErrorBoundary`](../../start/framework/route-module#errorboundary) までバブルアップし、[useRouteError](../hooks/useRouteError) フックを介してアクセスできます。

### resolve

解決してレンダリングするために、[`loader`](../../start/framework/route-module#loader) から返された [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) を受け取ります。

```tsx
import { Await, useLoaderData } from "react-router";

export async function loader() {
  let reviews = getReviews(); // await されない
  let book = await getBook();
  return {
    book,
    reviews, // これは Promise です
  };
}

export default function Book() {
  const {
    book,
    reviews, // これは同じ Promise です
  } = useLoaderData();

  return (
    <div>
      <h1>{book.title}</h1>
      <p>{book.description}</p>
      <React.Suspense fallback={<ReviewsSkeleton />}>
        <Await
          // そして、これは Await に渡す Promise です
          resolve={reviews}
        >
          <Reviews />
        </Await>
      </React.Suspense>
    </div>
  );
}
```