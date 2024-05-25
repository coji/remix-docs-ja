---
title: フォームの再送信
---

# フォームの再送信

Remixで`<Form method="post">`を使用する場合、ネイティブHTMLの`<form method="post">`を使用する場合とは異なり、Remixは戻る、進む、更新などのナビゲーションイベント中にフォームを再送信するというブラウザのデフォルトの動作に従いません。

## ブラウザのデフォルトの動作

標準的なブラウザ環境では、フォームの送信はナビゲーションイベントです。つまり、ユーザーが戻るボタンをクリックすると、ブラウザは通常フォームを再送信します。例：

1. ユーザーは`/buy`にアクセスします。
2. `/checkout`にフォームを送信します。
3. `/order/123`に移動します。

ブラウザの履歴スタックは次のようになります。

```
GET /buy > POST /checkout > *GET /order/123
```

ユーザーが戻るボタンをクリックすると、履歴は次のようになります。

```
GET /buy - *POST /checkout < GET /order/123
```

この状況では、ブラウザはフォームデータを再送信し、クレジットカードを2回請求するなどの問題が発生する可能性があります。

## `action`からのリダイレクト

この問題を回避するための一般的な方法は、POSTリクエスト後にリダイレクトを実行することです。これにより、POSTアクションがブラウザの履歴から削除されます。履歴スタックは次のようになります。

```
GET /buy > POST /checkout, Redirect > GET /order/123
```

この方法では、戻るボタンをクリックしてもフォームは再送信されません。

```
GET /buy - *GET /order/123
```

## 考慮すべき特定のシナリオ

一般的にRemixでは意図しない再送信は発生しませんが、発生する可能性のある特定のシナリオがあります。

- `<Form>`ではなく`<form>`を使用しました。
- `<Form reloadDocument>`を使用しました。
- `<Scripts/>`をレンダリングしていません。
- ユーザーによってJavaScriptが無効になっています。
- JavaScriptがフォーム送信時にロードされていませんでした。

意図しない再送信を回避するために、アクションからリダイレクトを実装することをお勧めします。

## 追加のリソース

**ガイド**

- [フォームバリデーション][form_validation]

**API**

- [`<Form>`][form]
- [`useActionData`][use_action_data]
- [`redirect`][redirect]

[form_validation]: ../guides/form-validation
[form]: ../components/form
[use_action_data]: ../hooks/use-action-data
[redirect]: ../utils/redirect


