---
title: useParams
---

# useParams

<!--
⚠️ ⚠️ 重要 ⚠️ ⚠️

ドキュメントの改善にご協力いただきありがとうございます！

このファイルはソースコードのJSDocコメントから自動生成されています。
そのため、以下のファイルのJSDocコメントを編集してください。
変更がマージされると、このファイルは再生成されます。

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

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

動的なルートパラメータを含むオブジェクト

## 使用例

### 基本的な使用法

```tsx
import { useParams } from "react-router";

// 以下のようなルートの場合:
<Route path="/posts/:postId" element={<Post />} />;

// または、以下のようなデータルートの場合:
createBrowserRouter([
  {
    path: "/posts/:postId",
    component: Post,
  },
]);

// または routes.ts の場合:
route("/posts/:postId", "routes/post.tsx");
```

コンポーネント内でパラメータにアクセスします:

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

マッチした値は、以下のようにparamsオブジェクトで利用可能になります:

```tsx
import { useParams } from "react-router";

export default function File() {
  let params = useParams();
  let catchall = params["*"];
  // ...
}
```

キャッチオールパラメータを分割代入できます:

```tsx
export default function File() {
  let { "*": catchall } = useParams();
  console.log(catchall);
}
```