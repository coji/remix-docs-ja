---
title: useNavigate
---

# useNavigate

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useNavigate.html)

ユーザーのインタラクションやエフェクトに応じて、ブラウザ内でプログラム的にナビゲートできる関数を返します。

```tsx
import { useNavigate } from "react-router";

function SomeComponent() {
  let navigate = useNavigate();
  return (
    <button
      onClick={() => {
        navigate(-1);
      }}
    />
  );
}
```

このフックよりも、[ActionFunction](../Other/ActionFunction) および [LoaderFunction](../Other/LoaderFunction) で [redirect](../utils/redirect) を使用する方が良い場合が多いです。

## シグネチャ

```tsx
navigate(
  to: To,
  options?: {
    flushSync?: boolean;
    preventScrollReset?: boolean;
    relative?: RelativeRoutingType;
    replace?: boolean;
    state?: any;
    viewTransition?: boolean;
  }
): void | Promise<void>;
```

## 例

### 別のパスへナビゲート:

```tsx
navigate("/some/route");
navigate("/some/route?search=param");
```

### `To` オブジェクトを使用してナビゲート:

すべてのプロパティはオプションです。

```tsx
navigate({
  pathname: "/some/route",
  search: "?search=param",
  hash: "#hash",
  state: { some: "state" },
});
```

`state` を使用すると、次のページの `location` オブジェクトで利用可能になります。`useLocation().state` でアクセスします ([useLocation](./useLocation) を参照)。

### 履歴スタック内で戻るまたは進むナビゲーション:

```tsx
// 戻る
// モーダルを閉じる際によく使用されます
navigate(-1);

// 進む
// 複数ステップのウィザードワークフローでよく使用されます
navigate(1);
```

`navigate(number)` の使用には注意してください。アプリケーションが、進む/戻るナビゲーションを試みるボタンを持つルートまで読み込まれる可能性がある場合、戻るまたは進むための履歴エントリが存在しないか、予期しない場所（別のドメインなど）に移動する可能性があります。

履歴スタックにナビゲート先のエントリが確実にある場合にのみ使用してください。

### 履歴スタックの現在のエントリを置き換える:

これにより、履歴スタックの現在のエントリが削除され、新しいエントリに置き換えられます。これはサーバーサイドリダイレクトに似ています。

```tsx
navigate("/some/route", { replace: true });
```

### スクロールリセットの防止

[modes: framework, data]

`<ScrollRestoration>` がスクロール位置をリセットするのを防ぐには、`preventScrollReset` オプションを使用します。

```tsx
navigate("?some-tab=1", { preventScrollReset: true });
```

たとえば、ページの中央に検索パラメータに接続されたタブインターフェースがあり、タブがクリックされたときにページ上部へスクロールさせたくない場合などです。