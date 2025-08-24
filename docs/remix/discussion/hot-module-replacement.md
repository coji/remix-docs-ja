---
title: ホットモジュールリプレースメント
---

# ホットモジュールリプレースメント

ホットモジュールリプレースメントは、ページをリロードせずにアプリ内のモジュールを更新する技術です。
これは素晴らしい開発者体験であり、Remix はこれをすぐにサポートしています。

特に、HMR は更新間でブラウザの状態を維持するために最善を尽くします。
モーダル内に`form`があり、すべてのフィールドに入力した場合、従来のリロードではページがハードリフレッシュされます。
そのため、フォーム内のすべてのデータが失われます。
変更を加えるたびに、モーダルを _再度_ 開いてフォームを _再度_ 入力する必要があります。😭

しかし、HMR を使用すると、すべての状態が _更新間で_ 維持されます。✨

## React Fast Refresh

React には、ボタンのクリックなどのユーザーインタラクションに応じて、[仮想 DOM][virtual-dom] を介して DOM を更新するメカニズムがすでにあります。
React がコードの変更にも応答して DOM の更新を処理できたら素晴らしいと思いませんか？

それがまさに [React Fast Refresh][react-refresh] の目的です！
もちろん、React は一般的な JavaScript コードではなくコンポーネントに関するものなので、RFR 自体はエクスポートされた React コンポーネントのホットアップデートのみを処理します。

ただし、React Fast Refresh には注意すべきいくつかの制限があります。

### クラスコンポーネントの状態

React Fast Refresh は、クラスコンポーネントの状態を保持しません。
これには、内部でクラスを返す高階コンポーネントが含まれます。

```tsx
export class ComponentA extends Component {} // ❌

export const ComponentB = HOC(ComponentC); // ❌ HOC がクラスコンポーネントを返す場合は機能しません

export function ComponentD() {} // ✅
export const ComponentE = () => {}; // ✅
export default function ComponentF() {} // ✅
```

### 名前付き関数コンポーネント

関数コンポーネントは、React Fast Refresh が変更を追跡するために、匿名ではなく名前付きである必要があります。

```tsx
export default () => {}; // ❌
export default function () {} // ❌

const ComponentA = () => {};
export default ComponentA; // ✅

export default function ComponentB() {} // ✅
```

### サポートされているエクスポート

React Fast Refresh は、コンポーネントのエクスポートのみを処理できます。Remix は、[`action`][action]、[`headers`][headers]、[`links`][links]、[`loader`][loader]、[`meta`][meta] などの特別なルートエクスポートを管理しますが、ユーザー定義のエクスポートは完全なリロードを引き起こします。

```tsx
// これらのエクスポートは、HMR と互換性があるように Remix Vite プラグインによって処理されます
export const meta = { title: "Home" }; // ✅
export const links = [
  { rel: "stylesheet", href: "style.css" },
]; // ✅

// これらのエクスポートは、HMR に影響を与えないように Remix Vite プラグインによって削除されます
export const headers = { "Cache-Control": "max-age=3600" }; // ✅
export const loader = async () => {}; // ✅
export const action = async () => {}; // ✅

// これは Remix エクスポートでもコンポーネントエクスポートでもないため、このルートの完全なリロードを引き起こします
export const myValue = "some value"; // ❌

export default function Route() {} // ✅
```

👆 ルートは、いずれにしてもそのようなランダムな値をエクスポートすべきではありません。
ルート間で値を再利用したい場合は、ルート以外の独自のモジュールにそれらを貼り付けてください。

```ts filename=my-custom-value.ts
export const myValue = "some value";
```

### フックの変更

React Fast Refresh は、フックがコンポーネントに追加または削除されている場合、コンポーネントの変更を追跡できず、次のレンダリングのためだけに完全なリロードを引き起こします。フックが更新された後、変更は再びホットアップデートになるはずです。たとえば、[`useLoaderData`][use-loader-data] をコンポーネントに追加すると、そのレンダリングのためにそのコンポーネントにローカルな状態が失われる可能性があります。

さらに、フックの戻り値を分割代入している場合、分割代入されたキーが削除または名前変更された場合、React Fast Refresh はコンポーネントの状態を保持できません。
例：

```tsx
export const loader = async () => {
  return json({ stuff: "some things" });
};

export default function Component() {
  const { stuff } = useLoaderData<typeof loader>();
  return (
    <div>
      <input />
      <p>{stuff}</p>
    </div>
  );
}
```

キー `stuff` を `things` に変更した場合：

```diff
  export const loader = async () => {
-   return json({ stuff: "some things" })
+   return json({ things: "some things" })
  }

  export default Component() {
-   const { stuff } = useLoaderData<typeof loader>()
+   const { things } = useLoaderData<typeof loader>()
    return (
      <div>
        <input />
-       <p>{stuff}</p>
+       <p>{things}</p>
      </div>
    )
  }
```

次に、React Fast Refresh は状態 `<input />` ❌ を保持できません。

回避策として、分割代入を控え、代わりにフックの戻り値を直接使用できます。

```tsx
export const loader = async () => {
  return json({ stuff: "some things" });
};

export default function Component() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <input />
      <p>{data.stuff}</p>
    </div>
  );
}
```

ここで、キー `stuff` を `things` に変更した場合：

```diff
  export const loader = async () => {
-   return json({ stuff: "some things" })
+   return json({ things: "some things" })
  }

  export default Component() {
    const data = useLoaderData<typeof loader>()
    return (
      <div>
        <input />
-       <p>{data.stuff}</p>
+       <p>{data.things}</p>
      </div>
    )
  }
```

次に、React Fast Refresh は `<input />` の状態を保持しますが、状態を持つ要素（例：`<input />`）が変更された要素の兄弟である場合は、次のセクションで説明するようにコンポーネントキーを使用する必要がある場合があります。

### コンポーネントキー

場合によっては、React は変更されている既存のコンポーネントと追加されている新しいコンポーネントを区別できません。[React は、これらのケースを曖昧さを解消し、兄弟要素が変更されたときに変更を追跡するために `key`s が必要です][react-keys]。

[virtual-dom]: https://reactjs.org/docs/faq-internals.html#what-is-the-virtual-dom
[react-refresh]: https://github.com/facebook/react/tree/main/packages/react-refresh
[action]: ../route/action
[headers]: ../route/headers
[links]: ../route/links
[loader]: ../route/loader
[meta]: ../route/meta
[use-loader-data]: ../hooks/use-loader-data
[react-keys]: https://react.dev/learn/rendering-lists#why-does-react-need-keys