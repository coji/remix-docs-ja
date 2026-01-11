---
title: unstable_usePrompt
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

<docs-warning>この API は実験的であり、マイナー/パッチリリースで破壊的変更が加えられる可能性があります。慎重に使用し、関連する変更についてはリリースノートに**非常**に注意してください。</docs-warning>

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_usePrompt.html)

[`useBlocker`](../hooks/useBlocker) をラップし、[`useBlocker`](../hooks/useBlocker) でカスタム UI を構築する代わりに、[`window.confirm`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) プロンプトをユーザーに表示します。

このテクニックには多くの未完成な点があり、確認ダイアログが開いている間にユーザーが追加の「戻る」/「進む」ナビゲーションをクリックした場合、ブラウザ間で動作が大きく異なる（時には正しくない）ため、`unstable_` フラグは削除されません。自己責任で使用してください。

```tsx
function ImportantForm() {
  let [value, setValue] = React.useState("");

  // 入力にデータが入力されている場合、他の場所へのナビゲーションをブロックします
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

確認ダイアログに表示するメッセージ。

### options.when

ナビゲーションをブロックするかどうかを示す boolean または boolean を返す関数。関数が提供された場合、`currentLocation` と `nextLocation` プロパティを持つオブジェクトを受け取ります。

## 戻り値

戻り値はありません。