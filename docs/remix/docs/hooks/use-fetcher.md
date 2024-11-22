---
title: useFetcher
---

# `useFetcher`

ナビゲーションの外部でサーバーとやり取りするためのフック。

```tsx
import { useFetcher } from "@remix-run/react";

export function SomeComponent() {
  const fetcher = useFetcher();
  // ...
}
```

## オプション

### `key`

デフォルトでは、`useFetcher`はそのコンポーネントにスコープされた一意のフェッチャーを生成します（ただし、実行中は[`useFetchers()`][use_fetchers]で検索できる場合があります）。アプリの他の場所からフェッチャーにアクセスできるように、独自のキーでフェッチャーを識別したい場合は、`key`オプションを使用できます。

```tsx lines=[2,8]
function AddToBagButton() {
  const fetcher = useFetcher({ key: "add-to-bag" });
  return <fetcher.Form method="post">...</fetcher.Form>;
}

// そして、ヘッダーの上で...
function CartCount({ count }) {
  const fetcher = useFetcher({ key: "add-to-bag" });
  const inFlightCount = Number(
    fetcher.formData?.get("quantity") || 0
  );
  const optimisticCount = count + inFlightCount;
  return (
    <>
      <BagIcon />
      <span>{optimisticCount}</span>
    </>
  );
}
```

## コンポーネント

### `fetcher.Form`

ナビゲーションを引き起こさない点を除けば、[`<Form>`][form_component]と同じです。

```tsx
function SomeComponent() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post" action="/some/route">
      <input type="text" />
    </fetcher.Form>
  );
}
```

## メソッド

### `fetcher.submit(formData, options)`

フォームデータをルートに送信します。複数のネストされたルートがURLに一致する可能性がありますが、リーフルートのみが呼び出されます。

`formData`は複数の型を取ることができます。

- [`FormData`][form_data] - `FormData`インスタンス。
- [`HTMLFormElement`][html_form_element] - [`<form>`][form_element] DOM要素。
- `Object` - デフォルトでは`FormData`インスタンスに変換されるキーと値のペアのオブジェクト。より複雑なオブジェクトを渡して`encType: "application/json"`を指定することでJSONとしてシリアライズできます。詳細は[`useSubmit`][use-submit]を参照してください。

メソッドが`GET`の場合、ルートの[`loader`][loader]が呼び出され、`formData`は[`URLSearchParams`][url_search_params]としてURLにシリアライズされます。`DELETE`、`PATCH`、`POST`、または`PUT`の場合、ルートの[`action`][action]が`formData`をボディとして呼び出されます。

```tsx
// FormDataインスタンスを送信する（GETリクエスト）
const formData = new FormData();
fetcher.submit(formData);

// HTMLフォーム要素を送信する
fetcher.submit(event.currentTarget.form, {
  method: "POST",
});

// キーと値のJSONをFormDataインスタンスとして送信する
fetcher.submit(
  { serialized: "values" },
  { method: "POST" }
);

// 生のJSONを送信する
fetcher.submit(
  {
    deeply: {
      nested: {
        json: "values",
      },
    },
  },
  {
    method: "POST",
    encType: "application/json",
  }
);
```

`fetcher.submit`はフェッチャーインスタンスに対する[`useSubmit`][use-submit]呼び出しのラッパーなので、`useSubmit`と同じオプションも受け付けます。


### `fetcher.load(href, options)`

ルートローダーからデータを読み込みます。複数のネストされたルートがURLに一致する可能性がありますが、リーフルートのみが呼び出されます。

```ts
fetcher.load("/some/route");
fetcher.load("/some/route?foo=bar");
```

`fetcher.load`は、アクションの送信後と[`useRevalidator`][userevalidator]による明示的な再検証リクエストの後で、デフォルトで再検証します。`fetcher.load`は特定のURLを読み込むため、ルートパラメーターやURL検索パラメーターの変更に対して再検証しません。[`shouldRevalidate`][shouldrevalidate]を使用して、どのデータを再読み込みする必要があるかを最適化できます。

#### `options.flushSync`

`flushSync`オプションは、この`fetcher.load`の最初の状態更新をデフォルトの[`React.startTransition`][start-transition]ではなく、[`ReactDOM.flushSync`][flush-sync]呼び出しでラップするようにReact Router DOMに指示します。これにより、更新がDOMにフラッシュされた直後に、同期的なDOMアクションを実行できます。

<docs-warning>`ReactDOM.flushSync`はReactの最適化を解除し、アプリのパフォーマンスを低下させる可能性があります。</docs-warning>

## プロパティ

### `fetcher.state`

`fetcher.state`でフェッチャーの状態を知ることができます。次のいずれかになります。

- **idle** - 何もフェッチされていません。
- **submitting** - フォームが送信されました。メソッドが`GET`の場合、ルート`loader`が呼び出されます。`DELETE`、`PATCH`、`POST`、または`PUT`の場合、ルート`action`が呼び出されます。
- **loading** - `action`の送信後にルートのローダーが再読み込みされています。

### `fetcher.data`

`action`または`loader`から返された応答データがここに保存されます。データが設定されると、リロードや再送信（既にデータを読み込んだ後に`fetcher.load()`を再度呼び出すなど）でもフェッチャーに保持されます。

### `fetcher.formData`

サーバーに送信された`FormData`インスタンスがここに保存されます。これは楽観的なUIに役立ちます。

### `fetcher.formAction`

送信のURL。

### `fetcher.formMethod`

送信のフォームメソッド。

## 追加のリソース

**ディスカッション**

- [Form vs. Fetcher][form_vs_fetcher]
- [ネットワーク同時実行管理][network_concurrency_management]

**ビデオ**

- [useFetcherを使用した同時更新][concurrent_mutations_with_use_fetcher]
- [楽観的UI][optimistic_ui]

[form_component]: ../components/form
[form_data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[html_form_element]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement
[form_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
[loader]: ../route/loader
[url_search_params]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[action]: ../route/action
[form_vs_fetcher]: ../discussion/form-vs-fetcher
[network_concurrency_management]: ../discussion/concurrency
[concurrent_mutations_with_use_fetcher]: https://www.youtube.com/watch?v=vTzNpiOk668&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6
[optimistic_ui]: https://www.youtube.com/watch?v=EdB_nj01C80&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6
[use_fetchers]: ./use-fetchers
[flush-sync]: https://react.dev/reference/react-dom/flushSync
[start-transition]: https://react.dev/reference/react/startTransition
[use-submit]: ./use-submit
[userevalidator]: ./use-revalidator
[shouldrevalidate]: ../route/should-revalidate#shouldrevalidate


