---
title: useBlocker
---

# `useBlocker`

`useBlocker` フックを使用すると、ユーザーが現在の場所から移動するのを防ぎ、ナビゲーションを確定するためのカスタム UI を表示できます。

<docs-info>
これは、React Router アプリケーション内のクライアントサイドのナビゲーションでのみ機能し、ドキュメントリクエストをブロックしません。ドキュメントのナビゲーションを防ぐには、独自の <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event" target="_blank">`beforeunload`</a> イベントハンドラーを追加する必要があります。
</docs-info>

<docs-warning>
ユーザーがナビゲーションするのをブロックすることは、アンチパターンになりがちですので、このフックの使用は慎重に検討し、控えめに使用してください。未入力のフォームからユーザーが移動するのを防ぐという事実上のユースケースでは、未保存の状態を `sessionStorage` に永続化し、移動をブロックする代わりに、ユーザーが戻ってきた場合に自動的に再入力することを検討してください。
</docs-warning>

```tsx
function ImportantForm() {
  const [value, setValue] = React.useState("");

  // 入力にデータが入力された場合、他の場所に移動するのをブロックします
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      value !== "" &&
      currentLocation.pathname !== nextLocation.pathname
  );

  return (
    <Form method="post">
      <label>
        重要なデータを入力してください:
        <input
          name="data"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <button type="submit">保存</button>

      {blocker.state === "blocked" ? (
        <div>
          <p>本当に移動しますか？</p>
          <button onClick={() => blocker.proceed()}>
            続行
          </button>
          <button onClick={() => blocker.reset()}>
            キャンセル
          </button>
        </div>
      ) : null}
    </Form>
  );
}
```

より完全な例については、リポジトリの [例][example] を参照してください。

## プロパティ

### `state`

ブロッカーの現在の状態

- `unblocked` - ブロッカーはアイドル状態で、ナビゲーションを妨げていません
- `blocked` - ブロッカーがナビゲーションを妨げました
- `proceeding` - ブロッカーはブロックされたナビゲーションから進行中です

### `location`

`blocked` 状態の場合、これはナビゲーションをブロックした場所を表します。`proceeding` 状態の場合、これは `blocker.proceed()` 呼び出し後にナビゲートされる場所です。

## メソッド

### `proceed()`

`blocked` 状態の場合、`blocker.proceed()` を呼び出して、ブロックされた場所に移動できます。

### `reset()`

`blocked` 状態の場合、`blocker.reset()` を呼び出して、ブロッカーを `unblocked` 状態に戻し、ユーザーを現在の場所に残すことができます。

[example]: https://github.com/remix-run/react-router/tree/main/examples/navigation-blocking

