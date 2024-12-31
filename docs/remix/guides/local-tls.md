---
title: "ローカル TLS"
---

# ローカル TLS

<docs-warning>このガイドは現在、[クラシック Remix コンパイラ][classic-remix-compiler]を使用している場合にのみ関連します。</docs-warning>

ローカルでは HTTP を使用する方が簡単ですが、どうしてもローカルで HTTPS を使用する必要がある場合は、次の手順に従ってください。

<docs-warning>

`remix-serve` は、起動を容易にするための最小限のサーバーであるため、ローカル HTTPS をサポートしていません。
`remix-serve` は Express のシンプルなラッパーであるため、ローカルで HTTPS を使用したい場合は、Express を直接使用できます。

`-c` フラグなしで `remix dev` を実行している場合は、暗黙的に `remix-serve` をアプリサーバーとして使用しています。

</docs-warning>

## ローカル TLS でアプリサーバーを実行する

最初のステップは、`remix dev` を実行せずに、ローカル TLS でアプリサーバーを実行することです。
これにより、次のセクションでローカル TLS を使用して `remix dev` をセットアップする際に成功する準備が整います。

👉 [`mkcert`][mkcert] をインストールします。

👉 ローカル認証局を作成します。

```shellscript nonumber
mkcert -install
```

👉 Node にローカル CA を使用するように指示します。

```shellscript nonumber
export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"
```

👉 TLS キーと証明書を作成します。

```shellscript nonumber
mkcert -key-file key.pem -cert-file cert.pem localhost
```

<docs-info>

カスタムホスト名を使用している場合は、TLS キーと証明書を生成する際に `localhost` を別のものに変更できます。

</docs-info>

👉 `key.pem` と `cert.pem` を使用して、アプリサーバーでローカルに HTTPS が動作するようにします。

この方法は、使用しているアプリサーバーによって異なります。
たとえば、Express サーバーで HTTPS を使用する方法は次のとおりです。

```ts filename=server.ts
import fs from "node:fs";
import https from "node:https";
import path from "node:path";

import express from "express";

const BUILD_DIR = path.resolve(__dirname, "build");
const build = require(BUILD_DIR);

const app = express();

// ... express アプリをセットアップするコードはここに記述します ...

const server = https.createServer(
  {
    key: fs.readFileSync("path/to/key.pem"),
    cert: fs.readFileSync("path/to/cert.pem"),
  },
  app
);

const port = 3000;
server.listen(port, () => {
  // ... サーバーの実行後に実行するコードはここに記述します ...
});
```

👉 ローカル TLS でアプリサーバーを実行します。

たとえば、上記の Express サーバーでは、次のように実行します。

```shellscript nonumber
remix build
node ./server.js
```

## ローカル TLS で `remix dev` を実行する

最初に `remix dev` なしでローカル TLS でアプリを実行できることを確認してください。
まだ実行していない場合は、前のセクションを確認してください。

👉 `remix dev` の TLS を有効にします。

設定による場合:

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  dev: {
    tlsKey: "key.pem", // cwd からの相対パス
    tlsCert: "cert.pem", // cwd からの相対パス
  },
};
```

またはフラグによる場合:

```shellscript nonumber
remix dev --tls-key=key.pem --tls-cert=cert.pem -c "node ./server.js"
```

これで、アプリがローカル TLS で実行されるはずです。

[mkcert]: https://github.com/FiloSottile/mkcert#installation
[classic-remix-compiler]: ./vite#classic-remix-compiler-vs-remix-vite

