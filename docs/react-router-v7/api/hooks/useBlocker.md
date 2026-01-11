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

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useBlocker.html)

アプリケーションがSPA内のナビゲーションをブロックし、ナビゲーションを確認するための確認ダイアログをユーザーに表示できるようにします。主に、入力途中のフォームデータを使用しないようにするために使用されます。ハードリロードやクロスオリジンナビゲーションは処理しません。

hook によって返される [`Blocker`](https://api.reactrouter.com/v7/types/react_router.Blocker.html) オブジェクトには、以下のプロパティがあります。

-   **`state`**
    -   `unblocked` - ブロッカーはアイドル状態であり、どのナビゲーションもブロックしていません。
    -   `blocked` - ブロッカーがナビゲーションをブロックしました。
    -   `proceeding` - ブロッカーはブロックされたナビゲーションから続行中です。
-   **`location`**
    -   `blocked` 状態の場合、これはナビゲーションをブロックした先の [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) を表します。`proceeding` 状態の場合、これは `blocker.proceed()` 呼び出し後にナビゲートされる Location です。
-   **`proceed()`**
    -   `blocked` 状態の場合、`blocker.proceed()` を呼び出して、ブロックされた Location に進むことができます。
-   **`reset()`**
    -   `blocked` 状態の場合、`blocker.reset()` を呼び出して、ブロッカーを `unblocked` 状態に戻し、ユーザーを現在の Location に留めることができます。

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

ナビゲーションをブロックすべきかどうかを示す boolean または boolean を返す関数です。関数形式の場合、潜在的なナビゲーションの `currentLocation`、`nextLocation`、および `historyAction` を含む単一のオブジェクトパラメータを受け取ります。

## 戻り値

state とリセット機能を備えた [`Blocker`](https://api.reactrouter.com/v7/types/react_router.Blocker.html) オブジェクト。

## 例

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

      <button type="submit">Save</button>

      {blocker.state === "blocked" ? (
        <>
          <p style={{ color: "red" }}>
            Blocked the last navigation to
          </p>
          <button
            type="button"
            onClick={() => blocker.proceed()}
          >
            Let me through
          </button>
          <button
            type="button"
            onClick={() => blocker.reset()}
          >
            Keep me here
          </button>
        </>
      ) : blocker.state === "proceeding" ? (
        <p style={{ color: "orange" }}>
          Proceeding through blocked navigation
        </p>
      ) : (
        <p style={{ color: "green" }}>
          Blocker is currently unblocked
        </p>
      )}
    </form>
  );
}
```