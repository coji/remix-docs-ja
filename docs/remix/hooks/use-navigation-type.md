---
title: useNavigationType
---

# `useNavigationType`

ユーザーが現在の場所に到達した際に使用されたナビゲーションのタイプを返します。

```tsx
import { useNavigationType } from "@remix-run/react";

function SomeComponent() {
  const navigationType = useNavigationType();
  // ...
}
```

## 戻り値

- **PUSH**: ユーザーが履歴スタックへのプッシュアクションによって現在のページに到達した場合：リンクをクリックしたり、フォームを送信したりした場合など。
- **REPLACE**: ユーザーが履歴スタックへの置換アクションによって現在のページに到達した場合：`<Link replace>` でリンクをクリックしたり、`<Form replace>` でフォームを送信したり、`navigate(to, { replace: true })` を呼び出したりした場合など。
- **POP**: ユーザーが履歴スタックへのポップアクションによって現在のページに到達した場合：戻るボタンや進むボタンをクリックしたり、`navigate(-1)` や `navigate(1)` を呼び出したりした場合など。

## 追加リソース

- [`<Link replace>`][link-replace]
- [`<Form replace>`][form-replace]
- [`navigate` オプション][navigate-options]

[link-replace]: ../components/link#replace
[form-replace]: ../components/form#replace
[navigate-options]: ../hooks/use-navigate#options
