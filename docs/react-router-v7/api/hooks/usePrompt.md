---
title: usePrompt
unstable: true
---

# unstable_usePrompt

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

[MODES: framework, data]

<br />
<br />

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が発生する可能性があります。ご使用の際は注意し、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_usePrompt.html)

[`useBlocker`](../hooks/useBlocker)でカスタムUIを構築する代わりに、ユーザーに[`window.confirm`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm)プロンプトを表示するための`useBlocker`のラッパーです。

この手法には多くの問題点があり、確認ダイアログが開いている間にユーザーが追加の戻る/進むナビゲーションをクリックすると、ブラウザ間で動作が大きく異なり（時には誤動作する）ため、`unstable_`フラグは削除されません。自己責任でご使用ください。

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
function usePrompt({
  when,
  message,
}: {
  when: boolean | BlockerFunction;
  message: string;
}): void
```

## パラメータ

### options.message

確認ダイアログに表示するメッセージです。

### options.when

ナビゲーションをブロックするかどうかを示すブール値、またはブール値を返す関数です。関数が提供された場合、`currentLocation`と`nextLocation`プロパティを持つオブジェクトを受け取ります。

## 戻り値

戻り値はありません。