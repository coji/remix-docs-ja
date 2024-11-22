---
title: useBlocker
---

# `useBlocker`

`useBlocker`フックを使用すると、ユーザーが現在の場所から移動するのを防ぎ、カスタムUIを表示して、移動を許可するかどうかを確認できます。

<docs-info>
これは、React Routerアプリケーション内のクライアントサイドナビゲーションでのみ機能し、ドキュメントリクエストはブロックされません。ドキュメントナビゲーションを阻止するには、独自の<a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event" target="_blank">`beforeunload`</a>イベントハンドラーを追加する必要があります。
</docs-info>

<docs-warning>
ユーザーの移動をブロックすることは、少し反パターンであるため、このフックの使用について注意深く検討し、控えめに使用してください。半分入力されたフォームからユーザーが移動するのを防ぐという、事実上のユースケースでは、保存されていない状態を`sessionStorage`に永続化し、ユーザーが移動から戻った場合は自動的に再入力することを検討してください。
</docs-warning>

```tsx
function ImportantForm() {
  const [value, setValue] = React.useState("");

  // 入力にデータが入力されると、別の場所への移動をブロックします
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
          <p>移動してもよろしいですか?</p>
          <button onClick={() => blocker.proceed()}>
            移動
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

より完全な例については、リポジトリの[例][example]を参照してください。

## プロパティ

### `state`

ブロッカーの現在の状態

- `unblocked` - ブロッカーはアイドル状態であり、ナビゲーションを阻止していません
- `blocked` - ブロッカーはナビゲーションを阻止しました
- `proceeding` - ブロッカーは、ブロックされたナビゲーションから進行しています

### `location`

`blocked`状態の場合、これはナビゲーションをブロックした場所を表します。`proceeding`状態の場合、これは`blocker.proceed()`呼び出し後にナビゲーションされる場所です。

## メソッド

### `proceed()`

`blocked`状態の場合、`blocker.proceed()`を呼び出して、ブロックされた場所に移動できます。

### `reset()`

`blocked`状態の場合、`blocker.reset()`を呼び出して、ブロッカーを`unblocked`状態に戻し、ユーザーを現在の場所に留めることができます。

[example]: https://github.com/remix-run/react-router/tree/main/examples/navigation-blocking
