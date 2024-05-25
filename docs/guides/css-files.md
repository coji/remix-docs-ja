---
title: CSS ファイル
---

# CSS ファイル

Remix で CSS ファイルを管理するには、主に 2 つの方法があります。

- [CSS バンドル][css-bundling]
- [CSS URL インポート][css-url-imports]

このガイドでは、それぞれの方法の長所と短所を説明し、プロジェクトの特定のニーズに基づいた推奨事項を提供します。

## CSS バンドル

CSS バンドルは、React コミュニティで CSS ファイルを管理するための最も一般的な方法です。このモデルでは、スタイルはモジュール副作用として扱われ、バンドラの裁量で 1 つ以上の CSS ファイルにバンドルされます。使用が簡単で、ボイラープレートが少なく、バンドラに最適化された出力を生成するためのより大きな権限を与えます。

たとえば、いくつかのスタイルが添付された基本的な `Button` コンポーネントがあるとします。

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

このコンポーネントを使用するには、それをインポートしてルートファイルで使用します。

```jsx filename=routes/hello.jsx
import { Button } from "../components/Button";

export default function HelloRoute() {
  return <Button>Hello!</Button>;
}
```

このコンポーネントを使用する場合、個々の CSS ファイルを管理する必要はありません。CSS は、コンポーネントのプライベートな実装の詳細として扱われます。これは、多くのコンポーネントライブラリやデザインシステムで一般的なパターンであり、非常にうまくスケールします。

#### CSS バンドルは、一部の CSS ソリューションに必要です

CSS ファイルを管理する一部のアプローチでは、バンドルされた CSS を使用する必要があります。

たとえば、[CSS Modules][css-modules] は、CSS がバンドルされていることを前提として構築されています。CSS ファイルのクラス名を JavaScript オブジェクトとして明示的にインポートしている場合でも、スタイル自体は副作用として扱われ、出力に自動的にバンドルされます。CSS ファイルの基礎となる URL にアクセスすることはできません。

CSS バンドルが必要になるもう 1 つの一般的なユースケースは、[React Spectrum][react-spectrum] などの、副作用として CSS ファイルをインポートし、バンドラにそれらを処理させるサードパーティ製のコンポーネントライブラリを使用している場合です。

#### CSS の順序は、開発と本番で異なる場合があります

CSS バンドルは、Vite のオンデマンドコンパイルへのアプローチと組み合わせると、注目すべきトレードオフを伴います。

先に示した `Button.css` の例を使用すると、この CSS ファイルは開発中に次の JavaScript コードに変換されます。

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

この変換は開発中のみ行われることを強調しておきます。**本番ビルドは、静的な CSS ファイルが生成されるため、このようにはなりません**。

Vite は、インポート時に CSS を遅延コンパイルし、開発中にホットリロードできるようにするために、これを行います。このファイルがインポートされるとすぐに、CSS ファイルの内容は副作用としてページに挿入されます。

このアプローチの欠点は、これらのスタイルがルートライフサイクルに関連付けられていないことです。つまり、ルートから移動してもスタイルはアンマウントされず、アプリ内を移動中にドキュメントに古いスタイルが蓄積されます。これにより、開発と本番で CSS ルールの順序が異なる場合があります。

これを軽減するには、ファイルの順序変更の影響を受けにくい方法で CSS を記述することが役立ちます。たとえば、[CSS Modules][css-modules] を使用して、CSS ファイルがインポートするファイルにスコープされるようにすることができます。また、1 つの要素をターゲットとする CSS ファイルの数を制限するようにしてください。ファイルの順序は保証されないためです。

#### バンドルされた CSS は、開発中に消えることがあります

Vite の開発中の CSS バンドルへのアプローチに伴うもう 1 つの注目すべきトレードオフは、React が意図せずスタイルをドキュメントから削除してしまうことです。

React がドキュメント全体をレンダリングするために使用される場合（Remix の場合のように）、`head` 要素に動的に要素が挿入されると問題が発生する可能性があります。ドキュメントが再マウントされると、既存の `head` 要素が削除され、まったく新しい要素に置き換えられます。これにより、Vite が開発中に挿入した `style` 要素がすべて削除されます。

Remix では、この問題は、React がページ全体を最初からレンダリングし直すため、ハイドレーションエラーが発生すると発生する可能性があります。ハイドレーションエラーは、アプリコードが原因で発生する可能性がありますが、ドキュメントを操作するブラウザ拡張機能が原因で発生する可能性もあります。

これは、[React のカナリーリリースチャンネル][react-canaries] で修正された、既知の React の問題です。リスクを理解している場合は、アプリを特定の [React バージョン][react-versions] に固定し、[パッケージオーバーライド][package-overrides] を使用して、これがプロジェクト全体で使用される唯一の React バージョンであることを確認できます。たとえば、次のとおりです。

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

<docs-info>参考までに、これは Next.js が内部的にあなたの代わりに React のバージョン管理をどのように行うかです。これは、Remix がデフォルトで提供していないものであっても、このアプローチは広く使用されています。</docs-info>

繰り返しになりますが、この問題は、Vite によって挿入されたスタイルは、開発中のみ発生します。**本番ビルドでは、静的な CSS ファイルが生成されるため、この問題は発生しません**。

## CSS URL インポート

CSS ファイルを管理するもう 1 つの主な方法は、[Vite の明示的な URL インポート][vite-url-imports] を使用するものです。

Vite を使用すると、CSS ファイルインポートに `?url` を追加して、ファイルの URL を取得できます（例：`import href from "./styles.css?url"`）。この URL は、その後、ルートモジュールからの [リンクエクスポート][links-export] を介して Remix に渡すことができます。これにより、CSS ファイルが Remix のルーティングライフサイクルに結び付けられ、アプリ内を移動しながらスタイルが挿入および削除されます。

たとえば、前の `Button` コンポーネントの例と同じように、コンポーネントと一緒に `links` 配列をエクスポートして、消費者がそのスタイルにアクセスできるようにすることができます。

```jsx filename=components/Button.jsx lines=[1,3-5]
import buttonCssUrl from "./Button.css?url";

export const links = [
  { rel: "stylesheet", href: buttonCssUrl },
];

export function Button(props) {
  return <button {...props} className="Button__root" />;
}
```

このコンポーネントをインポートする場合、消費者はこの `links` 配列もインポートし、それをルートの `links` エクスポートにアタッチする必要があります。

```jsx filename=routes/hello.jsx lines=[3,6]
import {
  Button,
  links as buttonLinks,
} from "../components/Button";

export const links = [...buttonLinks];

export default function HelloRoute() {
  return <Button>Hello!</Button>;
}
```

このアプローチは、各ファイルに対して細かい制御を提供し、開発と本番で一貫した動作を提供するため、ルールの順序に関してはるかに予測可能です。開発中のバンドルされた CSS とは異なり、スタイルは不要になったらドキュメントから削除されます。ページの `head` 要素が再マウントされた場合、ルートによって定義されたすべての `link` タグも再マウントされます。それらは React ライフサイクルの一部だからです。

このアプローチの欠点は、多くのボイラープレートが発生する可能性があることです。

再利用可能なコンポーネントが多数あり、それぞれに独自の CSS ファイルがある場合、各コンポーネントのすべての `links` をルートコンポーネントまで手動で公開する必要があります。これには、複数のレベルのコンポーネントを介して CSS URL を渡す必要がある場合があり、そのためエラーが発生しやすくなります。コンポーネントの `links` 配列のインポートを忘れるのが簡単だからです。

利点があるにもかかわらず、CSS バンドルに比べて面倒だと感じる場合や、追加のボイラープレートがそれだけの価値があると思うかもしれません。これについては、正しいか間違っているかはありません。

## まとめ

最終的には、Remix アプリケーションで CSS ファイルを管理する場合、個人的な好みになります。しかし、次のルールは参考になるでしょう。

- プロジェクトに CSS ファイルがほんの数個しかない場合（Tailwind を使用する場合など、単一の CSS ファイルしかない場合）、CSS URL インポートを使用する必要があります。ボイラープレートの増加は最小限であり、開発環境は本番環境にかなり近いものになります。
- プロジェクトに、小さな再利用可能なコンポーネントに関連付けられた CSS ファイルが多数ある場合、CSS バンドルは、ボイラープレートの削減によって、はるかに人間工学的であることがわかります。ただし、トレードオフを理解し、ファイルの順序変更の影響を受けにくい方法で CSS を記述してください。
- 開発中にスタイルが消える問題が発生している場合は、[React カナリーリリース][react-canaries] を使用することを検討してください。これにより、React は、ページを再マウントしても、既存の `head` 要素を削除しません。

[css-modules]: https://vitejs.dev/guide/features#css-modules
[react-spectrum]: https://react-spectrum.adobe.com
[react-canaries]: https://react.dev/blog/2023/05/03/react-canaries
[react-versions]: https://www.npmjs.com/package/react?activeTab=versions
[package-overrides]: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides
[vite-url-imports]: https://vitejs.dev/guide/assets#explicit-url-imports
[links-export]: ../route/links
[css-bundling]: #css-bundling
[css-url-imports]: #css-url-imports
