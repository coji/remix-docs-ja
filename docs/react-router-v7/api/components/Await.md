---
title: Await
---

# Await

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Await.html)

自動エラー処理で Promise の値をレンダリングするために使用されます。

**注:** `<Await>` は [`<React.Suspense>`](https://react.dev/reference/react/Suspense) の内部でレンダリングされることを想定しています。

```tsx
import { Await, useLoaderData } from "react-router";

export async function loader() {
  // not awaited
  const reviews = getReviews();
  // awaited (blocks the transition)
  const book = await fetch("/api/book").then((res) => res.json());
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
            <div>Could not load reviews 😬</div>
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

React 要素を使用する場合、[`useAsyncValue`](../hooks/useAsyncValue) が解決された値を提供します。

```tsx [2]
<Await resolve={reviewsPromise}>
  <Reviews />
</Await>

function Reviews() {
  const resolvedReviews = useAsyncValue();
  return <div>...</div>;
}
```

### errorElement

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) がリジェクトされた場合、`children` の代わりにエラー要素がレンダリングされます。

```tsx
<Await
  errorElement={<div>Oops</div>}
  resolve={reviewsPromise}
>
  <Reviews />
</Await>
```

よりコンテキストに沿ったエラーを提供するには、子コンポーネントで [`useAsyncError`](../hooks/useAsyncError) を使用できます。

```tsx
<Await
  errorElement={<ReviewsError />}
  resolve={reviewsPromise}
>
  <Reviews />
</Await>

function ReviewsError() {
  const error = useAsyncError();
  return <div>Error loading reviews: {error.message}</div>;
}
```

errorElement を提供しない場合、リジェクトされた値は最も近いルートレベルの [`ErrorBoundary`](../../start/framework/route-module#errorboundary) までバブルアップし、[`useRouteError`](../hooks/useRouteError) hook を介してアクセスできます。

### resolve

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) を受け取ります。これは、解決およびレンダリングされる [`loader`](../../start/framework/route-module#loader) から返されたものです。

```tsx
import { Await, useLoaderData } from "react-router";

export async function loader() {
  let reviews = getReviews(); // not awaited
  let book = await getBook();
  return {
    book,
    reviews, // this is a promise
  };
}

export default function Book() {
  const {
    book,
    reviews, // this is the same promise
  } = useLoaderData();

  return (
    <div>
      <h1>{book.title}</h1>
      <p>{book.description}</p>
      <React.Suspense fallback={<ReviewsSkeleton />}>
        <Await
          // and is the promise we pass to Await
          resolve={reviews}
        >
          <Reviews />
        </Await>
      </React.Suspense>
    </div>
  );
}
```