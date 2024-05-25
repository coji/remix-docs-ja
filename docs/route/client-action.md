---
title: clientAction
---

# `clientAction`

[`action`][action] に加えて（または代わりに）、クライアントで実行される `clientAction` 関数を定義できます。

各ルートは、変更を処理する `clientAction` 関数を定義できます。

```tsx
export const clientAction = async ({
  request,
  params,
  serverAction,
}: ClientActionFunctionArgs) => {
  invalidateClientSideCache();
  const data = await serverAction();
  return data;
};
```

この関数はクライアントでのみ実行され、次の方法で使用できます。

- フルクライアントルートの場合、サーバー側の `action` の代わりに使用
- `clientLoader` キャッシュと一緒に使用して、変更時にキャッシュを無効にする
- React Router からの移行を容易にする

## 引数

### `params`

この関数は、[`action`][action] と同じ [`params`][action-params] 引数を受け取ります。

### `request`

この関数は、[`action`][action] と同じ [`request`][action-request] 引数を受け取ります。

### `serverAction`

`serverAction` は、このルートのサーバー側の `action` に [fetch][fetch] 呼び出しを行う非同期関数です。

こちらもご覧ください。

- [クライアントデータガイド][client-data-guide]
- [clientLoader][clientloader]

[action]: ./action
[action-params]: ./loader#params
[action-request]: ./loader#request
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[client-data-guide]: ../guides/client-data
[clientloader]: ./client-loader
