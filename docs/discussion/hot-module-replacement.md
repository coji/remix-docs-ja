---
title: ホットモジュール置換
---

# ホットモジュール置換

ホットモジュール置換とは、ページをリロードすることなくアプリケーションのモジュールを更新するテクニックです。
開発者エクスペリエンスを向上させる素晴らしいテクニックであり、Remixはこれを標準でサポートしています。

特に、HMRは更新時にブラウザの状態を維持しようとします。
モーダル内にフォームがあり、すべてのフィールドに入力した場合、従来のライブリロードではページがハードリフレッシュされます。
そのため、フォーム内のすべてのデータが失われます。
変更を加えるたびに、_再度_モーダルを開き、_再度_フォームに入力する必要があります。 😭

しかし、HMRでは、そのような状態は_更新間_で維持されます。 ✨

## React Fast Refresh

Reactには、ボタンをクリックするなどのユーザー操作に応答して、[仮想DOM][virtual-dom] を介してDOMを更新するメカニズムがすでに存在します。
コードの変更に応答してDOMの更新をReactが処理できたら、素晴らしいと思いませんか？

それがまさに[React Fast Refresh][react-refresh] の目的です！
もちろん、Reactは一般的なJavaScriptコードではなく、コンポーネントを中心としたものなので、RFR単体では、エクスポートされたReactコンポーネントのホット更新のみを処理します。

しかし、React Fast Refreshには、認識しておく必要があるいくつかの制限があります。

### クラスコンポーネントの状態

React Fast Refreshは、クラスコンポーネントの状態を維持しません。
これには、内部的にクラスを返す高階コンポーネントが含まれます。

```tsx
export class ComponentA extends Component {} // ❌

export const ComponentB = HOC(ComponentC); // ❌ HOCがクラスコンポーネントを返す場合、機能しません

export function ComponentD() {} // ✅
export const ComponentE = () => {}; // ✅
export default function ComponentF() {} // ✅
```

### 名前付き関数コンポーネント

関数コンポーネントは、React Fast Refreshが変更を追跡するために、匿名ではなく名前付きにする必要があります。

```tsx
export default () => {}; // ❌
export default function () {} // ❌

const ComponentA = () => {};
export default ComponentA; // ✅

export default function ComponentB() {} // ✅
```

### サポートされているエクスポート

React Fast Refreshは、コンポーネントエクスポートのみを処理できます。Remixは、[`action`][action]、[`headers`][headers]、[`links`][links]、[`loader`][loader]、[`meta`][meta]など、特別なルートエクスポートを管理しますが、ユーザー定義のエクスポートはすべて、完全なリロードを引き起こします。

```tsx
// これらのエクスポートは、Remix Viteプラグインによって処理され、
// HMR互換になります
export const meta = { title: "Home" }; // ✅
export const links = [
  { rel: "stylesheet", href: "style.css" },
]; // ✅

// これらのエクスポートは、Remix Viteプラグインによって削除されるため、
// HMRに影響を与えることはありません
export const headers = { "Cache-Control": "max-age=3600" }; // ✅
export const loader = async () => {}; // ✅
export const action = async () => {}; // ✅

// これは、Remixのエクスポートでもコンポーネントのエクスポートでもなく、
// そのため、このルートの完全なリロードが発生します
export const myValue = "some value"; // ❌

export default function Route() {} // ✅
```

👆 ルートは、このようなランダムな値をエクスポートしない方が良いでしょう。
ルート間で値を再利用する必要がある場合は、独自の非ルートモジュールに格納してください。

```ts filename=my-custom-value.ts
export const myValue = "some value";
```

### フックの変更

React Fast Refreshは、フックが追加または削除された場合、コンポーネントの変更を追跡できません。そのため、次のレンダリングの際に完全なリロードが発生します。フックが更新された後、変更は再びホット更新になるはずです。たとえば、コンポーネントに[`useLoaderData`][use-loader-data]を追加した場合、そのレンダリングの際に、そのコンポーネントのローカルな状態が失われる可能性があります。

さらに、フックの戻り値をデストラクチャリングしている場合、デストラクチャリングされたキーが削除または名前変更された場合、React Fast Refreshはコンポーネントの状態を維持できません。
たとえば、次のような場合です。

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

キー`stuff`を`things`に変更した場合：

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

React Fast Refreshは、`<input />`の状態を維持できません ❌。

回避策として、デストラクチャリングを避け、代わりにフックの戻り値を直接使用できます。

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

これで、キー`stuff`を`things`に変更した場合：

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

React Fast Refreshは`<input />`の状態を維持しますが、次のセクションで説明されているように、状態のある要素（例：`<input />`）が変更された要素の兄弟要素である場合は、コンポーネントキーを使用する必要がある場合があります。

### コンポーネントキー

場合によっては、Reactは、既存のコンポーネントが変更されたのか、新しいコンポーネントが追加されたのかを区別できません。[Reactは、これらの場合を区別し、兄弟要素が変更されたときに変更を追跡するために`key`を必要とします][react-keys]。

[virtual-dom]: https://reactjs.org/docs/faq-internals.html#what-is-the-virtual-dom
[react-refresh]: https://github.com/facebook/react/tree/main/packages/react-refresh
[action]: ../route/action
[headers]: ../route/headers
[links]: ../route/links
[loader]: ../route/loader
[meta]: ../route/meta
[use-loader-data]: ../hooks/use-loader-data
[react-keys]: https://react.dev/learn/rendering-lists#why-does-react-need-keys


