---
title: replace
---

# replace

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.replace.html)

クライアントサイドのナビゲーションリダイレクトにおいて、[`history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) の代わりに [`history.replaceState`](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) を実行するリダイレクト[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)です。ステータスコードと [`Location`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location) ヘッダーを設定します。デフォルトは [`302 Found`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302) です。

```tsx
import { replace } from "react-router";

export async function loader() {
  return replace("/new-location");
}
```

## パラメータ

### url

リダイレクト先の URL です。

### init

レスポンスに含めるステータスコード、または `ResponseInit` オブジェクトです。

## 戻り値

リダイレクトステータスと [`Location`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location) ヘッダーを含む [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) オブジェクトです。