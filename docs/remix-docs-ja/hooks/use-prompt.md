---
title: unstable_usePrompt
---

# `unstable_usePrompt`

`unstable_usePrompt`フックを使用すると、現在の場所から移動する前に、[`window.confirm`][window-confirm] を介してユーザーに確認を求めることができます。

<docs-info>
これは、React Router アプリケーション内でのクライアント側のナビゲーションにのみ機能し、ドキュメントのリクエストはブロックしません。ドキュメントのナビゲーションを防止するには、独自の <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event" target="_blank">`beforeunload`</a> イベントハンドラーを追加する必要があります。
</docs-info>

<docs-warning>
ユーザーがナビゲーションをブロックすることは、少し反パターンです。そのため、このフックの使用を慎重に検討し、控えめに使用するようにしてください。半分入力されたフォームからユーザーが移動することを防ぐという実際のユースケースでは、保存されていない状態を `sessionStorage` に保存し、ユーザーが戻ってきた場合は自動的に再入力することを検討してください。
</docs-warning>

<docs-warning>
このフックから `unstable_` プレフィックスを削除する予定はありません。これは、プロンプトが開いているときのブラウザ間での動作が非決定的であるため、React Router はすべてのシナリオで正しい動作を保証できません。この非決定性を回避するために、`useBlocker` を代わりに使用することをお勧めします。これにより、確認の UX も制御できます。
</docs-warning>

```tsx
function ImportantForm() {
  const [value, setValue] = React.useState("");

  // 入力にデータが入力された場合、別の場所に移動することをブロックします
  unstable_usePrompt({
    message: "よろしいですか？",
    when: ({ currentLocation, nextLocation }) =>
      value !== "" &&
      currentLocation.pathname !== nextLocation.pathname,
  });

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
    </Form>
  );
}
```

[window-confirm]: https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm


