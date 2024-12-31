---
title: useFetcher
---

# `useFetcher`

ナビゲーション以外でサーバーとやり取りするためのフックです。

```tsx
import { useFetcher } from "@remix-run/react";

export function SomeComponent() {
  const fetcher = useFetcher();
  // ...
}
```

## オプション

### `key`

デフォルトでは、`useFetcher` はそのコンポーネントにスコープされた一意のフェッチャーを生成します（ただし、インフライト中は [`useFetchers()`][use_fetchers] で参照できます）。アプリの他の場所からアクセスできるように、独自のキーでフェッチャーを識別したい場合は、`key` オプションを使用できます。

```tsx lines=[2,8]
function AddToBagButton() {
  const fetcher = useFetcher({ key: "add-to-bag" });
  return <fetcher.Form method="post">...</fetcher.Form>;
}

// 次に、ヘッダーで...
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

ナビゲーションを引き起こさない点を除いて、[`<Form>`][form_component] と同じです。

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

フォームデータをルートに送信します。複数のネストされたルートが URL に一致する可能性がありますが、リーフルートのみが呼び出されます。

`formData` は複数の型を取ることができます。

- [`FormData`][form_data] - `FormData` インスタンス。
- [`HTMLFormElement`][html_form_element] - [`<form>`][form_element] DOM 要素。
- `Object` - デフォルトで `FormData` インスタンスに変換されるキー/値ペアのオブジェクト。より複雑なオブジェクトを渡し、`encType: "application/json"` を指定して JSON としてシリアライズできます。詳細については、[`useSubmit`][use-submit] を参照してください。

メソッドが `GET` の場合、ルートの [`loader`][loader] が呼び出され、`formData` は [`URLSearchParams`][url_search_params] として URL にシリアライズされます。`DELETE`、`PATCH`、`POST`、または `PUT` の場合、ルートの [`action`][action] が `formData` をボディとして呼び出されます。

```tsx
// FormData インスタンスを送信 (GET リクエスト)
const formData = new FormData();
fetcher.submit(formData);

// HTML フォーム要素を送信
fetcher.submit(event.currentTarget.form, {
  method: "POST",
});

// キー/値 JSON を FormData インスタンスとして送信
fetcher.submit(
  { serialized: "values" },
  { method: "POST" }
);

// 生の JSON を送信
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

`fetcher.submit` は、フェッチャーインスタンスに対する [`useSubmit`][use-submit] 呼び出しのラッパーであるため、`useSubmit` と同じオプションも受け入れます。

### `fetcher.load(href, options)`

ルートローダーからデータをロードします。複数のネストされたルートが URL に一致する可能性がありますが、リーフルートのみが呼び出されます。

```ts
fetcher.load("/some/route");
fetcher.load("/some/route?foo=bar");
```

`fetcher.load` は、アクションの送信後、および [`useRevalidator`][userevalidator] を介した明示的な再検証リクエスト後にデフォルトで再検証します。`fetcher.load` は特定の URL をロードするため、ルートパラメーターまたは URL 検索パラメーターの変更では再検証されません。[`shouldRevalidate`][shouldrevalidate] を使用して、リロードする必要があるデータを最適化できます。

#### `options.flushSync`

`flushSync` オプションは、この `fetcher.load` の初期状態の更新を、デフォルトの [`React.startTransition`][start-transition] 呼び出しの代わりに [`ReactDOM.flushSync`][flush-sync] 呼び出しでラップするように React Router DOM に指示します。これにより、更新が DOM にフラッシュされた直後に同期 DOM アクションを実行できます。

<docs-warning>`ReactDOM.flushSync` は React を最適化解除し、アプリのパフォーマンスを低下させる可能性があります。</docs-warning>

## プロパティ

### `fetcher.state`

`fetcher.state` でフェッチャーの状態を知ることができます。次のいずれかになります。

- **idle** - 何もフェッチされていません。
- **submitting** - フォームが送信されました。メソッドが `GET` の場合、ルートの `loader` が呼び出されます。`DELETE`、`PATCH`、`POST`、または `PUT` の場合、ルートの `action` が呼び出されます。
- **loading** - `action` の送信後、ルートのローダーがリロードされています。

### `fetcher.data`

`action` または `loader` から返されたレスポンスデータがここに格納されます。データが設定されると、リロードや再送信（すでにデータを読み取った後に `fetcher.load()` を再度呼び出すなど）でも、フェッチャーにデータが保持されます。

### `fetcher.formData`

サーバーに送信された `FormData` インスタンスがここに格納されます。これは、楽観的な UI に役立ちます。

### `fetcher.formAction`

送信の URL。

### `fetcher.formMethod`

送信のフォームメソッド。

## 追加リソース

**ディスカッション**

- [Form vs. Fetcher][form_vs_fetcher]
- [ネットワーク並行性管理][network_concurrency_management]

**動画**

- [useFetcher を使用した同時ミューテーション][concurrent_mutations_with_use_fetcher]
- [楽観的な UI][optimistic_ui]

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

