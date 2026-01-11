---
title: useParams
---

# useParams

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useParams.html)

現在のURLから、ルートによってマッチした動的なパラメータのキーと値のペアのオブジェクトを返します。子ルートは、親ルートからすべてのパラメータを継承します。

`/posts/:postId` のようなルートパターンが `/posts/123` にマッチした場合、`params.postId` は `"123"` になります。

```tsx
import { useParams } from "react-router";

function SomeComponent() {
  let params = useParams();
  params.postId;
}
```

## シグネチャ

```tsx
function useParams<
  ParamsOrKey extends string | Record<string, string | undefined> = string,
>(): Readonly<
  [ParamsOrKey] extends [string] ? Params<ParamsOrKey> : Partial<ParamsOrKey>
>
```

## 戻り値

動的ルートパラメータを含むオブジェクト

## 例

### 基本的な使用方法

```tsx
import { useParams } from "react-router";

// 例えば以下のようなルートがあった場合:
<Route path="/posts/:postId" element={<Post />} />;

// またはデータルートの場合:
createBrowserRouter([
  {
    path: "/posts/:postId",
    component: Post,
  },
]);

// あるいは routes.ts で:
route("/posts/:postId", "routes/post.tsx");
```

コンポーネントでparamsにアクセスします:

```tsx
import { useParams } from "react-router";

export default function Post() {
  let params = useParams();
  return <h1>Post: {params.postId}</h1>;
}
```

### 複数のパラメータ

パターンは複数のパラメータを持つことができます:

```tsx
"/posts/:postId/comments/:commentId";
```

すべてがparamsオブジェクトで利用可能になります:

```tsx
import { useParams } from "react-router";

export default function Post() {
  let params = useParams();
  return (
    <h1>
      Post: {params.postId}, Comment: {params.commentId}
    </h1>
  );
}
```

### キャッチオールパラメータ

キャッチオールパラメータは `*` で定義されます:

```tsx
"/files/*";
```

マッチした値はparamsオブジェクトで以下のように利用可能になります:

```tsx
import { useParams } from "react-router";

export default function File() {
  let params = useParams();
  let catchall = params["*"];
  // ...
}
```

キャッチオールパラメータを分割代入することができます:

```tsx
export default function File() {
  let { "*": catchall } = useParams();
  console.log(catchall);
}
```