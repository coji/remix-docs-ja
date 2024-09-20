---
title: "ローカル TLS"
---

# ローカル TLS

<docs-warning>このガイドは、現在、[従来の Remix コンパイラ][classic-remix-compiler] を使用する場合にのみ関連します。</docs-warning>

ローカルで HTTP を使用するのは簡単ですが、ローカルで HTTPS を使用しなければならない場合は、以下のようにします。

<docs-warning>

`remix-serve` は、最小限のサーバーであり、すぐに使用できるようにすることを目的としているため、ローカルの HTTPS をサポートしていません。
`remix-serve` は Express のシンプルなラッパーなので、ローカルで HTTPS を使用したい場合は、直接 Express を使用できます。

`-c` フラグなしで `remix dev` を実行している場合、暗黙的に `remix-serve` がアプリサーバーとして使用されています。

</docs-warning>

## ローカル TLS でアプリサーバーを実行する

最初のステップは、次のセクションでローカル TLS で `remix dev` を設定する際に成功できるように、ローカル TLS でアプリサーバーを実行することです。

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

カスタムホスト名を使用している場合、TLS キーと証明書を生成する際に `localhost` を別のものに変更できます。

</docs-info>

👉 `key.pem` と `cert.pem` を使用して、アプリサーバーでローカルに HTTPS を動作させます。

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

// ... Express アプリの設定コードはここに ...

const server = https.createServer(
  {
    key: fs.readFileSync("path/to/key.pem"),
    cert: fs.readFileSync("path/to/cert.pem"),
  },
  app
);

const port = 3000;
server.listen(port, () => {
  // ... サーバーが起動した後実行するコードはここに ...
});
```

👉 ローカル TLS でアプリサーバーを実行します。

たとえば、上記の Express サーバーは、次のように実行します。

```shellscript nonumber
remix build
node ./server.js
```

## ローカル TLS で `remix dev` を実行する

最初に、`remix dev` なしでローカル TLS でアプリを実行できることを確認してください！
まだ行っていない場合は、前のセクションを確認してください。

👉 `remix dev` で TLS を有効にします。

構成を使用します。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  dev: {
    tlsKey: "key.pem", // cwd に対する相対パス
    tlsCert: "cert.pem", // cwd に対する相対パス
  },
};
```

またはフラグを使用します。

```shellscript nonumber
remix dev --tls-key=key.pem --tls-cert=cert.pem -c "node ./server.js"
```

これで、アプリはローカル TLS で実行されるはずです！

[mkcert]: https://github.com/FiloSottile/mkcert#installation
[classic-remix-compiler]: ./vite#classic-remix-compiler-vs-remix-vite
