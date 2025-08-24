---
title: CSSファイル
---

# CSSファイル

RemixでCSSファイルを管理する方法は主に2つあります。

* [CSSバンドル][css-bundling]
* [CSS URLインポート][css-url-imports]

このガイドでは、それぞれのアプローチの長所と短所を説明し、プロジェクトの具体的なニーズに基づいた推奨事項を提供します。

## CSSバンドリング

CSSバンドリングは、ReactコミュニティでCSSファイルを管理する最も一般的なアプローチです。このモデルでは、スタイルはモジュールの副作用として扱われ、バンドラーの裁量で1つ以上のCSSファイルにバンドルされます。よりシンプルに使用でき、ボイラープレートが少なく、バンドラーが出力を最適化する能力が高まります。

例えば、いくつかのスタイルが添付された基本的な`Button`コンポーネントがあるとしましょう。

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

このコンポーネントを使用するには、単にインポートしてルートファイルで使用できます。

```jsx filename=routes/hello.jsx
import { Button } from "../components/Button";

export default function HelloRoute() {
  return <Button>Hello!</Button>;
}
```

このコンポーネントを使用する際、個々のCSSファイルを管理する必要はありません。CSSはコンポーネントのプライベートな実装詳細として扱われます。これは多くのコンポーネントライブラリやデザインシステムで一般的なパターンであり、非常にうまくスケールします。

#### CSSバンドルが必要なCSSソリューションもある

CSSファイルの管理方法によっては、バンドルされたCSSの使用が必要になる場合があります。

例えば、[CSS Modules][css-modules]はCSSがバンドルされることを前提に構築されています。CSSファイルのクラス名をJavaScriptオブジェクトとして明示的にインポートしている場合でも、スタイル自体は副作用として扱われ、自動的に出力にバンドルされます。CSSファイルの基になるURLにアクセスすることはできません。

CSSバンドルが必要となるもう1つの一般的なユースケースは、[React Spectrum][react-spectrum]のように、CSSファイルを副作用としてインポートし、バンドラーがそれらを処理することを前提とするサードパーティのコンポーネントライブラリを使用する場合です。

[css-modules]: https://github.com/css-modules/css-modules
[react-spectrum]: https://react-spectrum.adobe.com/

#### CSSの順序は開発環境と本番環境で異なる可能性がある

CSSバンドリングは、Viteのオンデマンドコンパイルのアプローチと組み合わせると、注目すべきトレードオフが生じます。

先ほど紹介した`Button.css`の例を使用すると、このCSSファイルは開発中に次のJavaScriptコードに変換されます。

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

この変換は開発環境でのみ発生することに注意してください。**本番ビルドは、静的なCSSファイルが生成されるため、このようにはなりません。**

Viteは、CSSがインポート時に遅延コンパイルされ、開発中にホットリロードできるようにするためにこれを行います。このファイルがインポートされるとすぐに、CSSファイルの内容が副作用としてページに挿入されます。

このアプローチの欠点は、これらのスタイルがルートのライフサイクルに関連付けられていないことです。つまり、ルートから移動してもスタイルはアンマウントされず、アプリ内を移動中にドキュメント内に古いスタイルが蓄積されることになります。これにより、開発環境と本番環境でCSSルールの順序が異なる可能性があります。

これを軽減するには、ファイル順序の変更に対して耐性のある方法でCSSを記述すると役立ちます。たとえば、[CSS Modules][css-modules]を使用して、CSSファイルがインポートするファイルにスコープされるようにすることができます。また、単一の要素をターゲットとするCSSファイルの数を制限する必要があります。これらのファイルの順序は保証されないためです。

#### 開発中にバンドルされたCSSが消える可能性がある

Viteの開発中のCSSバンドルに関するもう一つの注目すべきトレードオフは、Reactが意図せずドキュメントからスタイルを削除してしまう可能性があることです。

Reactがドキュメント全体をレンダリングするために使用される場合（Remixのように）、要素が動的に`head`要素に挿入される際に問題が発生する可能性があります。ドキュメントが再マウントされると、既存の`head`要素が削除され、完全に新しいものに置き換えられるため、Viteが開発中に挿入する`style`要素が削除されます。

Remixでは、この問題はハイドレーションエラーが原因で発生する可能性があります。ハイドレーションエラーが発生すると、Reactがページ全体を最初から再レンダリングするためです。ハイドレーションエラーはアプリのコードが原因で発生する可能性がありますが、ドキュメントを操作するブラウザ拡張機能が原因で発生することもあります。

これはReactの既知の問題であり、[canaryリリースチャネル][react-canaries]で修正されています。リスクを理解した上で、アプリを特定の[Reactバージョン][react-versions]に固定し、[パッケージオーバーライド][package-overrides]を使用して、プロジェクト全体でこのバージョンのReactのみが使用されるようにすることができます。例：

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

<docs-info>参考までに、Next.jsは内部でReactのバージョン管理をあなたの代わりに行っています。そのため、このアプローチはRemixがデフォルトで提供するものではないにもかかわらず、予想以上に広く使用されています。</docs-info>

繰り返しますが、Viteによって挿入されたスタイルに関するこの問題は、開発中にのみ発生することに注意してください。**本番ビルドでは、静的なCSSファイルが生成されるため、この問題は発生しません。**

[react-canaries]: https://react.dev/blog/2023/05/03/react-canaries
[react-versions]: https://www.npmjs.com/package/react?activeTab=versions
[package-overrides]: https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides

## CSS URL インポート

CSSファイルを管理するもう一つの主な方法は、[Viteの明示的なURLインポート][vite-url-imports]を使用することです。

Viteでは、CSSファイルのインポートに `?url` を追加することで、ファイルのURLを取得できます（例：`import href from "./styles.css?url"`）。このURLは、ルートモジュールからの[linksエクスポート][links-export]を介してRemixに渡すことができます。これにより、CSSファイルがRemixのルーティングライフサイクルに結び付けられ、アプリ内を移動する際にスタイルがドキュメントに挿入および削除されることが保証されます。

たとえば、以前の `Button` コンポーネントの例を使用すると、コンポーネントとともに `links` 配列をエクスポートして、利用者がそのスタイルにアクセスできるようにすることができます。

```jsx filename=components/Button.jsx lines=[1,3-5]
import buttonCssUrl from "./Button.css?url";

export const links = [
  { rel: "stylesheet", href: buttonCssUrl },
];

export function Button(props) {
  return <button {...props} className="Button__root" />;
}
```

このコンポーネントをインポートする場合、利用者はこの `links` 配列もインポートし、ルートの `links` エクスポートにアタッチする必要があります。

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

このアプローチは、各ファイルを細かく制御でき、開発環境と本番環境で一貫した動作を提供するため、ルール順序の点でより予測可能です。開発中のバンドルされたCSSとは対照的に、スタイルは不要になるとドキュメントから削除されます。ページの `head` 要素が再マウントされると、ルートによって定義された `link` タグもReactのライフサイクルの一部であるため、再マウントされます。

このアプローチの欠点は、多くのボイラープレートが発生する可能性があることです。

再利用可能なコンポーネントがそれぞれ独自のCSSファイルを持っている場合、各コンポーネントのすべての `links` をルートコンポーネントまで手動で表面化する必要があります。これにより、CSS URLを複数のレベルのコンポーネントを介して渡す必要が生じる可能性があります。また、コンポーネントの `links` 配列をインポートするのを忘れやすいため、エラーが発生しやすい可能性があります。

その利点にもかかわらず、CSSバンドルと比較して面倒すぎると感じる場合や、追加のボイラープレートがそれだけの価値があると判断する場合があります。これについては、正しいも間違っているもありません。

[vite-url-imports]: https://vitejs.dev/guide/assets.html#explicit-url-imports
[links-export]: https://remix.run/docs/en/main/route/links

## 結論

RemixアプリケーションでCSSファイルを管理する方法は、最終的には個人の好みによりますが、以下が良い経験則です。

* プロジェクトにCSSファイルが少ない場合（例えば、Tailwindを使用している場合で、CSSファイルが1つしかない場合など）、CSS URLインポートを使用すべきです。ボイラープレートの増加は最小限であり、開発環境は本番環境に非常に近くなります。
* プロジェクトに、再利用可能な小さなコンポーネントに紐づいた多数のCSSファイルがある場合は、CSSバンドルのボイラープレートの削減がより人間工学的であると感じるでしょう。ただし、トレードオフを認識し、ファイル順序の変更に対して耐性のある方法でCSSを記述してください。
* 開発中にスタイルが消える問題が発生している場合は、[React canaryリリース][react-canaries]の使用を検討してください。これにより、ページを再マウントするときにReactが既存の`head`要素を削除しないようにできます。

[css-modules]: https://vitejs.dev/guide/features#css-modules

[react-spectrum]: https://react-spectrum.adobe.com

[react-canaries]: https://react.dev/blog/2023/05/03/react-canaries

[react-versions]: https://www.npmjs.com/package/react?activeTab=versions

[package-overrides]: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides

[vite-url-imports]: https://vitejs.dev/guide/assets#explicit-url-imports

[links-export]: ../route/links

[css-bundling]: #css-bundling

[css-url-imports]: #css-url-imports
