---
title: カスタム Node.js
---

# カスタム Node.js ランタイムへのデプロイ

<docs-warning>
  このドキュメントは作成中です。まだ見るべきものはありません。
</docs-warning>

## バージョンサポート

React Router は、常にアクティブおよびメンテナンス中の Node LTS リリース[Node LTS リリース][node-releases]（[^1]）を正式にサポートしています。EOL（寿命終了）の Node バージョンに対するサポートの削除は、React Router のマイナーリリースで行われる場合があります。

[^1]: タイミングに基づいて、React Router は、React Router のメジャー SemVer リリースとよりよく一致する場合、Node メンテナンス LTS バージョンが EOL になる直前に、そのバージョンのサポートを削除することがあります。

## `fetch` のポリフィル

React Router v7 がリリースされた時点で、すべてのバージョンで `fetch` 実装が使用可能であったため、Node 22 以降の Node 20 リリースを使用している限り、通常は `fetch` API をポリフィルする必要はありません。

- Node 22（アクティブ LTS）には、安定した [`fetch`][node-22-fetch] 実装があります
- Node 20（メンテナンス LTS）には、実験的な（しかし私たちのテストでは適している）[`fetch`][node-20-fetch] 実装があります

何かをポリフィルする必要があることが判明した場合、node が内部的に使用する [undici] パッケージから直接行うことができます。

```ts
import {
  fetch as nodeFetch,
  File as NodeFile,
  FormData as NodeFormData,
  Headers as NodeHeaders,
  Request as NodeRequest,
  Response as NodeResponse,
} from "undici";

export function polyfillFetch() {
  global.File = NodeFile;
  global.Headers = NodeHeaders;
  global.Request = NodeRequest;
  global.Response = NodeResponse;
  global.fetch = nodeFetch;
  global.FormData = NodeFormData;
}
```

[node-releases]: https://nodejs.org/en/about/previous-releases
[node-20-fetch]: https://nodejs.org/docs/latest-v20.x/api/globals.html#fetch
[node-22-fetch]: https://nodejs.org/docs/latest-v22.x/api/globals.html#fetch
[undici]: https://github.com/nodejs/undici



