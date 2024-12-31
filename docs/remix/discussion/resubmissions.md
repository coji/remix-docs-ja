---
title: フォームの再送信
---

# フォームの再送信

Remix で `<Form method="post">` を使用する場合、ネイティブの HTML `<form method="post">` を使用する場合とは異なり、Remix は、戻る、進む、またはリフレッシュなどのナビゲーションイベント中にフォームを再送信するためのデフォルトのブラウザの動作に従いません。

## ブラウザのデフォルトの動作

標準的なブラウザ環境では、フォームの送信はナビゲーションイベントです。つまり、ユーザーが戻るボタンをクリックすると、ブラウザは通常、フォームを再送信します。例：

1. ユーザーが `/buy` にアクセスします
2. `/checkout` にフォームを送信します
3. `/order/123` に移動します

ブラウザの履歴スタックは次のようになります。

```
GET /buy > POST /checkout > *GET /order/123
```

ユーザーが戻るボタンをクリックすると、履歴は次のようになります。

```
GET /buy - *POST /checkout < GET /order/123
```

この状況では、ブラウザはフォームデータを再送信するため、クレジットカードへの二重請求などの問題が発生する可能性があります。

## `action` からのリダイレクト

この問題を回避するための一般的な方法は、POST リクエスト後にリダイレクトを発行することです。これにより、POST アクションがブラウザの履歴から削除されます。履歴スタックは次のようになります。

```
GET /buy > POST /checkout, Redirect > GET /order/123
```

このアプローチでは、戻るボタンをクリックしてもフォームは再送信されません。

```
GET /buy - *GET /order/123
```

## 考慮すべき特定のシナリオ

Remix では、誤った再送信は一般的に発生しませんが、発生する可能性のある特定のシナリオがあります。

- `<Form>` の代わりに `<form>` を使用した場合
- `<Form reloadDocument>` を使用した場合
- `<Scripts/>` をレンダリングしていない場合
- ユーザーが JavaScript を無効にしている場合
- フォームが送信されたときに JavaScript がロードされていなかった場合

意図しない再送信を避けるために、アクションからリダイレクトを実装することをお勧めします。

## 追加リソース

**ガイド**

- [フォームの検証][form_validation]

**API**

- [`<Form>`][form]
- [`useActionData`][use_action_data]
- [`redirect`][redirect]

[form_validation]: ../guides/form-validation
[form]: ../components/form
[use_action_data]: ../hooks/use-action-data
[redirect]: ../utils/redirect

