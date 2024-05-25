---
title: ".server モジュール"
toc: false
---

# `.server` モジュール

厳密には必須ではありませんが、`.server` モジュールは、モジュール全体をサーバー専用として明示的にマークする良い方法です。
`.server` ファイルまたは `.server` ディレクトリ内のコードが誤ってクライアントモジュールグラフに含まれると、ビルドは失敗します。

```txt
app
├── .server 👈 このディレクトリ内のすべてのファイルをサーバー専用としてマーク
│   ├── auth.ts
│   └── db.ts
├── cms.server.ts 👈 このファイルをサーバー専用としてマーク
├── root.tsx
└── routes
    └── _index.tsx
```

`.server` モジュールは、Remix アプリのディレクトリ内にある必要があります。

詳細については、サイドバーの「ルートモジュール」セクションを参照してください。

<docs-warning>`.server` ディレクトリは、[Remix Vite][remix-vite] を使用している場合にのみサポートされています。[Classic Remix Compiler][classic-remix-compiler] は、`.server` ファイルのみサポートしています。</docs-warning>

<docs-warning>[Classic Remix Compiler][classic-remix-compiler] を使用する場合、`.server` モジュールは空のモジュールに置き換えられ、コンパイルエラーは発生しません。ただし、これによりランタイムエラーが発生する可能性があることに注意してください。</docs-warning>

[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite 
