---
title: ScrollRestoration
---

# `<ScrollRestoration>`

このコンポーネントは、[`loader`][loader]が完了した後の場所の変更時に、ブラウザのスクロール復元をエミュレートします。これにより、ドメイン間であっても、正しい場所に、正しいタイミングでスクロール位置が復元されます。

これは、[`<Scripts/>`][scripts_component]コンポーネントの直前に、1つだけレンダリングする必要があります。

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

オプション。スクロール位置を復元するために使用されるキーを定義します。

```tsx
<ScrollRestoration
  getKey={(location, matches) => {
    // デフォルトの動作
    return location.key;
  }}
/>
```

<details>

<summary>説明</summary>

`location.key`を使用すると、ブラウザのデフォルトの動作をエミュレートします。ユーザーはスタック内で同じURLに複数回移動できますが、各エントリには復元するための独自のスクロール位置が設定されます。

一部のアプリでは、この動作をオーバーライドして、別のものに基づいて位置を復元する必要がある場合があります。4つの主要なページを持つソーシャルアプリを考えてみましょう。

- "/home"
- "/messages"
- "/notifications"
- "/search"

ユーザーが"/home"から始めて少しスクロールし、ナビゲーションメニューで"messages"をクリックし、次にナビゲーションメニューで"home"をクリックした場合（戻るボタンではなく）、履歴スタックには3つのエントリがあります。

```
1. /home
2. /messages
3. /home
```

デフォルトでは、React Router（およびブラウザ）は、同じURLを持っているにもかかわらず、`1`と`3`に2つの異なるスクロール位置を保存します。つまり、ユーザーが`2`→`3`に移動すると、スクロール位置は`1`の位置に復元されるのではなく、トップに移動します。

ここで、堅実な製品の決定は、ユーザーがどのように移動しても（戻るボタンか新しいリンクをクリックするか）、ホームフィードのユーザーのスクロール位置を維持することです。そのためには、`location.pathname`をキーとして使用する必要があります。

```tsx
<ScrollRestoration
  getKey={(location, matches) => {
    return location.pathname;
  }}
/>
```

または、一部のパスに対してのみパス名を使用し、他のすべてのパスに対しては通常の動作を使用することもできます。

```tsx
<ScrollRestoration
  getKey={(location, matches) => {
    const paths = ["/home", "/notifications"];
    return paths.includes(location.pathname)
      ? // ホームと通知はパス名で復元
        location.pathname
      : // ブラウザのように、その他は場所によって復元
        location.key;
  }}
/>
```

</details>

### `nonce`

`<ScrollRestoration>`は、スクロールのちらつきを防ぐために、インライン[`<script>`][script_element]をレンダリングします。`nonce`プロパティは、スクリプトタグに渡され、CSP nonceの使用を許可します。

```tsx
<ScrollRestoration nonce={cspNonce} />
```

## スクロールリセットの防止

新しい場所に移動すると、スクロール位置はページの上部にリセットされます。リンクとフォームから「スクロールトップ」動作を回避できます。

```tsx
<Link preventScrollReset={true} />;
<Form preventScrollReset={true} />;
```

参照: [`<Form preventScrollReset>`][form_prevent_scroll_reset]、[`<Link preventScrollReset>`][link_prevent_scroll_reset]

[loader]: ../route/loader
[scripts_component]: ./scripts
[script_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
[form_prevent_scroll_reset]: ../components/form#preventscrollreset
[link_prevent_scroll_reset]: ../components/link#preventscrollreset


