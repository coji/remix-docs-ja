---
title: useNavigation
---

# `useNavigation`

このフックは、保留中のページナビゲーションに関する情報を提供します。

```js
import { useNavigation } from "@remix-run/react";

function SomeComponent() {
  const navigation = useNavigation();
  // ...
}
```

## プロパティ

### `navigation.formAction`

送信されたフォームのアクション（存在する場合）。

```tsx
// これらのいずれかから設定されます
<Form action="/some/where" />;
submit(formData, { action: "/some/where" });
```

### `navigation.formMethod`

送信されたフォームのメソッド（存在する場合）。

```tsx
// これらのいずれかから設定されます
<Form method="get" />;
submit(formData, { method: "get" });
```

### `navigation.formData`

[`<Form>`][form-component] または [`useSubmit`][use-submit] から開始された `DELETE`、`PATCH`、`POST`、または `PUT` ナビゲーションには、フォームの送信データが添付されます。これは、主に `submission.formData` [`FormData`][form-data] オブジェクトを使用して「楽観的な UI」を構築する場合に役立ちます。

たとえば、

```tsx
// このフォームには `email` フィールドがあります
<Form method="post" action="/signup">
  <input name="email" />
</Form>;

// したがって、ナビゲーションには、ナビゲーションが保留中の間、`navigation.formData` にフィールドの値が含まれます。
navigation.formData.get("email");
```

`GET` フォーム送信の場合、`formData` は空になり、データは `navigation.location.search` に反映されます。

### `navigation.location`

これは、次の場所がどうなるかを教えてくれます。

### `navigation.state`

- **idle** - 保留中のナビゲーションはありません。
- **submitting** - POST、PUT、PATCH、または DELETE を使用したフォーム送信により、ルートアクションが呼び出されています。
- **loading** - 次のルートのローダーが呼び出され、次のページがレンダリングされています。

通常のナビゲーションと GET フォーム送信は、これらの状態を遷移します。

```
idle → loading → idle
```

POST、PUT、PATCH、または DELETE を使用したフォーム送信は、これらの状態を遷移します。

```
idle → submitting → loading → idle
```

[form-component]: ../components/form
[use-submit]: ./use-submit
[form-data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData


