---
title: useBlocker
---

# useBlocker

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useBlocker.html)

アプリケーションがSPA内のナビゲーションをブロックし、ナビゲーションを確認するための確認ダイアログをユーザーに表示できるようにします。主に、入力途中のフォームデータを使用しないようにするために使用されます。ハードリロードやクロスオリジンナビゲーションは処理しません。

## シグネチャ

```tsx
useBlocker(shouldBlock): Blocker
```

## パラメータ

### shouldBlock

[modes: framework, data]

_ドキュメントはありません_

## 使用例

### 基本的な使用法

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