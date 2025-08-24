---
title: useBlocker
---

# useBlocker

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useBlocker.html)

アプリケーションがSPA内のナビゲーションをブロックし、ナビゲーションを確認するための確認ダイアログをユーザーに表示できるようにします。主に、入力途中のフォームデータを使用しないようにするために使用されます。ハードリロードやクロスオリジンナビゲーションは処理しません。

フックによって返される[`Blocker`](https://api.reactrouter.com/v7/types/react_router.Blocker.html)オブジェクトは、以下のプロパティを持ちます。

- **`state`**
  - `unblocked` - ブロッカーはアイドル状態であり、ナビゲーションを阻止していません
  - `blocked` - ブロッカーがナビゲーションを阻止しました
  - `proceeding` - ブロッカーはブロックされたナビゲーションを続行中です
- **`location`**
  - `blocked`状態の場合、これはナビゲーションを阻止した先の[`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html)を表します。`proceeding`状態の場合、これは`blocker.proceed()`呼び出し後にナビゲートされるロケーションです。
- **`proceed()`**
  - `blocked`状態の場合、`blocker.proceed()`を呼び出してブロックされたロケーションへ進むことができます。
- **`reset()`**
  - `blocked`状態の場合、`blocker.reset()`を呼び出してブロッカーを`unblocked`状態に戻し、ユーザーを現在のロケーションに留めることができます。

```tsx
// Boolean version
let blocker = useBlocker(value !== "");

// Function version
let blocker = useBlocker(
  ({ currentLocation, nextLocation, historyAction }) =>
    value !== "" &&
    currentLocation.pathname !== nextLocation.pathname
);
```

## シグネチャ

```tsx
function useBlocker(shouldBlock: boolean | BlockerFunction): Blocker
```

## パラメータ

### shouldBlock

ナビゲーションをブロックすべきかどうかを示すブール値、またはブール値を返す関数です。関数形式の場合、潜在的なナビゲーションの`currentLocation`、`nextLocation`、および`historyAction`を含む単一のオブジェクトパラメータを受け取ります。

## 戻り値

状態とリセット機能を持つ[`Blocker`](https://api.reactrouter.com/v7/types/react_router.Blocker.html)オブジェクト。

## 使用例

```tsx
import { useCallback, useState } from "react";
import { BlockerFunction, useBlocker } from "react-router";

export function ImportantForm() {
  const [value, setValue] = useState("");

  const shouldBlock = useCallback<BlockerFunction>(
    () => value !== "",
    [value]
  );
  const blocker = useBlocker(shouldBlock);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setValue("");
        if (blocker.state === "blocked") {
          blocker.proceed();
        }
      }}
    >
      <input
        name="data"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button type="submit">保存</button>

      {blocker.state === "blocked" ? (
        <>
          <p style={{ color: "red" }}>
            最後のナビゲーションをブロックしました
          </p>
          <button
            type="button"
            onClick={() => blocker.proceed()}
          >
            通過させてください
          </button>
          <button
            type="button"
            onClick={() => blocker.reset()}
          >
            ここに留まる
          </button>
        </>
      ) : blocker.state === "proceeding" ? (
        <p style={{ color: "orange" }}>
          ブロックされたナビゲーションを続行中
        </p>
      ) : (
        <p style={{ color: "green" }}>
          ブロッカーは現在ブロックされていません
        </p>
      )}
    </form>
  );
}
```