---
title: usePrompt
---

# usePrompt

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_usePrompt.html)

[useBlocker](../hooks/useBlocker) のラッパーで、カスタムUIを構築する代わりに、`window.confirm` プロンプトをユーザーに表示します。

`unstable_` フラグは削除されません。なぜなら、このテクニックには多くの問題点があり、確認ウィンドウが開いている間にユーザーが追加の戻る/進むナビゲーションをクリックした場合、ブラウザによって動作が大きく異なり（そして、時には誤った動作をします）。自己責任で使用してください。

```tsx
function ImportantForm() {
  let [value, setValue] = React.useState("");

  // 入力欄にデータが入力されている場合、他の場所へのナビゲーションをブロックします
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

## シグネチャ

```tsx
unstable_usePrompt(options): void
```

## パラメータ

### options

_ドキュメントはありません_

