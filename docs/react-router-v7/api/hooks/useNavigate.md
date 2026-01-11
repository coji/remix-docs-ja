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

このフックを使用するよりも、[`action`](../../start/framework/route-module#action)/[`loader`](../../start/framework/route-module#loader) 関数内で [`redirect`](../utils/redirect) を使用する方が良い場合が多くあります。

返される関数のシグネチャは `navigate(to, options?)` または `navigate(delta)` で、以下のとおりです。

*   `to` は文字列パス、[`To`](https://api.reactrouter.com/v7/types/react_router.To.html) オブジェクト、または数値 (delta) を指定できます。
*   `options` には、ナビゲーションを変更するためのオプションが含まれます。
    *   これらのオプションは、すべてのモード (Framework、Data、Declarative) で機能します:
        *   `relative`: 相対ルーティングロジックを制御するための `"route"` または `"path"`
        *   `replace`: [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタックの現在のエントリを新しいものに置き換えます。
        *   `state`: 新しい [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) に含めるオプションの [`history.state`](https://developer.mozilla.org/en-US/docs/Web/API/History/state)
    *   これらのオプションは、Framework および Data モードでのみ機能します:
        *   `flushSync`: DOM の更新を [`ReactDom.flushSync`](https://react.dev/reference/react-dom/flushSync) でラップします。
        *   `preventScrollReset`: ナビゲーション後にページの最上部までスクロールを戻しません。
        *   `viewTransition`: このナビゲーションのために [`document.startViewTransition`](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) を有効にします。

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

## 戻り値

プログラムによるナビゲーションのための navigate 関数。

## 例

### 別のパスにナビゲートする

```tsx
navigate("/some/route");
navigate("/some/route?search=param");
```

### [`To`](https://api.reactrouter.com/v7/types/react_router.To.html) オブジェクトでナビゲートする

すべてのプロパティはオプションです。

```tsx
navigate({
  pathname: "/some/route",
  search: "?search=param",
  hash: "#hash",
  state: { some: "state" },
});
```

state を使用すると、次のページの [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) オブジェクトで利用できます。[`useLocation`](../hooks/useLocation) を使用して `useLocation().state` でアクセスしてください。

### History スタックを前後にナビゲートする

```tsx
// back
// often used to close modals
navigate(-1);

// forward
// often used in a multistep wizard workflows
navigate(1);
```

`navigate(number)` を使用する際は注意が必要です。アプリケーションが、前方/後方へのナビゲートを試みるボタンを持つルートまでロードできる場合、[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) エントリが存在しない、または予期しない場所 (別のドメインなど) に移動する可能性があります。

ナビゲート先の [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタックにエントリが存在することが確実な場合にのみ、これを使用してください。

### History スタックの現在のエントリを置き換える

これは、[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタックから現在のエントリを削除し、サーバーサイドの redirect と同様に新しいエントリに置き換えます。

```tsx
navigate("/some/route", { replace: true });
```

### スクロールリセットを防ぐ

[MODES: framework, data]

<br/>
<br/>

[`<ScrollRestoration>`](../components/ScrollRestoration) がスクロール位置をリセットするのを防ぐには、`preventScrollReset` オプションを使用します。

```tsx
navigate("?some-tab=1", { preventScrollReset: true });
```

たとえば、ページの中央に検索パラメーターに接続されたタブインターフェースがあり、タブがクリックされたときにページの上部にスクロールさせたくない場合などに使用します。

### 戻り値の型拡張

内部的には、`useNavigate` は Declarative モードと Data/Framework モードで異なる実装を使用します。主な違いは、後者がナビゲーション間で identity を変更しない安定した参照を返せる点です。Data/Framework モードの実装は、ナビゲーションが完了したときに解決される [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) も返します。これは、`useNavigate` の戻り値の型が `void | Promise<void>` であることを意味します。これは正確ですが、戻り値の union に基づいて、いくつかの赤い波線 (red squigglies) が表示される可能性があります。

-   `typescript-eslint` を使用している場合、[`@typescript-eslint/no-floating-promises`](https://typescript-eslint.io/rules/no-floating-promises) からエラーが表示されることがあります。
-   Framework/Data モードでは、`React.use(navigate())` が誤検出 (`false-positive`) として `Argument of type 'void | Promise<void>' is not assignable to parameter of type 'Usable<void>'` エラーを表示します。

これらの問題を回避する最も簡単な方法は、使用している router に基づいて型を拡張することです。

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