---
title: useFetcher
---

# useFetcher

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useFetcher.html)

ナビゲーションを引き起こすことなく、複数の同時データインタラクションを必要とする複雑で動的なユーザーインターフェースを作成するのに役立ちます。

Fetcher は、独自の独立した状態を追跡し、データのロード、フォームの送信、およびローダーとアクションとの一般的なインタラクションに使用できます。

```tsx
import { useFetcher } from "react-router"

function SomeComponent() {
  let fetcher = useFetcher()

  // 状態は fetcher で利用可能です
  fetcher.state // "idle" | "loading" | "submitting"
  fetcher.data // アクションまたはローダーから返されたデータ

  // フォームをレンダリング
  <fetcher.Form method="post" />

  // データをロード
  fetcher.load("/some/route")

  // データを送信
  fetcher.submit(someFormRef, { method: "post" })
  fetcher.submit(someData, {
    method: "post",
    encType: "application/json"
  })
}
```

## シグネチャ

```tsx
useFetcher(options): FetcherWithComponents
```

## パラメータ

### options

[modes: framework, data]

_ドキュメントはありません_

