---
title: Await
---

# Await

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Await.html)

自動エラー処理で Promise の値をレンダリングするために使用されます。

```tsx
import { Await, useLoaderData } from "react-router";

export function loader() {
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

`<Await>` は `<React.Suspense>` の内部でレンダリングされることを想定しています。

## Props

### children

[modes: framework, data]

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

[modes: framework, data]

Promise がリジェクトされた場合、children の代わりにエラー要素がレンダリングされます。

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

errorElement を提供しない場合、リジェクトされた値は最も近いルートレベルの ErrorBoundary までバブルアップし、[useRouteError](../hooks/useRouteError) フックを介してアクセスできます。

### resolve

[modes: framework, data]

解決してレンダリングする [LoaderFunction](../Other/LoaderFunction) から返された Promise を受け取ります。

```jsx
import { useLoaderData, Await } from "react-router";

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
