---
title: ルート設定
order: 3
---

# ルート設定

Remix のルーティングシステムにおける基本的な概念の 1 つに、ネストされたルートの使用があります。これは Ember.js にルーツを持つアプローチです。ネストされたルートでは、URL のセグメントがデータ依存関係と UI のコンポーネント階層の両方に結び付けられます。`/sales/invoices/102000` のような URL は、アプリケーション内の明確なパスを示すだけでなく、さまざまなコンポーネントの関係と依存関係も明確にします。

## モジュール設計

ネストされたルートは、URL を複数の部分に分割することで、明確性を提供します。各セグメントは、特定のデータ要件とコンポーネントに直接対応します。たとえば、`/sales/invoices/102000` という URL では、`sales`、`invoices`、`102000` の各セグメントは、特定のデータポイントと UI セクションに関連付けることができ、コードベースで管理しやすくなります。

ネストされたルーティングの機能の 1 つは、ネストされたルートツリー内の複数のルートが単一の URL に一致することができることです。この細分化により、各ルートは、その特定の URL セグメントと関連する UI の一部に重点を置くことができます。このアプローチは、モジュール性と懸念の分離の原則を支持し、各ルートがそのコア責任に集中できるようにします。

<iframe src="/_docs/routing" class="w-full aspect-[1/1] rounded-lg overflow-hidden pb-4"></iframe>

## 並列読み込み

一部の Web アプリケーションでは、データとアセットのシーケンシャルな読み込みが、ユーザーエクスペリエンスを人工的に遅くすることがあります。データ依存関係がお互いに依存していない場合でも、レンダリング階層に結合されているためにシーケンシャルに読み込まれることがあり、望ましくないリクエストの連鎖が発生します。

Remix は、ネストされたルーティングシステムを活用して、読み込み時間を最適化します。URL が複数のルートに一致する場合、Remix は、一致するすべてのルートに必要なデータとアセットを並列に読み込みます。これにより、Remix は、従来の連鎖されたリクエストシーケンスの欠陥を効果的に回避します。

この戦略は、最新のブラウザの複数の同時リクエストを効率的に処理する機能と組み合わされることで、Remix を非常に応答性の高い迅速な Web アプリケーションを提供する先駆者として位置付けています。重要なのは、データの取得を高速化することではなく、最良のユーザーエクスペリエンスを提供するために、体系的な方法でデータを取得することです。

## 従来のルート設定

Remix は、ルーティングプロセスを合理化するための重要な規則を導入しています。それは、`app/routes` フォルダです。開発者がこのフォルダ内にファイルを追加すると、Remix はそれをルートとして認識します。この規則により、ルートの定義、URL との関連付け、関連するコンポーネントのレンダリングが簡素化されます。

以下は、routes フォルダの規則を使用したサンプルディレクトリです。

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

## 従来のルートフォルダ

追加のモジュールやアセットを必要とするルートの場合、`app/routes` 内に `route.tsx` ファイルを含むフォルダを使用できます。この方法では、

- **モジュールの共存**: 特定のルートに関連するすべての要素を収集し、ロジック、スタイル、コンポーネントを密接に結びつけます。
- **インポートの簡素化**: 関連するモジュールが 1 か所にまとめられるため、インポートの管理が簡単になり、コードの保守性が向上します。
- **自動コード整理の促進**: `route.tsx` セットアップを使用すると、アプリケーションの規模が大きくなっても、コードベースが整理された状態が維持されます。

上記の同じルートは、以下のように整理することもできます。

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

ファイル名のパターンとその他の機能については、[ルートファイル規則][route-file-conventions] リファレンスで詳しく読むことができます。

`app/routes` のすぐ下に直接あるフォルダのみがルートとして登録されます。深くネストされたフォルダは無視されます。`app/routes/about/header/route.tsx` のファイルは、ルートを作成しません。

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

`app/routes` フォルダは開発者にとって便利な規則を提供しますが、Remix は [万人に適した方法はない][routes-disclaimer] ことを認識しています。提供された規則が、特定のプロジェクトの要件や開発者の好みに合わない場合があります。このような場合、Remix は [`vite.config.ts`][vite-routes] を介して手動ルート設定を許可しています。この柔軟性により、開発者は、プロジェクトに適した方法でアプリケーションを構成できます。

<docs-warning>まだ [Vite][remix-vite] に移行しておらず、[Classic Remix Compiler][classic-remix-compiler] を使用している場合は、[`remix.config.js`][remix-config] ファイルで手動でルートを設定できます。</docs-warning>

アプリケーションを構造化する一般的な方法は、トップレベルの機能フォルダを使用することです。コンサートのような特定のテーマに関連するルートは、多くのモジュールを共有する可能性が高いためです。それらを単一のフォルダに整理するのが理にかなっています。

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

この構造を、前の例と同じ URL に設定するには、`vite.config.ts` の `routes` 関数を使用できます。

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

Remix のルート設定アプローチは、規則と柔軟性を組み合わせています。`app/routes` フォルダを使用して、ルートを簡単に整理する方法で設定できます。より多くの制御が必要な場合、ファイル名が気に入らない場合、または独自のニーズがある場合は、`vite.config.ts` を使用できます。多くのアプリケーションでは、`app/routes` フォルダの規則を使用するのではなく、`vite.config.ts` を使用する方が一般的です。

[route-file-conventions]: ../file-conventions/routes
[remix-config]: ../file-conventions/remix-config
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite
[vite-routes]: ../file-conventions/vite-config#routes
[routes-disclaimer]: ../file-conventions/routes#disclaimer


