---
title: ScrollRestoration
---

# `<ScrollRestoration>`

このコンポーネントは、[`loader`][loader] が完了した後のロケーション変更時に、ブラウザのスクロール復元をエミュレートします。これにより、ドメインをまたいでも、スクロール位置が適切な場所に、適切なタイミングで復元されることが保証されます。

このコンポーネントは、[`<Scripts/>`][scripts_component] コンポーネントの直前に1つだけレンダリングする必要があります。

```tsx lines=[3,11]
import {
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export default function Root() {
  return (
    <html>
      <body>
        {/* ... */}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

## Props

### `getKey`

オプション。スクロール位置の復元に使用するキーを定義します。

```tsx
<ScrollRestoration
  getKey={(location, matches) => {
    // デフォルトの動作
    return location.key;
  }}
/>
```

<details>

<summary>解説</summary>

`location.key` を使用すると、ブラウザのデフォルトの動作がエミュレートされます。ユーザーは、スタック内で同じ URL に複数回移動でき、各エントリには復元する独自のスクロール位置が設定されます。

一部のアプリでは、この動作をオーバーライドして、別のものに基づいて位置を復元したい場合があります。4つの主要なページを持つソーシャルアプリを考えてみましょう。

- "/home"
- "/messages"
- "/notifications"
- "/search"

ユーザーが "/home" から開始し、少し下にスクロールし、ナビゲーションメニューで「メッセージ」をクリックし、次にナビゲーションメニューで「ホーム」をクリックした場合（戻るボタンではない！）、履歴スタックには3つのエントリがあります。

```
1. /home
2. /messages
3. /home
```

デフォルトでは、React Router（およびブラウザ）は、同じ URL を持っていても、`1` と `3` に対して2つの異なるスクロール位置を保存します。つまり、ユーザーが `2` → `3` に移動すると、スクロール位置は `1` の位置に復元されるのではなく、先頭に移動します。

ここでの確実な製品決定は、ユーザーがどのようにそこに到達したか（戻るボタンまたは新しいリンクのクリック）に関係なく、ホームフィードのユーザーのスクロール位置を維持することです。このためには、キーとして `location.pathname` を使用する必要があります。

```tsx
<ScrollRestoration
  getKey={(location, matches) => {
    return location.pathname;
  }}
/>
```

または、一部のパスでのみパス名を使用し、それ以外のすべてで通常の動作を使用することもできます。

```tsx
<ScrollRestoration
  getKey={(location, matches) => {
    const paths = ["/home", "/notifications"];
    return paths.includes(location.pathname)
      ? // ホームと通知はパス名で復元
        location.pathname
      : // その他はブラウザのようにロケーションで復元
        location.key;
  }}
/>
```

</details>

### `nonce`

`<ScrollRestoration>` は、スクロールのちらつきを防ぐためにインラインの [`<script>`][script_element] をレンダリングします。`nonce` プロパティは、CSP nonce の使用を許可するためにスクリプトタグに渡されます。

```tsx
<ScrollRestoration nonce={cspNonce} />
```

## スクロールリセットの防止

新しいロケーションに移動すると、スクロール位置はページの先頭にリセットされます。リンクとフォームから「先頭にスクロール」する動作を防ぐことができます。

```tsx
<Link preventScrollReset={true} />;
<Form preventScrollReset={true} />;
```

参照: [`<Form preventScrollReset>`][form_prevent_scroll_reset], [`<Link preventScrollReset>`][link_prevent_scroll_reset]

[loader]: ../route/loader
[scripts_component]: ./scripts
[script_element]: https://developer.mozilla.org/ja/docs/Web/HTML/Element/script
[form_prevent_scroll_reset]: ../components/form#preventscrollreset
[link_prevent_scroll_reset]: ../components/link#preventscrollreset

