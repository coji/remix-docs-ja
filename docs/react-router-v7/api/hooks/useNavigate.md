---
title: useNavigate
---

# useNavigate

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useNavigate.html)

ユーザーのインタラクションやエフェクトに応じて、ブラウザ内でプログラム的にナビゲートできる関数を返します。

このフックよりも、[`action`](../../start/framework/route-module#action) および [`loader`](../../start/framework/route-module#loader) 関数で [`redirect`](../utils/redirect) を使用する方が良い場合が多いです。

返される関数のシグネチャは `navigate(to, options?)`/`navigate(delta)` であり、

*   `to` は文字列パス、[`To`](https://api.reactrouter.com/v7/types/react_router.To.html) オブジェクト、または数値 (delta) になります。
*   `options` にはナビゲーションを変更するためのオプションが含まれます。
    *   `flushSync`: DOM の更新を [`ReactDom.flushSync`](https://react.dev/reference/react-dom/flushSync) でラップします。
    *   `preventScrollReset`: ナビゲーション後にページ上部へスクロールし直しません。
    *   `relative`: 相対ルーティングロジックを制御するための `"route"` または `"path"`。
    *   `replace`: [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタック内の現在のエントリを置き換えます。
    *   `state`: 新しい [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) に含めるオプションの [`history.state`](https://developer.mozilla.org/en-US/docs/Web/API/History/state)。
    *   `viewTransition`: このナビゲーションで [`document.startViewTransition`](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) を有効にします。

```tsx
import { useNavigate } from "react-router";

function SomeComponent() {
  let navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)}>
      Go Back
    </button>
  );
}
```

## シグネチャ

```tsx
function useNavigate(): NavigateFunction
```

## Returns

プログラムによるナビゲーションのための navigate 関数

## 例

### 別のパスへナビゲート

```tsx
navigate("/some/route");
navigate("/some/route?search=param");
```

### [`To`](https://api.reactrouter.com/v7/types/react_router.To.html) オブジェクトを使用してナビゲート

すべてのプロパティはオプションです。

```tsx
navigate({
  pathname: "/some/route",
  search: "?search=param",
  hash: "#hash",
  state: { some: "state" },
});
```

`state` を使用すると、次のページの [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) オブジェクトで利用可能になります。`useLocation().state` でアクセスします ([`useLocation`](../hooks/useLocation) を参照)。

### 履歴スタック内で戻るまたは進むナビゲーション

```tsx
// 戻る
// モーダルを閉じる際によく使用されます
navigate(-1);

// 進む
// 複数ステップのウィザードワークフローでよく使用されます
navigate(1);
```

`navigate(number)` の使用には注意してください。アプリケーションが、進む/戻るナビゲーションを試みるボタンを持つルートまで読み込まれる可能性がある場合、戻るまたは進むための [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) エントリが存在しないか、予期しない場所（別のドメインなど）に移動する可能性があります。

[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタックにナビゲート先のエントリが確実にある場合にのみ使用してください。

### 履歴スタックの現在のエントリを置き換える

これにより、[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタックの現在のエントリが削除され、新しいエントリに置き換えられます。これはサーバーサイドリダイレクトに似ています。

```tsx
navigate("/some/route", { replace: true });
```

### スクロールリセットの防止

[MODES: framework, data]

<br/>
<br/>

[`<ScrollRestoration>`](../components/ScrollRestoration) がスクロール位置をリセットするのを防ぐには、`preventScrollReset` オプションを使用します。

```tsx
navigate("?some-tab=1", { preventScrollReset: true });
```

たとえば、ページの中央に検索パラメータに接続されたタブインターフェースがあり、タブがクリックされたときにページ上部へスクロールさせたくない場合などです。

### 戻り値の型の拡張

内部的には、`useNavigate` は Declarative モードと Data/Framework モードで異なる実装を使用します。主な違いは、後者がナビゲーション間で同一性が変化しない安定した参照を返すことができる点です。Data/Framework モードでの実装は、ナビゲーションが完了したときに解決される [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) も返します。これは、`useNavigate` の戻り値の型が `void | Promise<void>` であることを意味します。これは正確ですが、戻り値のユニオン型に基づいていくつかの赤い波線（エラー表示）を引き起こす可能性があります。

*   `typescript-eslint` を使用している場合、[`@typescript-eslint/no-floating-promises`](https://typescript-eslint.io/rules/no-floating-promises) からのエラーが表示されることがあります。
*   Framework/Data モードでは、`React.use(navigate())` が誤って `Argument of type 'void | Promise<void>' is not assignable to parameter of type 'Usable<void>'` というエラーを表示します。

これらの問題を回避する最も簡単な方法は、使用しているルーターに基づいて型を拡張することです。

```ts
// If using <BrowserRouter>
declare module "react-router" {
  interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
    (delta: number): void;
  }
}

// If using <RouterProvider> or Framework mode
declare module "react-router" {
  interface NavigateFunction {
    (to: To, options?: NavigateOptions): Promise<void>;
    (delta: number): Promise<void>;
  }
}
```