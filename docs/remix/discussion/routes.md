---
title: ルート設定
order: 3
---

# ルート設定

Remix のルーティングシステムの基本的な概念の1つは、Ember.js にルーツを持つネストされたルートの使用です。ネストされたルートでは、URL のセグメントがデータ依存関係と UI のコンポーネント階層の両方に結び付けられます。`/sales/invoices/102000` のような URL は、アプリケーション内の明確なパスを示すだけでなく、異なるコンポーネントの関係と依存関係を区別します。

## モジュール設計

ネストされたルートは、URL を複数の部分に分割することで明確さを提供します。各セグメントは、特定のデータ要件とコンポーネントに直接関連付けられます。たとえば、URL `/sales/invoices/102000` では、各セグメント (`sales`、`invoices`、`102000`) を特定のデータポイントと UI セクションに関連付けることができ、コードベースでの管理が直感的になります。

ネストされたルーティングの特徴は、ネストされたルートツリー内の複数のルートが単一の URL に一致できることです。この粒度により、各ルートが特定の URL セグメントと関連する UI のスライスに主に焦点を当てることが保証されます。このアプローチは、モジュール性と関心の分離の原則を支持し、各ルートがそのコアな責任に焦点を当て続けることを保証します。

<iframe src="/_docs/routing" class="w-full aspect-[1/1] rounded-lg overflow-hidden pb-4"></iframe>

## 並列ロード

一部の Web アプリケーションでは、データとアセットのシーケンシャルなロードが、ユーザーエクスペリエンスを人為的に遅くする可能性があります。データ依存関係が相互に依存していない場合でも、レンダリング階層に結び付けられているため、シーケンシャルにロードされる可能性があり、望ましくないリクエストの連鎖が発生します。

Remix は、ネストされたルーティングシステムを活用してロード時間を最適化します。URL が複数のルートに一致する場合、Remix は一致するすべてのルートに必要なデータとアセットを並行してロードします。これにより、Remix は従来の連鎖リクエストシーケンスの落とし穴を効果的に回避します。

この戦略は、複数の同時リクエストを効率的に処理する最新のブラウザの機能と組み合わさって、Remix を応答性が高く高速な Web アプリケーションを提供する最前線に位置づけています。これは、データフェッチを高速化するだけでなく、エンドユーザーに可能な限り最高のエクスペリエンスを提供するために、整理された方法でフェッチすることです。

## 従来のルート設定

Remix は、ルーティングプロセスを合理化するのに役立つ重要な規約である `app/routes` フォルダーを導入しています。開発者がこのフォルダー内にファイルを作成すると、Remix はそれをルートとして暗黙的に理解します。この規約により、ルートの定義、URL との関連付け、および関連するコンポーネントのレンダリングのプロセスが簡素化されます。

以下は、routes フォルダーの規約を使用するサンプルディレクトリです。

```text
app/
├── routes/
│   ├── _index.tsx
│   ├── about.tsx
│   ├── concerts._index.tsx
│   ├── concerts.$city.tsx
│   ├── concerts.trending.tsx
│   └── concerts.tsx
└── root.tsx
```

`app/routes/concerts.` で始まるすべてのルートは、`app/routes/concerts.tsx` の子ルートになります。

| URL                        | 一致するルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

## 従来のルートフォルダー

追加のモジュールやアセットを必要とするルートの場合、`app/routes` 内に `route.tsx` ファイルを含むフォルダーを使用できます。この方法は次のとおりです。

- **モジュールの共同配置**: 特定のルートに接続されたすべての要素を収集し、ロジック、スタイル、およびコンポーネントが密接に結び付けられるようにします。
- **インポートの簡素化**: 関連するモジュールを1か所にまとめることで、インポートの管理が簡単になり、コードの保守性が向上します。
- **自動コード編成の促進**: `route.tsx` の設定を使用すると、アプリケーションの規模が拡大するにつれて有益な、適切に編成されたコードベースが本質的に促進されます。

上記の同じルートは、代わりに次のように編成できます。

```text
app/
├── routes/
│   ├── _index/
│   │   ├── signup-form.tsx
│   │   └── route.tsx
│   ├── about/
│   │   ├── header.tsx
│   │   └── route.tsx
│   ├── concerts/
│   │   ├── favorites-cookie.ts
│   │   └── route.tsx
│   ├── concerts.$city/
│   │   └── route.tsx
│   ├── concerts._index/
│   │   ├── featured.tsx
│   │   └── route.tsx
│   └── concerts.trending/
│       ├── card.tsx
│       ├── route.tsx
│       └── sponsored.tsx
└── root.tsx
```

ファイル名とその他の機能の特定のパターンについては、[ルートファイル規約][route-file-conventions]の参照で詳しく読むことができます。

`app/routes` の直下にあるフォルダーのみがルートとして登録されます。深くネストされたフォルダーは無視されます。`app/routes/about/header/route.tsx` のファイルはルートを作成しません。

```text bad lines=[4]
app/
├── routes/
│   └── about/
│       ├── header/
│       │   └── route.tsx
│       └── route.tsx
└── root.tsx
```

## 手動ルート設定

`app/routes` フォルダーは開発者にとって便利な規約を提供しますが、Remix は [1つのサイズですべてに対応できるわけではない][routes-disclaimer]ことを認識しています。提供された規約が特定のプロジェクト要件や開発者の好みに合わない場合があります。このような場合、Remix では [`vite.config.ts`][vite-routes] を介して手動でルートを設定できます。この柔軟性により、開発者はプロジェクトにとって意味のある方法でアプリケーションを構造化できます。

<docs-warning>[Vite][remix-vite] にまだ移行しておらず、[従来の Remix コンパイラー][classic-remix-compiler] をまだ使用している場合は、[`remix.config.js`][remix-config] ファイルで手動でルートを設定できます。</docs-warning>

アプリを構造化する一般的な方法は、トップレベルの機能フォルダーを使用することです。コンサートのような特定のテーマに関連するルートは、いくつかのモジュールを共有する可能性が高いことを考慮してください。それらを単一のフォルダーに整理することは理にかなっています。

```text
app/
├── about/
│   └── route.tsx
├── concerts/
│   ├── card.tsx
│   ├── city.tsx
│   ├── favorites-cookie.ts
│   ├── home.tsx
│   ├── layout.tsx
│   ├── sponsored.tsx
│   └── trending.tsx
├── home/
│   ├── header.tsx
│   └── route.tsx
└── root.tsx
```

この構造を前の例と同じ URL に設定するには、`vite.config.ts` で `routes` 関数を使用できます。

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route("/", "home/route.tsx", { index: true });
          route("about", "about/route.tsx");
          route("concerts", "concerts/layout.tsx", () => {
            route("", "concerts/home.tsx", { index: true });
            route("trending", "concerts/trending.tsx");
            route(":city", "concerts/city.tsx");
          });
        });
      },
    }),
  ],
});
```

Remix のルート設定アプローチは、規約と柔軟性を兼ね備えています。`app/routes` フォルダーを使用して、ルートを簡単に整理して設定できます。より多くの制御が必要な場合、ファイル名が気に入らない場合、または独自のニーズがある場合は、`vite.config.ts` があります。多くのアプリが `vite.config.ts` を優先して routes フォルダーの規約を放棄することが予想されます。

[route-file-conventions]: ../file-conventions/routes
[remix-config]: ../file-conventions/remix-config
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite
[vite-routes]: ../file-conventions/vite-config#routes
[routes-disclaimer]: ../file-conventions/routes#disclaimer
