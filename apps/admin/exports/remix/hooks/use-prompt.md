---
title: unstable_usePrompt
---

# `unstable_usePrompt`

`unstable_usePrompt` フックを使用すると、現在の場所から移動する前に、[`window.confirm`][window-confirm] を介してユーザーに確認を求めることができます。

<docs-info>
これは、React Router アプリケーション内のクライアントサイドのナビゲーションでのみ機能し、ドキュメントリクエストをブロックすることはありません。ドキュメントナビゲーションを防止するには、独自の <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event" target="_blank">`beforeunload`</a> イベントハンドラーを追加する必要があります。
</docs-info>

<docs-warning>
ユーザーのナビゲーションをブロックすることは、アンチパターンになりがちです。そのため、このフックの使用は慎重に検討し、控えめに使用してください。未入力のフォームからユーザーが移動するのを防ぐという事実上のユースケースでは、未保存の状態を `sessionStorage` に永続化し、移動をブロックする代わりに、ユーザーが戻ってきた場合に自動的に再入力することを検討してください。
</docs-warning>

<docs-warning>
プロンプトが開いている場合、ブラウザ間で動作が非決定的であるため、このフックから `unstable_` プレフィックスを削除する予定はありません。そのため、React Router はすべてのシナリオで正しい動作を保証できません。この非決定性を回避するために、代わりに `useBlocker` を使用することをお勧めします。これにより、確認 UX を制御することもできます。
</docs-warning>

```tsx
function ImportantForm() {
  const [value, setValue] = React.useState("");

  // 入力にデータが入力された場合、他の場所に移動するのをブロックします
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

