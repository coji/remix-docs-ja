---
title: インストゥルメンテーション
unstable: true
---

# インストゥルメンテーション

[MODES: framework, data]

<br/>
<br/>

<docs-warning>インストゥルメンテーション API は実験的であり、マイナー/パッチリリースで破壊的な変更が加えられる可能性があります。注意してご使用いただき、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

インストゥルメンテーションを使用すると、実際のルートハンドラを変更することなく、ロギング、エラーレポート、パフォーマンス追跡を React Router アプリケーションに追加できます。これにより、サーバーとクライアントの両方で、プロダクションアプリケーション向けの包括的な可観測性ソリューションが可能になります。

## 概要

React Router のインストゥルメンテーション API を使用すると、リクエストハンドラ、ルーター操作、ルートミドルウェア、ルートハンドラの周りで実行される「wrapper」関数を提供します。これにより、以下のことが可能になります。

- アプリケーションのパフォーマンスを監視する
- ロギングを追加する
- 可観測性プラットフォーム (Sentry、DataDog、New Relic など) と統合する
- OpenTelemetry 追跡を実装する
- ユーザーの行動とナビゲーションパターンを追跡する

重要な設計原則は、インストゥルメンテーションが**読み取り専用**であることです。何が起こっているかを監視できますが、ルートハンドラに渡される引数や、ルートハンドラから返されるデータを変更して、ランタイムのアプリケーション動作を変更することはできません。

<docs-info>
他のインストゥルメンテーションアプローチと同様に、ランタイムで追加のコード実行を追加すると、インストゥルメンテーションされていないアプリケーションと比較してパフォーマンス特性が変わる可能性があります。この点を考慮し、適切なテストを実行するか、条件付きインストゥルメンテーションを利用して、プロダクションでのユーザーエクスペリエンスへの悪影響を避けるようにしてください。
</docs-info>

## クイックスタート (Framework Mode)

[modes: framework]

### 1. サーバーサイドインストゥルメンテーション

`entry.server.tsx` にインストゥルメンテーションを追加します。

```tsx filename=app/entry.server.tsx
export const unstable_instrumentations = [
  {
    // サーバーハンドラをインストゥルメントする
    handler(handler) {
      handler.instrument({
        async request(handleRequest, { request }) {
          let url = `${request.method} ${request.url}`;
          console.log(`Request start: ${url}`);
          await handleRequest();
          console.log(`Request end: ${url}`);
        },
      });
    },

    // 個々のルートをインストゥルメントする
    route(route) {
      // 必要に応じて、特定のルートのインストゥルメンテーションをスキップする
      if (route.id === "root") return;

      route.instrument({
        async loader(callLoader, { request }) {
          let url = `${request.method} ${request.url}`;
          console.log(`Loader start: ${url} - ${route.id}`);
          await callLoader();
          console.log(`Loader end: ${url} - ${route.id}`);
        },
        // その他の利用可能なインストゥルメンテーション:
        // async action() { /* ... */ },
        // async middleware() { /* ... */ },
        // async lazy() { /* ... */ },
      });
    },
  },
];

export default function handleRequest(/* ... */) {
  // 既存の handleRequest 実装
}
```

### 2. クライアントサイドインストゥルメンテーション

`entry.client.tsx` にインストゥルメンテーションを追加します。

```tsx filename=app/entry.client.tsx
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

const unstable_instrumentations = [
  {
    // ルーター操作をインストゥルメントする
    router(router) {
      router.instrument({
        // ナビゲーションをインストゥルメントする
        async navigate(callNavigate, { currentUrl, to }) {
          let nav = `${currentUrl} → ${to}`;
          console.log(`Navigation start: ${nav}`);
          await callNavigate();
          console.log(`Navigation end: ${nav}`);
        },
        // fetcher の呼び出しをインストゥルメントする
        async fetch(
          callFetch,
          { href, currentUrl, fetcherKey },
        ) {
          let fetch = `${fetcherKey} → ${href}`;
          console.log(`Fetcher start: ${fetch}`);
          await callFetch();
          console.log(`Fetcher end: ${fetch}`);
        },
      });
    },

    // 個々のルートをインストゥルメントする (サーバーサイドと同じ)
    route(route) {
      // 必要に応じて、特定のルートのインストゥルメンテーションをスキップする
      if (route.id === "root") return;

      route.instrument({
        async loader(callLoader, { request }) {
          let url = `${request.method} ${request.url}`;
          console.log(`Loader start: ${url} - ${route.id}`);
          await callLoader();
          console.log(`Loader end: ${url} - ${route.id}`);
        },
        // その他の利用可能なインストゥルメンテーション:
        // async action() { /* ... */ },
        // async middleware() { /* ... */ },
        // async lazy() { /* ... */ },
      });
    },
  },
];

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter
        unstable_instrumentations={
          unstable_instrumentations
        }
      />
    </StrictMode>,
  );
});
```

## クイックスタート (Data Mode)

[modes: data]

Data Mode では、ルーターを作成する際にインストゥルメンテーションを追加します。

```tsx
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";

const unstable_instrumentations = [
  {
    // ルーター操作をインストゥルメントする
    router(router) {
      router.instrument({
        // ナビゲーションをインストゥルメントする
        async navigate(callNavigate, { currentUrl, to }) {
          let nav = `${currentUrl} → ${to}`;
          console.log(`Navigation start: ${nav}`);
          await callNavigate();
          console.log(`Navigation end: ${nav}`);
        },
        // fetcher の呼び出しをインストゥルメントする
        async fetch(
          callFetch,
          { href, currentUrl, fetcherKey },
        ) {
          let fetch = `${fetcherKey} → ${href}`;
          console.log(`Fetcher start: ${fetch}`);
          await callFetch();
          console.log(`Fetcher end: ${fetch}`);
        },
      });
    },

    // 個々のルートをインストゥルメントする (サーバーサイドと同じ)
    route(route) {
      // 必要に応じて、特定のルートのインストゥルメンテーションをスキップする
      if (route.id === "root") return;

      route.instrument({
        async loader(callLoader, { request }) {
          let url = `${request.method} ${request.url}`;
          console.log(`Loader start: ${url} - ${route.id}`);
          await callLoader();
          console.log(`Loader end: ${url} - ${route.id}`);
        },
        // その他の利用可能なインストゥルメンテーション:
        // async action() { /* ... */ },
        // async middleware() { /* ... */ },
        // async lazy() { /* ... */ },
      });
    },
  },
];

const router = createBrowserRouter(routes, {
  unstable_instrumentations,
});

function App() {
  return <RouterProvider router={router} />;
}
```

## コアコンセプト

### インストゥルメンテーションレベル

アプリケーションをインストゥルメントできるレベルは複数あります。各インストゥルメンテーション関数は、インストゥルメントされている特定の側面に関連するコンテキスト情報を含む2番目の "info" パラメータを受け取ります。

#### 1. ハンドラレベル (サーバー)

[modes: framework]

サーバーへのすべてのリクエストを処理するトップレベルのリクエストハンドラをインストゥルメントします。

```tsx filename=entry.server.tsx
export const unstable_instrumentations = [
  {
    handler(handler) {
      handler.instrument({
        async request(handleRequest, { request, context }) {
          // アプリへのすべてのリクエストをラップして実行されます
          await handleRequest();
        },
      });
    },
  },
];
```

#### 2. ルーターレベル (クライアント)

[modes: framework,data]

ナビゲーションや fetcher の呼び出しなど、クライアントサイドのルーター操作をインストゥルメントします。

```tsx
export const unstable_instrumentations = [
  {
    router(router) {
      router.instrument({
        async navigate(callNavigate, { to, currentUrl }) {
          // ナビゲーション操作をラップして実行されます
          await callNavigate();
        },
        async fetch(
          callFetch,
          { href, currentUrl, fetcherKey },
        ) {
          // fetcher 操作をラップして実行されます
          await callFetch();
        },
      });
    },
  },
];

// Framework Mode (entry.client.tsx)
<HydratedRouter
  unstable_instrumentations={unstable_instrumentations}
/>;

// Data Mode
const router = createBrowserRouter(routes, {
  unstable_instrumentations,
});
```

#### 3. ルートレベル (サーバー + クライアント)

[modes: framework,data]

個々のルートハンドラをインストゥルメントします。

```tsx
const unstable_instrumentations = [
  {
    route(route) {
      route.instrument({
        async loader(
          callLoader,
          { params, request, context, unstable_pattern },
        ) {
          // loader の実行をラップして実行されます
          await callLoader();
        },
        async action(
          callAction,
          { params, request, context, unstable_pattern },
        ) {
          // action の実行をラップして実行されます
          await callAction();
        },
        async middleware(
          callMiddleware,
          { params, request, context, unstable_pattern },
        ) {
          // middleware の実行をラップして実行されます
          await callMiddleware();
        },
        async lazy(callLazy) {
          // lazy route のロードをラップして実行されます
          await callLazy();
        },
      });
    },
  },
];
```

### 読み取り専用の設計

インストゥルメンテーションは**監視のみ**を目的として設計されています。以下のことはできません。

- ハンドラに渡される引数を変更する
- ハンドラからの戻り値を変更する
- アプリケーションの動作を変更する

これにより、インストゥルメンテーションはプロダクションアプリケーションに追加しても安全であり、ルートロジックにバグを導入することはありません。

### エラーハンドリング

インストゥルメンテーションコードがランタイムアプリケーションに影響を与えないように、エラーは内部で捕捉され、外部への伝播が防止されます。この設計上の選択は、2つの側面で現れます。

まず、「ハンドラ」関数 (loader、action、リクエストハンドラ、ナビゲーションなど) がエラーをスローした場合、そのエラーはインストゥルメンテーションから呼び出された `callHandler` 関数からバブルアップしません。代わりに、`callHandler` 関数は `{ type: "success", error: undefined } | { type: "error", error: unknown }` 型の判別共用体 (discriminated union) の結果を返します。これにより、アプリケーションのエラーを処理するために try/catch/finally ロジックを必要とせずに、インストゥルメンテーション関数全体が実行されます。

```tsx
export const unstable_instrumentations = [
  {
    route(route) {
      route.instrument({
        async loader(callLoader) {
          let { status, error } = await callLoader();

          if (status === "error") {
            // エラーケース - `error` が定義されています
          } else {
            // 成功ケース - `error` は undefined です
          }
        },
      });
    },
  },
];
```

次に、インストゥルメンテーション関数がエラーをスローした場合、React Router はそのエラーを適切に無視するため、外部にバブルアップして他のインストゥルメンテーションやアプリケーションの動作に影響を与えることはありません。これらの両方の例で、ハンドラと他のすべてのインストゥルメンテーション関数は引き続き実行されます。

```tsx
export const unstable_instrumentations = [
  {
    route(route) {
      route.instrument({
        // ハンドラを呼び出す前にスローする - RR はエラーを
        // 捕捉し、引き続き loader を呼び出します
        async loader(callLoader) {
          somethingThatThrows();
          await callLoader();
        },
        // ハンドラを呼び出した後にスローする - RR は
        // 内部でエラーを捕捉します
        async action(callAction) {
          await callAction();
          somethingThatThrows();
        },
      });
    },
  },
];
```

### コンポジション

配列を提供することで、複数のインストゥルメンテーションを構成できます。

```tsx
export const unstable_instrumentations = [
  loggingInstrumentation,
  performanceInstrumentation,
  errorReportingInstrumentation,
];
```

各インストゥルメンテーションは前のものをラップし、ネストされた実行チェーンを作成します。

### 条件付きインストゥルメンテーション

環境やその他の要因に基づいて、条件付きでインストゥルメンテーションを有効にできます。

```tsx
export const unstable_instrumentations =
  process.env.NODE_ENV === "production"
    ? [productionInstrumentation]
    : [developmentInstrumentation];
```

```tsx
// あるいは、インストゥルメンテーション内で条件を付けることもできます
export const unstable_instrumentations = [
  {
    route(route) {
      // 特定のルートのみをインストゥルメントする
      if (!route.id?.startsWith("routes/admin")) return;

      // あるいは、クエリパラメータが存在する場合にのみインストゥルメントする
      let sp = new URL(request.url).searchParams;
      if (!sp.has("DEBUG")) return;

      route.instrument({
        async loader() {
          /* ... */
        },
      });
    },
  },
];
```

## 一般的なパターン

### リクエストロギング (サーバー)

```tsx
const logging: unstable_ServerInstrumentation = {
  handler({ instrument }) {
    instrument({
      request: (fn, { request }) =>
        log(`request ${request.url}`, fn),
    });
  },
  route({ instrument, id }) {
    instrument({
      middleware: (fn) => log(` middleware (${id})`, fn),
      loader: (fn) => log(`  loader (${id})`, fn),
      action: (fn) => log(`  action (${id})`, fn),
    });
  },
};

async function log(
  label: string,
  cb: () => Promise<unstable_InstrumentationHandlerResult>,
) {
  let start = Date.now();
  console.log(`➡️ ${label}`);
  await cb();
  console.log(`⬅️ ${label} (${Date.now() - start}ms)`);
}

export const unstable_instrumentations = [logging];
```

### OpenTelemetry 統合

```tsx
import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("my-app");

const otel: unstable_ServerInstrumentation = {
  handler({ instrument }) {
    instrument({
      request: (fn, { request }) =>
        otelSpan(`request`, { url: request.url }, fn),
    });
  },
  route({ instrument, id }) {
    instrument({
      middleware: (fn, { unstable_pattern }) =>
        otelSpan(
          "middleware",
          { routeId: id, pattern: unstable_pattern },
          fn,
        ),
      loader: (fn, { unstable_pattern }) =>
        otelSpan(
          "loader",
          { routeId: id, pattern: unstable_pattern },
          fn,
        ),
      action: (fn, { unstable_pattern }) =>
        otelSpan(
          "action",
          { routeId: id, pattern: unstable_pattern },
          fn,
        ),
    });
  },
};

async function otelSpan(
  label: string,
  attributes: Record<string, string>,
  cb: () => Promise<unstable_InstrumentationHandlerResult>,
) {
  return tracer.startActiveSpan(
    label,
    { attributes },
    async (span) => {
      let { error } = await cb();
      if (error) {
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
        });
      }
      span.end();
    },
  );
}

export const unstable_instrumentations = [otel];
```

### クライアントサイドのパフォーマンス追跡

```tsx
const windowPerf: unstable_ClientInstrumentation = {
  router({ instrument }) {
    instrument({
      navigate: (fn, { to, currentUrl }) =>
        measure(`navigation:${currentUrl}->${to}`, fn),
      fetch: (fn, { href }) =>
        measure(`fetcher:${href}`, fn),
    });
  },
  route({ instrument, id }) {
    instrument({
      middleware: (fn) => measure(`middleware:${id}`, fn),
      loader: (fn) => measure(`loader:${id}`, fn),
      action: (fn) => measure(`action:${id}`, fn),
    });
  },
};

async function measure(
  label: string,
  cb: () => Promise<unstable_InstrumentationHandlerResult>,
) {
  performance.mark(`start:${label}`);
  await cb();
  performance.mark(`end:${label}`);
  performance.measure(
    label,
    `start:${label}`,
    `end:${label}`,
  );
}

<HydratedRouter unstable_instrumentations={[windowPerf]} />;
```