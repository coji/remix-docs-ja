---
title: ホットモジュール置換
---

# ホットモジュール置換

ホットモジュール置換 (Hot Module Replacement: HMR) は、ページを再読み込みすることなくアプリのモジュールを更新するテクニックです。
開発者にとって素晴らしい体験であり、Vite を使用する場合、React Router はこれをサポートしています。

HMR は、更新間でブラウザの状態を保持するよう最善を尽くします。
たとえば、モーダル内にフォームがあり、すべてのフィールドに入力したとします。
コードに何か変更を保存するとすぐに、従来のライブリロードではページがハードリフレッシュされ、それらのフィールドがすべてリセットされます。
変更を加えるたびに、モーダルを_再度_開いて、フォームを_再度_入力する必要があります。

しかし、HMR を使用すると、それらの状態はすべて_更新間で_保持されます。


## React ファーストリフレッシュ

React は既に、ボタンをクリックするなどのユーザー操作に応答して、[仮想 DOM][virtual-dom] を介して DOM を更新するためのメカニズムを持っています。
React がコードの変更にも応答して DOM の更新を処理できたら素晴らしいと思いませんか？

それがまさに [React ファーストリフレッシュ][react-refresh] の目的です！
もちろん、React は一般的な JavaScript コードではなく、コンポーネントに関するものなので、React ファーストリフレッシュはエクスポートされた React コンポーネントのホットアップデートのみを処理します。

しかし、React ファーストリフレッシュには、認識しておくべきいくつかの制限があります。


### クラスコンポーネントの状態

React ファーストリフレッシュは、クラスコンポーネントの状態を保持しません。
これには、内部的にクラスを返す高階コンポーネントも含まれます。

```tsx
export class ComponentA extends Component {} // ❌

export const ComponentB = HOC(ComponentC); // ❌ HOCがクラスコンポーネントを返す場合は機能しません

export function ComponentD() {} // ✅
export const ComponentE = () => {}; // ✅
export default function ComponentF() {} // ✅
```

### 名前付き関数コンポーネント

関数コンポーネントは、React ファーストリフレッシュが変更を追跡するために、匿名ではなく名前付きである必要があります。

```tsx
export default () => {}; // ❌
export default function () {} // ❌

const ComponentA = () => {};
export default ComponentA; // ✅

export default function ComponentB() {} // ✅
```

### サポートされているエクスポート

React ファーストリフレッシュは、コンポーネントのエクスポートのみを処理できます。React Router は [ `action` 、 `headers` 、 `links` 、 `loader` 、 `meta` などのルートエクスポート][route-module] を処理しますが、ユーザー定義のエクスポートは完全な再読み込みを引き起こします。

```tsx
// これらのエクスポートは、HMR と互換性を持つように React Router Vite プラグインによって処理されます
export const meta = { title: "Home" }; // ✅
export const links = [
  { rel: "stylesheet", href: "style.css" },
]; // ✅

// これらのエクスポートは、React Router Vite プラグインによって削除されるため、HMR に影響を与えません
export const headers = { "Cache-Control": "max-age=3600" }; // ✅
export const loader = async () => {}; // ✅
export const action = async () => {}; // ✅

// これはルートモジュールエクスポートでもコンポーネントエクスポートでもないので、このルートで完全な再読み込みが発生します
export const myValue = "some value"; // ❌

export default function Route() {} // ✅
```

👆 ルートは、そもそもそのようなランダムな値をエクスポートすべきではありません。
ルート間で値を再利用する場合は、独自の非ルートモジュールに配置します。

```ts filename=my-custom-value.ts
export const myValue = "some value";
```

### フックの変更

React ファーストリフレッシュは、フックが追加または削除されているコンポーネントの変更を追跡できません。そのため、次のレンダリングのために完全な再読み込みが発生します。フックが更新された後、変更は再びホットアップデートになります。たとえば、コンポーネントに `useState` を追加すると、次のレンダリングでそのコンポーネントのローカル状態が失われる可能性があります。

さらに、フックの戻り値をデストラクチャリングしている場合、デストラクチャリングされたキーが削除または名前が変更されると、React ファーストリフレッシュはコンポーネントの状態を保持できません。
たとえば、以下のようにします。

```tsx
export default function Component({ loaderData }) {
  const { pet } = useMyCustomHook();
  return (
    <div>
      <input />
      <p>My dog's name is {pet.name}!</p>
    </div>
  );
}
```

`pet` キーを `dog` に変更した場合：

```diff
 export default function Component() {
-  const { pet } = useMyCustomHook();
+  const { dog } = useMyCustomHook();
   return (
     <div>
       <input />
-      <p>My dog's name is {pet.name}!</p>
+      <p>My dog's name is {dog.name}!</p>
     </div>
   );
 }
```

React ファーストリフレッシュは `<input />` の状態を保持できません ❌。


### コンポーネントキー

場合によっては、React は既存のコンポーネントの変更と新しいコンポーネントの追加を区別できません。[React は、これらの場合を区別し、兄弟要素が変更されたときに変更を追跡するために `key` を必要とします。][react-keys]

[virtual-dom]: https://reactjs.org/docs/faq-internals.html#what-is-the-virtual-dom
[react-refresh]: https://github.com/facebook/react/tree/main/packages/react-refresh
[react-keys]: https://react.dev/learn/rendering-lists#why-does-react-need-keys
[route-module]: ../start/framework/route-module


