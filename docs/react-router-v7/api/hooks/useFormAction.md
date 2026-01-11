---
title: useFormAction
---

# useFormAction

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useFormAction.html)

アプリケーションの現在の URL ではなく、コンポーネント階層内の最も近いルートへの URL を解決します。

これは内部的に [`Form`](../components/Form) が `action` を最も近いルートに解決するために使用されますが、汎用的に使用することもできます。

```tsx
import { useFormAction } from "react-router";

function SomeComponent() {
  // 最も近いルートの URL
  let action = useFormAction();

  // 最も近いルートの URL + "destroy"
  let destroyAction = useFormAction("destroy");
}
```

## シグネチャ

```tsx
function useFormAction(
  action?: string,
  {
    relative,
  }: {
    relative?: RelativeRoutingType;
  } = ,
): string {}
```

## パラメータ

### action

最も近いルート URL に追加するアクション。最も近いルート URL がデフォルトです。

### options.relative

アクションを解決する際に使用する相対ルーティングの型。デフォルトは`"route"`です。

## 戻り値

解決されたアクション URL。