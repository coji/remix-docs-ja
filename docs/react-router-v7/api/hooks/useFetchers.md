---
title: useFetchers
---

# useFetchers

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useFetchers.html)

実行中のすべてのフェッチャーの配列を返します。これは、フェッチャーを作成しなかったが、楽観的なUIに参加するためにそれらの送信を使用したいアプリ全体のコンポーネントに役立ちます。

```tsx
import { useFetchers } from "react-router";

function SomeComponent() {
  const fetchers = useFetchers();
  fetchers[0].formData; // FormData
  fetchers[0].state; // etc.
  // ...
}
```

## シグネチャ

```tsx
useFetchers(): undefined
```
