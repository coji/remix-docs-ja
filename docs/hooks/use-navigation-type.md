---
title: useNavigationType
---

# `useNavigationType`

ユーザーが現在の場所に到着したときに使用されたナビゲーションのタイプを返します。

```tsx
import { useNavigationType } from "@remix-run/react";

function SomeComponent() {
  const navigationType = useNavigationType();
  // ...
}
```

## 戻り値

- **PUSH**: ユーザーは履歴スタックのプッシュアクションによって現在のページにきました。リンクをクリックしたり、フォームを送信したりするなどです。
- **REPLACE**: ユーザーは履歴スタックの置換アクションによって現在のページにきました。`<Link replace>` を持つリンクをクリックしたり、`<Form replace>` を持つフォームを送信したり、`navigate(to, { replace: true })` を呼び出したりするなどです。
- **POP**: ユーザーは履歴スタックのポップアクションによって現在のページにきました。戻るボタンまたは進むボタンをクリックしたり、`navigate(-1)` または `navigate(1)` を呼び出したりするなどです。

## 関連記事

- [`<Link replace>`][link-replace]
- [`<Form replace>`][form-replace]
- [`navigate` オプション][navigate-options]

[link-replace]: ../components/link#replace
[form-replace]: ../components/form#replace
[navigate-options]: ../hooks/use-navigate#options


