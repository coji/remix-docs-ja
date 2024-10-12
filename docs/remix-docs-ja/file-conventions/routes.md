---
title: ルートファイルの命名
---

# ルートファイルの命名

[ "routes" プラグインオプション][routes_config] でルートを構成できますが、ほとんどのルートはこのファイルシステム規則を使用して作成されます。ファイルを追加すればルートが生成されます。

.js、.jsx、.ts、.tsx のいずれかのファイル拡張子を使用できます。重複を避けるために、例では .tsx を使用します。

<docs-info>Dilum Sanjaya は、[ファイルシステム内のルートがアプリ内の URL にどのようにマッピングされるかを示す素晴らしいビジュアライゼーション][an_awesome_visualization] を作成しました。この規則を理解するのに役立つかもしれません。</docs-info>

## 免責事項

Remix の規則について詳しく説明する前に、ファイルベースのルーティングは **非常に** 主観的なアイデアであることを指摘しておきます。フラットルートのアイデアを気に入っている人もいれば、嫌いでフォルダ内にルートをネストすることを好む人もいます。ファイルベースのルーティングが嫌いで、JSON でルートを構成することを好む人もいます。React Router SPA のように JSX でルートを構成することを好む人もいます。

要点は、私たちはこれをよく理解しており、Remix は最初から、[`routes`][routes_config]/[`ignoredRouteFiles`][ignoredroutefiles_config] を通じてオプトアウトする方法と、[ルートを手動で構成する][manual-route-configuration] 方法を常に提供してきました。しかし、人々が簡単に迅速に使い始めるために、_何らかの_ デフォルトが必要であり、以下のフラットルート規則ドキュメントは、中規模のアプリに適したかなり良いデフォルトだと考えています。

数百または数千ものルートを持つ大規模なアプリケーションでは、どのような規則を使用しても _常に_ 少し混乱が生じます。そして、`routes` 構成を通じて、アプリケーション/チームに最適な規則を _まさに_ 作成できることが重要です。Remix に、すべての人を満足させるデフォルトの規則を持たせることは、実際には不可能です。私たちは、かなり単純なデフォルトを提供し、コミュニティが自由にさまざまな規則を作成できるようにすることが望ましいです。

そこで、Remix のデフォルト規則の詳細を説明する前に、デフォルト規則が好みではない場合に確認できる、コミュニティによる代替案をいくつか紹介します。

- [`remix-flat-routes`][flat_routes] - Remix のデフォルトは、このパッケージの簡略化されたバージョンです。著者はこのパッケージの改善と進化を続けています。そのため、"フラットルート" のアイデアは概ね気に入っているものの、さらに多くの機能 (ファイルとフォルダのハイブリッドアプローチなど) を必要とする場合は、ぜひこのパッケージをチェックしてみてください。
- [`remix-custom-routes`][custom_routes] - さらにカスタマイズが必要な場合は、このパッケージを使用すると、ルートとして扱うファイルの種類を定義できます。これにより、単純なフラット/ネストされた概念を超えて、たとえば _"拡張子が .route.tsx のファイルはすべてルートである" _ といったことを行うことができます。
- [`remix-json-routes`][json_routes] - 構成ファイルでルートを指定するだけで良い場合は、これが最適です。フラット/ネストされた概念を完全に無視して、ルートを指定した JSON オブジェクトを Remix に提供するだけです。JSX オプションもあります。

## ルートルート

```text lines=[3]
app/
├── routes/
└── root.tsx
```

`app/root.tsx` 内のファイルは、ルートレイアウト、つまり "ルートルート" です (これらの単語を同じように発音する人たちには申し訳ありません！)。他のすべてのルートと同じように動作するため、[`loader`][loader]、[`action`][action] などをエクスポートできます。

ルートルートは、通常次のようなものになります。これは、アプリ全体のルートレイアウトとして機能し、他のすべてのルートは [`<Outlet />`][outlet_component] 内にレンダリングされます。

```tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Links />
        <Meta />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

## 基本的なルート

`app/routes` ディレクトリ内の JavaScript ファイルまたは TypeScript ファイルはすべて、アプリケーション内のルートになります。ファイル名は、ルートの URL パス名にマップされます。ただし、`_index.tsx` は、[ルートルート][root_route] の [インデックスルート][index_route] です。

```text lines=[3-4]
app/
├── routes/
│   ├── _index.tsx
│   └── about.tsx
└── root.tsx
```

| URL      | マッチするルート          |
| -------- | ----------------------- |
| `/`      | `app/routes/_index.tsx` |
| `/about` | `app/routes/about.tsx`  |

これらのルートは、[ネストされたルーティング][nested_routing] のため、`app/root.tsx` のアウトレットにレンダリングされます。

## ドットデリミタ

ルートファイル名に `.` を追加すると、URL に `/` が作成されます。

```text lines=[5-7]
 app/
├── routes/
│   ├── _index.tsx
│   ├── about.tsx
│   ├── concerts.trending.tsx
│   ├── concerts.salt-lake-city.tsx
│   └── concerts.san-diego.tsx
└── root.tsx
```

| URL                        | マッチするルート                            |
| -------------------------- | ---------------------------------------- |
| `/`                        | `app/routes/_index.tsx`                  |
| `/about`                   | `app/routes/about.tsx`                   |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx`       |
| `/concerts/salt-lake-city` | `app/routes/concerts.salt-lake-city.tsx` |
| `/concerts/san-diego`      | `app/routes/concerts.san-diego.tsx`      |

ドットデリミタはネストも作成します。詳細については、[ネストに関するセクション][nested_routes] を参照してください。

## 動的セグメント

通常、URL は静的ではなく、データ駆動型です。動的セグメントを使用すると、URL のセグメントを一致させ、その値をコード内で使用できます。`$` プレフィックスで作成します。

```text lines=[5]
 app/
├── routes/
│   ├── _index.tsx
│   ├── about.tsx
│   ├── concerts.$city.tsx
│   └── concerts.trending.tsx
└── root.tsx
```

| URL                        | マッチするルート                      |
| -------------------------- | ---------------------------------- |
| `/`                        | `app/routes/_index.tsx`            |
| `/about`                   | `app/routes/about.tsx`             |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    |
| `/concerts/san-diego`      | `app/routes/concerts.$city.tsx`    |

Remix は URL から値を解析して、さまざまな API に渡します。これらの値を "URL パラメータ" と呼びます。URL パラメータにアクセスするのに最も役立つ場所は、[ローダー][loader] と [アクション][action] です。

```tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

`params` オブジェクトのプロパティ名は、ファイル名に直接マップされます。`$city.tsx` は `params.city` になります。

ルートは `concerts.$city.$date` のように、複数の動的セグメントを持つことができます。どちらも、`params` オブジェクトで名前でアクセスできます。

```tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  return fake.db.getConcerts({
    date: params.date,
    city: params.city,
  });
}
```

詳細については、[ルーティングガイド][routing_guide] を参照してください。

## ネストされたルート

ネストされたルーティングは、URL のセグメントとコンポーネントの階層およびデータの関係を組み合わせるという一般的なアイデアです。[ルーティングガイド][nested_routing] で詳細を確認できます。

[ドットデリミタ][dot_delimiters] を使用して、ネストされたルートを作成します。`.` の前のファイル名が別のルートファイル名と一致する場合、自動的にその一致する親ルートの子ルートになります。次のルートを考えてみましょう。

```text lines=[5-8]
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

`app/routes/concerts.` で始まるすべてのルートは、`app/routes/concerts.tsx` の子ルートとなり、親ルートの [outlet_component][outlet_component] 内にレンダリングされます。

| URL                        | マッチするルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

通常、ネストされたルートを追加するときは、インデックスルートを追加して、ユーザーが親 URL に直接アクセスしたときに親のアウトレット内に何かがレンダリングされるようにします。

たとえば、URL が `/concerts/salt-lake-city` の場合、UI 階層は次のようになります。

```tsx
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

## レイアウトのネストなしでネストされた URL

これらの URL を [パスのないルート][pathless-routes] と呼びます。

URL をネストする必要があるものの、レイアウトのネストは不要な場合があります。親セグメントに末尾のアンダースコアを追加することで、ネストをオプトアウトできます。

```text lines=[8]
 app/
├── routes/
│   ├── _index.tsx
│   ├── about.tsx
│   ├── concerts.$city.tsx
│   ├── concerts.trending.tsx
│   ├── concerts.tsx
│   └── concerts_.mine.tsx
└── root.tsx
```

| URL                        | マッチするルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts/mine`           | `app/routes/concerts_.mine.tsx`    | `app/root.tsx`            |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

`/concerts/mine` は、`app/routes/concerts.tsx` ではなく、`app/root.tsx` とネストされていないことに注意してください。`trailing_` アンダースコアはパスセグメントを作成しますが、レイアウトのネストは作成しません。

`trailing_` アンダースコアは、親の署名の最後の長いビットのように考えてください。これは、親の署名の最後の長いビットのように考えてください。あなたを遺言から除外して、続くセグメントをレイアウトのネストから削除します。

## ネストされたレイアウトとネストされていない URL

これらの URL を [パスのないルート][pathless-routes] と呼びます。

URL にパスセグメントを追加せずに、ルートのグループとレイアウトを共有したい場合があります。一般的な例としては、公開ページとは異なるヘッダー/フッターを持つ認証ルートのセット、またはログイン後のアプリのエクスペリエンスなどがあります。`_leading` アンダースコアを使用すると、これを実現できます。

```text lines=[3-5]
 app/
├── routes/
│   ├── _auth.login.tsx
│   ├── _auth.register.tsx
│   ├── _auth.tsx
│   ├── _index.tsx
│   ├── concerts.$city.tsx
│   └── concerts.tsx
└── root.tsx
```

| URL                        | マッチするルート                   | レイアウト                    |
| -------------------------- | ------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`         | `app/root.tsx`            |
| `/login`                   | `app/routes/_auth.login.tsx`    | `app/routes/_auth.tsx`    |
| `/register`                | `app/routes/_auth.register.tsx` | `app/routes/_auth.tsx`    |
| `/concerts`                | `app/routes/concerts.tsx`       | `app/root.tsx`            |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx` | `app/routes/concerts.tsx` |

`_leading` アンダースコアは、ファイル名を覆う毛布のように考えてください。ファイル名を URL から隠します。

## オプションのセグメント

ルートセグメントを括弧で囲むと、そのセグメントはオプションになります。

```text lines=[3-5]
 app/
├── routes/
│   ├── ($lang)._index.tsx
│   ├── ($lang).$productId.tsx
│   └── ($lang).categories.tsx
└── root.tsx
```

| URL                        | マッチするルート                       |
| -------------------------- | ----------------------------------- |
| `/`                        | `app/routes/($lang)._index.tsx`     |
| `/categories`              | `app/routes/($lang).categories.tsx` |
| `/en/categories`           | `app/routes/($lang).categories.tsx` |
| `/fr/categories`           | `app/routes/($lang).categories.tsx` |
| `/american-flag-speedo`    | `app/routes/($lang)._index.tsx`     |
| `/en/american-flag-speedo` | `app/routes/($lang).$productId.tsx` |
| `/fr/american-flag-speedo` | `app/routes/($lang).$productId.tsx` |

`/american-flag-speedo` が `($lang).$productId.tsx` ではなく `($lang)._index.tsx` ルートと一致するのはなぜでしょうか？これは、オプションの動的パラメータセグメントの後に別の動的パラメータが続く場合、Remix は `/american-flag-speedo` のような単一のセグメント URL が `/:lang` `/:productId` のどちらと一致するべきかを確実に判断できないためです。オプションのセグメントは貪欲にマッチするため、`/:lang` と一致することになります。このようなセットアップがある場合は、`($lang)._index.tsx` ローダーで `params.lang` を確認し、`params.lang` が有効な言語コードでない場合は、現在の/デフォルトの言語の `/:lang/american-flag-speedo` にリダイレクトすることをお勧めします。

## スプラットルート

[動的セグメント][dynamic_segments] は、URL 内の 2 つの `/` の間の (1 つのパスセグメント) を一致させますが、スプラットルートはスラッシュを含む、URL の残りを一致させます。

```text lines=[4,6]
 app/
├── routes/
│   ├── _index.tsx
│   ├── $.tsx
│   ├── about.tsx
│   └── files.$.tsx
└── root.tsx
```

| URL                                          | マッチするルート            |
| -------------------------------------------- | ------------------------ |
| `/`                                          | `app/routes/_index.tsx`  |
| `/about`                                     | `app/routes/about.tsx`   |
| `/beef/and/cheese`                           | `app/routes/$.tsx`       |
| `/files`                                     | `app/routes/files.$.tsx` |
| `/files/talks/remix-conf_old.pdf`            | `app/routes/files.$.tsx` |
| `/files/talks/remix-conf_final.pdf`          | `app/routes/files.$.tsx` |
| `/files/talks/remix-conf-FINAL-MAY_2022.pdf` | `app/routes/files.$.tsx` |

動的ルートパラメータと同様に、スプラットルートの `params` で `"*"` キーを使用して、一致したパスの値にアクセスできます。

```tsx filename=app/routes/files.$.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const filePath = params["*"];
  return fake.getFileInfo(filePath);
}
```

## 特殊文字のエスケープ

Remix でこれらのルート規則に使用される特殊文字のいずれかを、実際に URL の一部として使用したい場合は、`[]` 文字を使用して規則をエスケープできます。

| ファイル名                            | URL                 |
| ----------------------------------- | ------------------- |
| `app/routes/sitemap[.]xml.tsx`      | `/sitemap.xml`      |
| `app/routes/[sitemap.xml].tsx`      | `/sitemap.xml`      |
| `app/routes/weird-url.[_index].tsx` | `/weird-url/_index` |
| `app/routes/dolla-bills-[$].tsx`    | `/dolla-bills-$`    |
| `app/routes/[[so-weird]].tsx`       | `/[so-weird]`       |

## フォルダによる整理

ルートは、`route.tsx` ファイルを含むフォルダにすることもできます。このファイルはルートモジュールを定義します。フォルダ内の残りのファイルはルートになりません。これにより、コードを、他のフォルダで機能名を使用するのではなく、使用するルートに近い場所に整理できます。

<docs-info>フォルダ内のファイルは、ルートパスには意味がありません。ルートパスは、フォルダ名によって完全に定義されます。</docs-info>

次のルートを考えてみましょう。

```text
 app/
├── routes/
│   ├── _landing._index.tsx
│   ├── _landing.about.tsx
│   ├── _landing.tsx
│   ├── app._index.tsx
│   ├── app.projects.tsx
│   ├── app.tsx
│   └── app_.projects.$id.roadmap.tsx
└── root.tsx
```

これらはすべて、または一部が、独自の `route` モジュールを含むフォルダになる可能性があります。

```text
app/
├── routes/
│   ├── _landing._index/
│   │   ├── route.tsx
│   │   └── scroll-experience.tsx
│   ├── _landing.about/
│   │   ├── employee-profile-card.tsx
│   │   ├── get-employee-data.server.ts
│   │   ├── route.tsx
│   │   └── team-photo.jpg
│   ├── _landing/
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   └── route.tsx
│   ├── app._index/
│   │   ├── route.tsx
│   │   └── stats.tsx
│   ├── app.projects/
│   │   ├── get-projects.server.ts
│   │   ├── project-buttons.tsx
│   │   ├── project-card.tsx
│   │   └── route.tsx
│   ├── app/
│   │   ├── footer.tsx
│   │   ├── primary-nav.tsx
│   │   └── route.tsx
│   ├── app_.projects.$id.roadmap/
│   │   ├── chart.tsx
│   │   ├── route.tsx
│   │   └── update-timeline.server.ts
│   └── contact-us.tsx
└── root.tsx
```

ルートモジュールをフォルダに変換すると、ルートモジュールは `folder/route.tsx` になり、フォルダ内の他のモジュールはすべてルートになりません。たとえば、

```
# これらは同じルートです:
app/routes/app.tsx
app/routes/app/route.tsx

# これらも同様です
app/routes/app._index.tsx
app/routes/app._index/route.tsx
```

## スケーリング

スケーリングする際の一般的な推奨事項は、すべてのルートをフォルダにし、そのルート専用に使用されるモジュールをフォルダに配置し、共有モジュールはルートフォルダの外に別の場所に配置することです。これには、いくつかの利点があります。

- 共有モジュールを簡単に特定できるため、変更する際は慎重に
- 特定のルートのモジュールを簡単に整理してリファクタリングできるため、"ファイルの整理による疲労" が発生したり、アプリの他の部分に混乱が生じたりすることはありません。

[loader]: ../route/loader
[action]: ../route/action
[outlet_component]: ../components/outlet
[routing_guide]: ../discussion/routes
[root_route]: #ルートルート
[index_route]: ../discussion/routes#インデックスルート
[nested_routing]: ../discussion/routes#ネストされたルーティングとは
[nested_routes]: #ネストされたルート
[routes_config]: ./vite-config#routes
[ignoredroutefiles_config]: ./vite-config#ignoredroutefiles
[dot_delimiters]: #ドットデリミタ
[dynamic_segments]: #動的セグメント
[an_awesome_visualization]: https://interactive-remix-routing-v2.netlify.app/
[flat_routes]: https://github.com/kiliman/remix-flat-routes
[custom_routes]: https://github.com/jacobparis-insiders/remix-custom-routes
[json_routes]: https://github.com/brophdawg11/remix-json-routes
[manual-route-configuration]: ../discussion/routes#手動によるルートの構成



