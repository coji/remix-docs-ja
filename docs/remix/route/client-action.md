---
title: clientAction
---

# `clientAction`

[`action`][action] に加えて (または代わりに)、クライアントで実行される `clientAction` 関数を定義できます。

各ルートは、ミューテーションを処理する `clientAction` 関数を定義できます。

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

この関数はクライアントでのみ実行され、いくつかの方法で使用できます。

- 完全なクライアントルートの場合、サーバーの `action` の代わりに
- ミューテーション時にキャッシュを無効化することで、`clientLoader` キャッシュと併用する
- React Router からの移行を容易にする

## 引数

### `params`

この関数は、[`action`][action] と同じ [`params`][action-params] 引数を受け取ります。

### `request`

この関数は、[`action`][action] と同じ [`request`][action-request] 引数を受け取ります。

### `serverAction`

`serverAction` は、このルートのサーバー `action` への [fetch][fetch] 呼び出しを行う非同期関数です。

以下も参照してください。

- [クライアントデータガイド][client-data-guide]
- [clientLoader][clientloader]

[action]: ./action
[action-params]: ./loader#params
[action-request]: ./loader#request
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[client-data-guide]: ../guides/client-data
[clientloader]: ./client-loader
