---
title: usePrompt
unstable: true
---

# unstable_usePrompt

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_usePrompt.html)

[useBlocker](../hooks/useBlocker)でカスタムUIを構築する代わりに、`window.confirm`プロンプトをユーザーに表示するための`useBlocker`のラッパーです。

この手法には多くの問題点があり、確認ダイアログが開いている間にユーザーが追加の戻る/進むナビゲーションをクリックすると、ブラウザ間で動作が大きく異なり（時には誤動作し）、`unstable_`フラグは削除されません。自己責任でご使用ください。

```tsx
function ImportantForm() {
  let [value, setValue] = React.useState("");

  // 入力にデータが入力されている場合に、他の場所へのナビゲーションをブロックします
  unstable_usePrompt({
    message: "Are you sure?",
    when: ({ currentLocation, nextLocation }) =>
      value !== "" &&
      currentLocation.pathname !== nextLocation.pathname,
  });

  return (
    <Form method="post">
      <label>
        Enter some important data:
        <input
          name="data"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <button type="submit">Save</button>
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

_ドキュメントなし_
