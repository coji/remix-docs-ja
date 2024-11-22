---
title: CSS ファイル
---

# CSS ファイル

Remix で CSS ファイルを管理するには、主に 2 つの方法があります。

- [CSS バンドル][css-bundling]
- [CSS URL インポート][css-url-imports]

このガイドでは、それぞれの方法の長所と短所を説明し、プロジェクトの特定のニーズに基づいた推奨事項を紹介します。

## CSS バンドル

CSS バンドルは、React コミュニティで CSS ファイルを管理するための最も一般的な方法です。このモデルでは、スタイルはモジュール副作用として扱われ、バンドラの判断で 1 つ以上の CSS ファイルにバンドルされます。使用が簡単で、ボイラープレートが少なく、バンドラがアウトプットを最適化するためのより多くのパワーを与えます。

たとえば、基本的な `Button` コンポーネントにいくつかのスタイルが添付されているとします。

```css filename=components/Button.css
.Button__root {
  background: blue;
  color: white;
}
```

```jsx filename=components/Button.jsx
import "./Button.css";

export function Button(props) {
  return <button {...props} className="Button__root" />;
}
```

このコンポーネントを使用するには、単にインポートして、ルートファイルで使用します。

```jsx filename=routes/hello.jsx
import { Button } from "../components/Button";

export default function HelloRoute() {
  return <Button>Hello!</Button>;
}
```

このコンポーネントを使用する場合、個々の CSS ファイルを管理する必要はありません。CSS は、コンポーネントのプライベート実装の詳細として扱われます。これは、多くのコンポーネントライブラリやデザインシステムで一般的なパターンであり、非常にうまくスケールします。

#### CSS バンドルは、一部の CSS ソリューションに必要です

CSS ファイルを管理するいくつかの方法では、バンドルされた CSS を使用する必要があります。

たとえば、[CSS Modules][css-modules] は、CSS がバンドルされていることを前提として構築されています。CSS ファイルのクラス名を JavaScript オブジェクトとして明示的にインポートしている場合でも、スタイル自体は依然として副作用として扱われ、アウトプットに自動的にバンドルされます。基になる CSS ファイルの URL にはアクセスできません。

CSS バンドルが必要なもう 1 つの一般的なユースケースは、[React Spectrum][react-spectrum] など、副作用として CSS ファイルをインポートし、バンドラに処理を任せるサードパーティ製のコンポーネントライブラリを使用している場合です。

#### 開発と本番での CSS の順序が異なる場合があります

CSS バンドルには、Vite のオンデマンドコンパイルへのアプローチと組み合わせると、注目すべきトレードオフが伴います。

先に紹介した `Button.css` の例を使用すると、この CSS ファイルは開発中に次の JavaScript コードに変換されます。

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```js
import {createHotContext as __vite__createHotContext} from "/@vite/client";
import.meta.hot = __vite__createHotContext("/app/components/Button.css");
import {updateStyle as __vite__updateStyle, removeStyle as __vite__removeStyle} from "/@vite/client";
const __vite__id = "/path/to/app/components/Button.css";
const __vite__css = ".Button__root{background:blue;color:white;}"
__vite__updateStyle(__vite__id, __vite__css);
import.meta.hot.accept();
import.meta.hot.prune(()=>__vite__removeStyle(__vite__id));
```

<!-- prettier-ignore-end -->

この変換は、開発中のみ行われることを強調しておく必要があります。**本番ビルドでは、静的な CSS ファイルが生成されるため、このような変換は行われません。**

Vite は、インポート時に CSS を遅延コンパイルし、開発中にホットリロードできるようにするために、このような処理を行います。このファイルがインポートされるとすぐに、CSS ファイルの内容は副作用としてページに注入されます。

このアプローチの欠点は、これらのスタイルがルートライフサイクルに関連付けられていないことです。つまり、ルートから移動してもスタイルはアンマウントされず、アプリ内を移動している間にドキュメントに古いスタイルが蓄積されることになります。これにより、開発と本番で CSS ルールの順序が異なる場合があります。

これを軽減するために、ファイルの順序変更に対して CSS を耐性のある方法で記述すると役立ちます。たとえば、[CSS Modules][css-modules] を使用して、CSS ファイルがインポートしたファイルにスコープされるようにすることができます。また、単一の要素をターゲットとする CSS ファイルの数を制限する必要があります。これらのファイルの順序は保証されていないためです。

#### バンドルされた CSS は、開発中に消える可能性があります

開発中の Vite の CSS バンドルへのアプローチのもう 1 つの重要なトレードオフは、React が誤ってドキュメントからスタイルを削除してしまう可能性があることです。

React を使用してドキュメント全体をレンダリングする場合（Remix が行うように）、`head` 要素に動的に要素を注入するときに問題が発生する可能性があります。ドキュメントが再マウントされると、既存の `head` 要素は削除され、まったく新しい要素に置き換えられます。これにより、開発中に Vite が注入したすべての `style` 要素が削除されます。

Remix では、この問題は、React がページ全体を最初からレンダリングし直すため、ハイドレーションエラーが発生する可能性があります。ハイドレーションエラーは、アプリコードによって発生する可能性がありますが、ドキュメントを操作するブラウザ拡張機能によっても発生する可能性があります。

これは、[React のカナリーリリースチャンネル][react-canaries] で修正されている既知の React の問題です。リスクを理解している場合は、アプリを特定の [React バージョン][react-versions] に固定し、[パッケージオーバーライド][package-overrides] を使用して、これがプロジェクト全体で使用される React の唯一のバージョンになるようにすることができます。たとえば、次のようにします。

```json filename=package.json
{
  "dependencies": {
    "react": "18.3.0-canary-...",
    "react-dom": "18.3.0-canary-..."
  },
  "overrides": {
    "react": "18.3.0-canary-...",
    "react-dom": "18.3.0-canary-..."
  }
}
```

<docs-info>参考までに、これは Next.js が内部的にあなたに代わって React バージョン管理を行う方法なので、このアプローチは、Remix がデフォルトで提供していないものであっても、予想以上に広く使用されています。</docs-info>

繰り返しになりますが、この問題は、Vite によって注入されたスタイルにのみ発生し、開発中のみ発生します。**本番ビルドでは、静的な CSS ファイルが生成されるため、この問題は発生しません。**

## CSS URL インポート

CSS ファイルを管理するもう 1 つの主な方法は、[Vite の明示的な URL インポート][vite-url-imports] を使用することです。

Vite を使用すると、CSS ファイルインポートに `?url` を追加して、ファイルの URL を取得できます（例: `import href from "./styles.css?url"`）。この URL は、ルートモジュールからの [links エクスポート][links-export] を介して Remix に渡すことができます。これにより、CSS ファイルは Remix のルーティングライフサイクルに結び付けられ、アプリ内を移動している間にスタイルがドキュメントに注入および削除されることが保証されます。

たとえば、先の `Button` コンポーネントの例と同じように、コンポーネントと共に `links` 配列をエクスポートして、消費者がそのスタイルにアクセスできるようにすることができます。

```jsx filename=components/Button.jsx lines=[1,3-5]
import buttonCssUrl from "./Button.css?url";

export const links = [
  { rel: "stylesheet", href: buttonCssUrl },
];

export function Button(props) {
  return <button {...props} className="Button__root" />;
}
```

このコンポーネントをインポートする場合、消費者はこの `links` 配列もインポートして、ルートの `links` エクスポートに添付する必要があります。

```jsx filename=routes/hello.jsx lines=[3,6]
import {
  Button,
  links as buttonLinks,
} from "../components/Button";

export const links = () => [...buttonLinks];

export default function HelloRoute() {
  return <Button>Hello!</Button>;
}
```

このアプローチは、各ファイルに対して細かい制御を提供し、開発と本番で一貫した動作を提供するため、ルール順序に関してはるかに予測可能です。開発中のバンドルされた CSS とは異なり、スタイルは不要になったらドキュメントから削除されます。ページの `head` 要素が再マウントされた場合、ルートによって定義されたすべての `link` タグも再マウントされます。これらは React ライフサイクルの一部であるためです。

このアプローチの欠点は、多くのボイラープレートが発生する可能性があることです。

再利用可能なコンポーネントが多数あり、それぞれに独自の CSS ファイルがある場合、各コンポーネントのすべての `links` をルートコンポーネントまで手動で公開する必要があります。これには、複数のレベルのコンポーネントを介して CSS URL を渡す必要がある場合があります。これは、コンポーネントの `links` 配列をインポートすることを忘れることが容易なため、エラーが発生する可能性もあります。

利点があるものの、CSS バンドルに比べてあまりにも面倒だと感じるかもしれませんし、追加のボイラープレートが価値があると感じるかもしれません。この点に関しては、正しい答えはありません。

## まとめ

結局のところ、Remix アプリケーションで CSS ファイルを管理する方法は個人の好みですが、次の簡単なルールがあります。

- プロジェクトの CSS ファイル数が少ない場合（Tailwind を使用する場合など、1 つの CSS ファイルしかない場合）、CSS URL インポートを使用する必要があります。追加のボイラープレートは最小限で、開発環境は本番環境に非常に近くなります。
- プロジェクトに、小さな再利用可能なコンポーネントに関連付けられた CSS ファイルが多数ある場合、CSS バンドルを使用すると、ボイラープレートが減り、はるかに人間工学的に優れているでしょう。ただし、トレードオフを理解し、ファイルの順序変更に対して耐性のある方法で CSS を記述してください。
- 開発中にスタイルが消える問題が発生している場合は、[React のカナリーリリース][react-canaries] を使用することを検討してください。これにより、React がページを再マウントする際に既存の `head` 要素が削除されなくなります。

[css-modules]: https://vitejs.dev/guide/features#css-modules
[react-spectrum]: https://react-spectrum.adobe.com
[react-canaries]: https://react.dev/blog/2023/05/03/react-canaries
[react-versions]: https://www.npmjs.com/package/react?activeTab=versions
[package-overrides]: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides
[vite-url-imports]: https://vitejs.dev/guide/assets#explicit-url-imports
[links-export]: ../route/links
[css-bundling]: #css-bundling
[css-url-imports]: #css-url-imports

