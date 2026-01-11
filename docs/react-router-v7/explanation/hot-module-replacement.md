---
title: ホットモジュールリプレースメント
---

# ホットモジュールリプレースメント

[MODES: framework]

<br/>
<br/>

ホットモジュールリプレースメント（HMR）は、ページをリロードせずにアプリ内のモジュールを更新する技術です。
これは素晴らしい開発体験であり、React RouterはViteを使用している場合にこれをサポートします。

HMRは、更新間でブラウザの状態を維持するために最善を尽くします。
たとえば、モーダル内にフォームがあり、すべてのフィールドに入力したとしましょう。
コードに変更を保存するとすぐに、従来のライブリロードではページがハードリフレッシュされ、すべてのフィールドがリセットされます。
変更を加えるたびに、モーダルを_再度_開き、フォームを_再度_入力する必要があります。

しかし、HMRを使用すると、すべての状態が_更新間で_保持されます。

## React Fast Refresh

Reactには、ボタンをクリックするなどのユーザーインタラクションに応じて[仮想DOM][virtual-dom]を介してDOMを更新するメカニズムがすでにあります。
Reactがコードの変更に応じてDOMの更新も処理できたら素晴らしいと思いませんか？

それがまさに[React Fast Refresh][react-refresh]の目的です！
もちろん、Reactは一般的なJavaScriptコードではなくコンポーネントに関するものなので、React Fast RefreshはエクスポートされたReactコンポーネントのホットアップデートのみを処理します。

ただし、React Fast Refreshには注意すべきいくつかの制限があります。

### クラスコンポーネントの状態

React Fast Refreshは、クラスコンポーネントの状態を保持しません。
これには、内部的にクラスを返す高階コンポーネントが含まれます。

```tsx
export class ComponentA extends Component {} // ❌

export const ComponentB = HOC(ComponentC); // ❌ HOCがクラスコンポーネントを返す場合は機能しません

export function ComponentD() {} // ✅
export const ComponentE = () => {}; // ✅
export default function ComponentF() {} // ✅
```

### 名前付き関数コンポーネント

関数コンポーネントは、React Fast Refreshが変更を追跡するために、匿名ではなく名前付きである必要があります。

```tsx
export default () => {}; // ❌
export default function () {} // ❌

const ComponentA = () => {};
export default ComponentA; // ✅

export default function ComponentB() {} // ✅
```

### サポートされているエクスポート

React Fast Refreshは、コンポーネントのエクスポートのみを処理できます。React Routerは、[ `action`、`headers`、`links`、`loader`、`meta`などのルートエクスポート][route-module]を管理しますが、ユーザー定義のエクスポートは完全なリロードを引き起こします。

```tsx
// これらのエクスポートは、React Router Viteプラグインによって処理されます
// HMR互換にするため
export const meta = { title: "Home" }; // ✅
export const links = [
  { rel: "stylesheet", href: "style.css" },
]; // ✅

// これらのエクスポートは、React Router Viteプラグインによって削除されます
// そのため、HMRに影響を与えることはありません
export const headers = { "Cache-Control": "max-age=3600" }; // ✅
export const loader = async () => {}; // ✅
export const action = async () => {}; // ✅

// これはルートモジュールのエクスポートでもコンポーネントのエクスポートでもないため、
// このルートの完全なリロードを引き起こします
export const myValue = "some value"; // ❌

export default function Route() {} // ✅
```

👆 ルートは、とにかくそのようなランダムな値をエクスポートするべきではありません。
ルート間で値を再利用したい場合は、ルート以外の独自のモジュールにそれらを貼り付けてください。

```ts filename=my-custom-value.ts
export const myValue = "some value";
```

### フックの変更

React Fast Refreshは、フックがコンポーネントに追加または削除されている場合、コンポーネントの変更を追跡できません。これにより、次のレンダリングのためだけに完全なリロードが発生します。フックが更新された後、変更は再びホットアップデートになるはずです。たとえば、コンポーネントに`useState`を追加すると、次のレンダリングでそのコンポーネントのローカル状態が失われる可能性があります。

さらに、フックの戻り値を分割代入している場合、分割代入されたキーが削除または名前変更された場合、React Fast Refreshはコンポーネントの状態を保持できません。
例：

```tsx
export default function Component({ loaderData }) {
  const { pet } = useMyCustomHook();
  return (
    <div>
      <input />
      <p>私の犬の名前は{pet.name}です！</p>
    </div>
  );
}
```

キー`pet`を`dog`に変更した場合：

```diff
 export default function Component() {
-  const { pet } = useMyCustomHook();
+  const { dog } = useMyCustomHook();
   return (
     <div>
       <input />
-      <p>私の犬の名前は{pet.name}です！</p>
+      <p>私の犬の名前は{dog.name}です！</p>
     </div>
   );
 }
```

React Fast Refreshは、状態`<input />`❌を保持できません。

### コンポーネントキー

場合によっては、Reactは変更されている既存のコンポーネントと追加されている新しいコンポーネントを区別できません。[Reactは、これらのケースを曖昧さを解消し、兄弟要素が変更されたときに変更を追跡するために`key`が必要です][react-keys]。

[virtual-dom]: https://reactjs.org/docs/faq-internals.html#what-is-the-virtual-dom
[react-refresh]: https://github.com/facebook/react/tree/main/packages/react-refresh
[react-keys]: https://react.dev/learn/rendering-lists#why-does-react-need-keys
[route-module]: ../start/framework/route-module