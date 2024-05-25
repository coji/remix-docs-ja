---
title: 注意事項
---

# 注意事項

React でアプリをサーバーとブラウザでレンダリングすると、いくつかの固有の落とし穴が発生します。さらに、Remix を構築するにつれて、運用結果とスケーラビリティに重点を置いてきました。開発者エクスペリエンスとエコシステムの互換性の問題がいくつか存在し、まだ解決していません。

このドキュメントは、これらの問題を克服するのに役立ちます。

## `typeof window` チェック

同じ JavaScript コードはブラウザとサーバーの両方で実行できるため、コードの一部を特定のコンテキストでのみ実行する必要がある場合があります。

```ts bad
if (typeof window === "undefined") {
  // サーバー環境で実行中
} else {
  // ブラウザ環境で実行中
}
```

これは Node.js 環境では正常に動作しますが、Deno は実際には `window` をサポートしています！そのため、ブラウザで実行しているかどうかを本当に確認する必要がある場合は、代わりに `document` を確認する方が良いでしょう。

```ts good
if (typeof document === "undefined") {
  // サーバー環境で実行中
} else {
  // ブラウザ環境で実行中
}
```

これは、すべての JS 環境（Node.js、Deno、Workers など）で機能します。

## ブラウザ拡張機能によるコードの挿入

ブラウザで次の警告が表示される場合があります。

```
Warning: Did not expect server HTML to contain a <script> in <html>.
```

これは React の水和警告で、ブラウザ拡張機能のいずれかがサーバーでレンダリングされた HTML にスクリプトを挿入して、結果の HTML との違いを生み出している可能性が最も高いです。

シークレットモードでページを確認してください。警告は消えるはずです。

## `loader` でセッションへの書き込み

通常、セッションへの書き込みはアクションでのみ行う必要がありますが、ローダーで意味をなす場合もあります（匿名ユーザー、ナビゲーションの追跡など）。

複数のローダーが同じセッションから _読み取り_ できる一方、ローダーでセッションに _書き込む_ と、問題が発生する可能性があります。

Remix ローダーは並行して実行され、場合によっては別々のリクエストで実行されます（クライアントの遷移は各ローダーの [`fetch`][fetch] を呼び出します）。ローダーの 1 つがセッションに書き込もうとしている間に、別のローダーがセッションから読み込もうとしていると、バグや非決定論的な動作が発生します。

さらに、セッションは、ブラウザのリクエストからのクッキーに基づいて構築されます。セッションをコミットすると、[`Set-Cookie`][set_cookie_header] ヘッダーでブラウザに送信され、次に次のリクエストの [`Cookie`][cookie_header] ヘッダーでサーバーに送信されます。並行ローダーに関係なく、`Set-Cookie` でクッキーに書き込み、元の要求 `Cookie` から更新された値を読み込もうとしても、期待した値は取得できません。ブラウザに往復する必要があり、次のリクエストからの値である必要があります。

ローダーでセッションに書き込む必要がある場合は、そのローダーが他のローダーとセッションを共有しないようにしてください。

## クライアントバンドル内のサーバーコード

<docs-warning>このセクションは、[クラシック Remix コンパイラ][classic-remix-compiler] を使用している場合にのみ関連します。</docs-warning>

ブラウザでこの奇妙なエラーが発生する可能性があります。これはほとんどの場合、サーバーコードがブラウザバンドルに含まれていることを意味します。

```
TypeError: Cannot read properties of undefined (reading 'root')
```

たとえば、`fs-extra` をルートモジュールに直接インポートすることはできません。

```tsx bad filename=app/routes/_index.tsx lines=[2] nocopy
import { json } from "@remix-run/node"; // または cloudflare/deno
import fs from "fs-extra";

export async function loader() {
  return json(await fs.pathExists("../some/path"));
}

export default function SomeRoute() {
  // ...
}
```

解決するには、インポートを `*.server.ts` または `*.server.js` という名前の別のモジュールに移動し、そこからインポートします。ここでは、`app/utils/fs-extra.server.ts` に新しいファイルを作成します。

```ts filename=app/utils/fs-extra.server.ts
export { default } from "fs-extra";
```

次に、ルートのインポートを新しい「ラッパー」モジュールに変更します。

```tsx filename=app/routes/_index.tsx lines=[3]
import { json } from "@remix-run/node"; // または cloudflare/deno

import fs from "~/utils/fs-extra.server";

export async function loader() {
  return json(await fs.pathExists("../some/path"));
}

export default function SomeRoute() {
  // ...
}
```

さらに良いことに、プロジェクトに PR を送信して `package.json` に `"sideEffects": false` を追加し、ツリーシェイクするバンドラーがブラウザバンドルからコードを安全に削除できることを通知します。

同様に、ルートモジュールのトップレベルスコープで、サーバー専用コードに依存する関数を呼び出すと、同じエラーが発生する可能性があります。

たとえば、[Remix アップロードハンドラー（`unstable_createFileUploadHandler` や `unstable_createMemoryUploadHandler` など）][parse_multipart_form_data_upload_handler] は、内部的に Node グローバルを使用するため、サーバーでのみ呼び出す必要があります。これらの関数は、`*.server.ts` または `*.server.js` ファイルで呼び出すか、ルートの `action` または `loader` 関数に移動することができます。

そのため、次のようにはしないでください。

```tsx bad filename=app/routes/some-route.tsx lines=[3-6]
import { unstable_createFileUploadHandler } from "@remix-run/node"; // または cloudflare/deno

const uploadHandler = unstable_createFileUploadHandler({
  maxPartSize: 5_000_000,
  file: ({ filename }) => filename,
});

export async function action() {
  // ここで `uploadHandler` を使用します...
}
```

代わりに、次のようにしてください。

```tsx filename=app/routes/some-route.tsx good lines=[4-7]
import { unstable_createFileUploadHandler } from "@remix-run/node"; // または cloudflare/deno

export async function action() {
  const uploadHandler = unstable_createFileUploadHandler({
    maxPartSize: 5_000_000,
    file: ({ filename }) => filename,
  });

  // ここで `uploadHandler` を使用します...
}
```

> なぜこれが起こるのでしょうか？

Remix は「ツリーシェイク」を使用して、ブラウザバンドルからサーバーコードを削除します。ルートモジュールの `action`、`headers`、`loader` エクスポート内のものはすべて削除されます。これは素晴らしいアプローチですが、エコシステムの互換性に問題があります。

サードパーティモジュールをインポートすると、Remix はそのパッケージの `package.json` を確認して `"sideEffects": false` が設定されているかどうかを確認します。これが設定されている場合、Remix はブラウザバンドルからコードを安全に削除できることを認識します。設定されていない場合、モジュールの副作用（グローバルポリフィルの設定など）にコードが依存している可能性があるため、インポートはそのまま残ります。

## ESM パッケージのインポート

<docs-warning>このセクションは、[クラシック Remix コンパイラ][classic-remix-compiler] を使用している場合にのみ関連します。</docs-warning>

ESM 専用のパッケージをアプリにインポートしようとすると、サーバーレンダリング時に次のエラーが表示される場合があります。

```
Error [ERR_REQUIRE_ESM]: require() of ES Module /app/node_modules/dot-prop/index.js from /app/project/build/index.js not supported.
Instead change the require of /app/project/node_modules/dot-prop/index.js in /app/project/build/index.js to a dynamic import() which is available in all CommonJS modules.
```

解決するには、`remix.config.js` ファイルの [`serverDependenciesToBundle`][server_dependencies_to_bundle] オプションに ESM パッケージを追加します。

ここでは `dot-prop` パッケージを使用しているため、次のように行います。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverDependenciesToBundle: ["dot-prop"],
  // ...
};
```

> なぜこれが起こるのでしょうか？

Remix はサーバービルドを CJS にコンパイルし、ノードモジュールをバンドルしません。CJS モジュールは ESM モジュールをインポートできません。

`serverDependenciesToBundle` にパッケージを追加すると、Remix は ESM モジュールをランタイムで要求するのではなく、サーバービルドに直接バンドルするように指示されます。

> ESM は将来のものですか？

はい！サーバーでアプリを ESM にコンパイルできるようにする計画です。ただし、その場合は、ESM からインポートできないため、互換性がない CommonJS モジュールの一部をインポートできなくなるという問題が発生します！そのため、その状態になっても、この設定が必要になる可能性があります。

なぜすべてをサーバー用にバンドルしないのかと疑問に思うかもしれません。それはできますが、ビルドが遅くなり、運用スタックトレースがすべてアプリ全体の単一ファイルに示されるようになります。それは避けたいです。この問題は、そのトレードオフなしで最終的に解決できると確信しています。

主要なデプロイメントプラットフォームがサーバー側の ESM をサポートするようになったため、未来は過去よりも明るいと確信しています。ESM サーバービルドのための堅牢な開発エクスペリエンスはまだ開発中ですが、現在のアプローチは、ESM では実行できないものを使用しています。実現します。

## CSS バンドルが誤ってツリーシェイクされる

<docs-warning>このセクションは、[クラシック Remix コンパイラ][classic-remix-compiler] を使用している場合にのみ関連します。</docs-warning>

[CSS バンドル機能][css_bundling] を `export *` と組み合わせて使用する場合（たとえば、`components/index.ts` のような、すべてのサブディレクトリから再エクスポートするインデックスファイルを使用する場合）、再エクスポートされたモジュールからのスタイルがビルド出力から不足している場合があります。

これは、[`esbuild` の CSS ツリーシェイクの [問題][esbuild_css_tree_shaking_issue] によるものです。回避策として、名前付きの再エクスポートを使用する必要があります。

```diff
- export * from "./Button";
+ export { Button } from "./Button";
```

この問題が存在しなくても、名前付きの再エクスポートを使用することをお勧めします！若干のボイラープレートが増える可能性はありますが、モジュールの公開インターフェースを明示的に制御できるようになり、意図せずすべてを公開することを回避できます。

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
