---
title: 落とし穴
---

# 注意点

Reactでアプリをサーバーとブラウザの両方でレンダリングする際には、いくつかの固有の注意点があります。さらに、Remixを構築するにあたり、私たちはプロダクションでの結果とスケーラビリティに重点を置いてきました。そのため、開発者体験やエコシステムとの互換性において、まだ解決できていない問題がいくつか存在します。

このドキュメントは、これらの問題を乗り越えるのに役立つはずです。

## `typeof window` のチェック

同じ JavaScript コードがブラウザとサーバーの両方で実行される可能性があるため、コードの一部を一方のコンテキストでのみ実行する必要がある場合があります。

```ts bad
if (typeof window === "undefined") {
  // サーバー環境で実行中
} else {
  // ブラウザ環境で実行中
}
```

これは Node.js 環境では問題なく動作しますが、Deno は実際に `window` をサポートしています！そのため、ブラウザで実行しているかどうかを本当に確認したい場合は、代わりに `document` をチェックする方が良いでしょう。

```ts good
if (typeof document === "undefined") {
  // サーバー環境で実行中
} else {
  // ブラウザ環境で実行中
}
```

これは、すべての JS 環境（Node.js、Deno、Workers など）で機能します。

## ブラウザ拡張機能によるコードの挿入

ブラウザで次のような警告が表示されることがあります。

```
Warning: Did not expect server HTML to contain a <script> in <html>.
```

これはReactのハイドレーション警告であり、おそらくブラウザ拡張機能のいずれかがサーバーレンダリングされたHTMLにスクリプトを挿入し、結果のHTMLとの間に差異が生じていることが原因です。

シークレットモードでページを確認すると、警告は消えるはずです。

## `loader` でのセッションへの書き込み

通常、セッションへの書き込みはアクションでのみ行うべきですが、ローダーで書き込むことが理にかなう場合もあります（匿名ユーザー、ナビゲーション追跡など）。

複数のローダーが同じセッションから*読み取る*ことはできますが、ローダーでセッションに*書き込む*と問題が発生する可能性があります。

Remix ローダーは並行して実行され、場合によっては別々のリクエストで実行されます（クライアント遷移は各ローダーに対して [`fetch`][fetch] を呼び出します）。あるローダーがセッションに書き込んでいる間に、別のローダーがそこから読み取ろうとすると、バグや非決定的な動作が発生します。

さらに、セッションはブラウザのリクエストから来るクッキーに基づいて構築されます。セッションをコミットした後、[`Set-Cookie`][set_cookie_header] ヘッダーでブラウザに送信され、次のリクエストで [`Cookie`][cookie_header] ヘッダーでサーバーに返送されます。並列ローダーに関係なく、`Set-Cookie` でクッキーに書き込み、元のリクエストの `Cookie` からそれを読み取ろうとしても、更新された値は期待できません。最初にブラウザへの往復が必要で、次のリクエストから来る必要があります。

ローダーでセッションに書き込む必要がある場合は、そのローダーが他のローダーとセッションを共有しないようにしてください。

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/fetch
[set_cookie_header]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
[cookie_header]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie

## クライアントバンドル内のサーバーコード

<docs-warning>このセクションは、[Classic Remix Compiler][classic-remix-compiler] を使用している場合にのみ関連します。</docs-warning>

ブラウザでこの奇妙なエラーが発生することがあります。これはほとんどの場合、サーバーコードがブラウザバンドルに入り込んだことを意味します。

```
TypeError: Cannot read properties of undefined (reading 'root')
```

たとえば、`fs-extra` をルートモジュールに直接インポートすることはできません。

```tsx bad filename=app/routes/_index.tsx lines=[2] nocopy
import { json } from "@remix-run/node"; // or cloudflare/deno
import fs from "fs-extra";

export async function loader() {
  return json(await fs.pathExists("../some/path"));
}

export default function SomeRoute() {
  // ...
}
```

これを修正するには、`*.server.ts` または `*.server.js` という名前の別のモジュールにインポートを移動し、そこからインポートします。この例では、`utils/fs-extra.server.ts` に新しいファイルを作成します。

```ts filename=app/utils/fs-extra.server.ts
export { default } from "fs-extra";
```

次に、ルート内のインポートを新しい「ラッパー」モジュールに変更します。

```tsx filename=app/routes/_index.tsx lines=[3]
import { json } from "@remix-run/node"; // or cloudflare/deno

import fs from "~/utils/fs-extra.server";

export async function loader() {
  return json(await fs.pathExists("../some/path"));
}

export default function SomeRoute() {
  // ...
}
```

さらに良いのは、プロジェクトにプルリクエストを送信して、`package.json` に `"sideEffects": false` を追加し、ツリーシェイクを行うバンドラーがブラウザバンドルからコードを安全に削除できることを知らせることです。

同様に、サーバー専用のコードに依存する関数をルートモジュールのトップレベルスコープで呼び出すと、同じエラーが発生する可能性があります。

たとえば、[Remix のアップロードハンドラーである `unstable_createFileUploadHandler` や `unstable_createMemoryUploadHandler`][parse_multipart_form_data_upload_handler] は、内部で Node グローバルを使用しており、サーバーでのみ呼び出す必要があります。これらの関数のいずれかを `*.server.ts` または `*.server.js` ファイルで呼び出すか、ルートの `action` または `loader` 関数に移動できます。

したがって、次のようにする代わりに：

```tsx bad filename=app/routes/some-route.tsx lines=[3-6]
import { unstable_createFileUploadHandler } from "@remix-run/node"; // or cloudflare/deno

const uploadHandler = unstable_createFileUploadHandler({
  maxPartSize: 5_000_000,
  file: ({ filename }) => filename,
});

export async function action() {
  // use `uploadHandler` here ...
}
```

次のようにする必要があります。

```tsx filename=app/routes/some-route.tsx good lines=[4-7]
import { unstable_createFileUploadHandler } from "@remix-run/node"; // or cloudflare/deno

export async function action() {
  const uploadHandler = unstable_createFileUploadHandler({
    maxPartSize: 5_000_000,
    file: ({ filename }) => filename,
  });

  // use `uploadHandler` here ...
}
```

> なぜこれが起こるのですか？

Remix は「ツリーシェイキング」を使用して、ブラウザバンドルからサーバーコードを削除します。ルートモジュールの `action`、`headers`、および `loader` エクスポート内のものはすべて削除されます。これは優れたアプローチですが、エコシステムの互換性に問題があります。

サードパーティモジュールをインポートすると、Remix はそのパッケージの `package.json` で `"sideEffects": false` を確認します。これが構成されている場合、Remix はクライアントバンドルからコードを安全に削除できることを認識します。そうでない場合、コードはモジュールの副作用（グローバルポリフィルの設定など）に依存する可能性があるため、インポートは残ります。

## ESMパッケージのインポート

<docs-warning>このセクションは、[クラシックRemixコンパイラ][classic-remix-compiler]を使用している場合にのみ関連します。</docs-warning>

アプリにESM専用のパッケージをインポートしようとすると、サーバーレンダリング時に次のようなエラーが表示されることがあります。

```
Error [ERR_REQUIRE_ESM]: require() of ES Module /app/node_modules/dot-prop/index.js from /app/project/build/index.js not supported.
Instead change the require of /app/project/node_modules/dot-prop/index.js in /app/project/build/index.js to a dynamic import() which is available in all CommonJS modules.
```

これを修正するには、[`remix.config.js`][remix_config]ファイルの[`serverDependenciesToBundle`][server_dependencies_to_bundle]オプションにESMパッケージを追加します。

ここでは、`dot-prop`パッケージを使用しているので、次のようにします。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverDependenciesToBundle: ["dot-prop"],
  // ...
};
```

> なぜこうなるのですか？

RemixはサーバービルドをCJSにコンパイルし、nodeモジュールをバンドルしません。CJSモジュールはESMモジュールをインポートできません。

`serverDependenciesToBundle`にパッケージを追加すると、RemixはESMモジュールをランタイムでrequireするのではなく、サーバービルドに直接バンドルするように指示します。

> ESMは未来ではないのですか？

はい！私たちの計画は、サーバー上でアプリをESMにコンパイルできるようにすることです。ただし、それは、ESMからのインポートと互換性のない一部のCommonJSモジュールをインポートできないという逆の問題を伴います！したがって、そこに到達しても、この構成が必要になる可能性があります。

サーバーですべてをバンドルしないのはなぜかと疑問に思うかもしれません。そうすることもできますが、ビルドが遅くなり、本番環境のスタックトレースがアプリ全体で単一のファイルを指すようになります。私たちはそれをしたくありません。そのトレードオフをせずに、最終的にはこれをスムーズにできると確信しています。

主要なデプロイプラットフォームがESMサーバー側をサポートするようになったことで、未来は過去よりも明るいと確信しています。ESMサーバービルドの堅牢な開発エクスペリエンスについてはまだ取り組んでおり、現在のアプローチはESMでは実行できないいくつかのことに依存しています。私たちはそこに到達します。

## CSSバンドルが誤ってツリーシェイキングされる

<docs-warning>このセクションは、[Classic Remix Compiler][classic-remix-compiler]を使用している場合にのみ関連します。</docs-warning>

[CSSバンドル機能][css_bundling]を`export *`と組み合わせて使用する場合（例えば、`components/index.ts`のようなインデックスファイルを使用して、すべてのサブディレクトリから再エクスポートする場合）、再エクスポートされたモジュールのスタイルがビルド出力から欠落していることに気づくかもしれません。

これは、[`esbuild`のCSSツリーシェイキングに関する問題][esbuild_css_tree_shaking_issue]が原因です。回避策として、名前付き再エクスポートを使用する必要があります。

```diff
- export * from "./Button";
+ export { Button } from "./Button";
```

この問題が存在しなかったとしても、名前付き再エクスポートを使用することをお勧めします。少しボイラープレートが増えるかもしれませんが、すべてを不用意に公開するのではなく、モジュールのパブリックインターフェースを明示的に制御できます。

[esbuild]: https://esbuild.github.io

[parse_multipart_form_data_upload_handler]: ../utils/parse-multipart-form-data#uploadhandler

[server_dependencies_to_bundle]: ../file-conventions/remix-config#serverdependenciestobundle

[remix_config]: ../file-conventions/remix-config

[css_bundling]: ../styling/bundling

[esbuild_css_tree_shaking_issue]: https://github.com/evanw/esbuild/issues/1370

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/fetch

[set_cookie_header]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie

[cookie_header]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie

[classic-remix-compiler]: ./vite#classic-remix-compiler-vs-remix-vite
