---
title: ルートファイルの命名
---

# ルートファイルの命名

[「routes」プラグインオプション][routes_config] を使用してルートを設定できますが、ほとんどのルートは次のファイルシステム規則で作成されます。ファイルを追加すると、ルートが作成されます。

.js、.jsx、.ts、または .tsx のファイル拡張子を使用できます。重複を避けるために、例では .tsx を使用します。

<docs-info>Dilum Sanjaya は、[ファイルシステムのルートがアプリの URL にどのようにマップされるかを示す素晴らしいビジュアライゼーション][an_awesome_visualization] を作成しました。この規則を理解するのに役立つかもしれません。</docs-info>

## 免責事項

Remix の規則について詳しく説明する前に、ファイルベースのルーティングは非常に主観的なアイデアであることを指摘しておきたいと思います。フラットルートのアイデアが好きな人もいれば、嫌いな人もいます。ルートをフォルダにネストしたい人もいれば、単純にファイルベースのルーティングが嫌いな人もいます。JSON を使用してルートを設定したい人もいます。React Router SPA でのように JSX を使用してルートを設定したい人もいます。

つまり、私たちはこれを認識しており、Remix は最初から、[`routes`][routes_config]/[`ignoredRouteFiles`][ignoredroutefiles_config] を使用してオプトアウトし、[ルートを手動で構成する][manual-route-configuration] 方法を提供してきました。しかし、人々が迅速かつ簡単に使い始めるために、何らかのデフォルトが必要です。そして、下のフラットルート規則ドキュメントは、中小規模のアプリに適した優れたデフォルトだと考えています。

数百または数千のルートを持つ大規模なアプリケーションでは、どのような規則を使用しても必ず少し混乱が生じます。`routes` 設定を使用すれば、アプリケーションやチームにとって最適な規則を構築できます。Remix に、全員が満足できるデフォルトの規則を持つことは、文字通り不可能です。むしろ、かなり単純なデフォルトを提供し、コミュニティに、さまざまな規則を構築してもらいたいと考えています。

そこで、Remix のデフォルト規則の詳細に進む前に、デフォルトが気に入らない場合は、コミュニティで提供されている代替手段をご紹介します。

- [`remix-flat-routes`][flat_routes] - Remix のデフォルトは、基本的にこのパッケージの簡略化されたバージョンです。作者はこのパッケージを継続的に改善し、進化させてきました。そのため、「フラットルート」というアイデアは好きだが、もう少し機能（ファイルとフォルダのハイブリッドアプローチを含む）が必要な場合は、このパッケージをチェックしてみることをお勧めします。
- [`remix-custom-routes`][custom_routes] - さらにカスタマイズしたい場合は、このパッケージを使用すると、ルートとして扱うファイルの種類を定義できます。これにより、単純なフラット/ネストだけでなく、たとえば、`.route.tsx` という拡張子のファイルはすべてルートというようなことができます。
- [`remix-json-routes`][json_routes] - 単純に設定でルートを指定したい場合は、これが最適です。Remix にルートの JSON オブジェクトを渡すだけで、フラット/ネストの概念を完全に省略できます。JSX オプションもあります。

## ルートルート

```text lines=[3]
app/
├── routes/
└── root.tsx
```

`app/root.tsx` 内のファイルは、ルートレイアウトまたは「ルートルート」（同じように発音する人にとっては申し訳ありません！）です。他のすべてのルートと同様に動作するため、[`loader`][loader]、[`action`][action] などをエクスポートできます。

ルートルートは、通常、次のようになります。これは、アプリ全体のルートレイアウトとして機能し、他のすべてのルートは [`<Outlet />`][outlet_component] 内にレンダリングされます。

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

## 基本ルート

`app/routes` ディレクトリの JavaScript または TypeScript ファイルはすべて、アプリケーションのルートになります。ファイル名はルートの URL パス名にマップされます。ただし、`_index.tsx` は [ルートルート][root_route] の [インデックスルート][index_route] です。

```text lines=[3-4]
app/
├── routes/
│   ├── _index.tsx
│   └── about.tsx
└── root.tsx
```

| URL      | マッチしたルート          |
| -------- | ----------------------- |
| `/`      | `app/routes/_index.tsx` |
| `/about` | `app/routes/about.tsx`  |

[ネストされたルーティング][nested_routing] のため、これらのルートは `app/root.tsx` のアウトレットにレンダリングされます。

## ドット区切り文字

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

| URL                        | マッチしたルート                            |
| -------------------------- | ---------------------------------------- |
| `/`                        | `app/routes/_index.tsx`                  |
| `/about`                   | `app/routes/about.tsx`                   |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx`       |
| `/concerts/salt-lake-city` | `app/routes/concerts.salt-lake-city.tsx` |
| `/concerts/san-diego`      | `app/routes/concerts.san-diego.tsx`      |

ドット区切り文字はネストも作成します。詳細については、[ネストセクション][nested_routes] を参照してください。

## 動的セグメント

通常、URL は静的ではなく、データ駆動型です。動的セグメントを使用すると、URL のセグメントをマッチングし、その値をコードで使用できます。`$` プレフィックスを使用して作成します。

```text lines=[5]
 app/
├── routes/
│   ├── _index.tsx
│   ├── about.tsx
│   ├── concerts.$city.tsx
│   └── concerts.trending.tsx
└── root.tsx
```

| URL                        | マッチしたルート                      |
| -------------------------- | ---------------------------------- |
| `/`                        | `app/routes/_index.tsx`            |
| `/about`                   | `app/routes/about.tsx`             |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    |
| `/concerts/san-diego`      | `app/routes/concerts.$city.tsx`    |

Remix は、URL から値を解析し、さまざまな API に渡します。これらの値を「URL パラメータ」と呼びます。URL パラメータにアクセスするのに最も役立つ場所は、[ローダー][loader] と [アクション][action] です。

```tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

`params` オブジェクトのプロパティ名は、ファイル名に直接マップされます。`$city.tsx` は `params.city` になります。

ルートには、`concerts.$city.$date` のように、複数の動的セグメントを含めることができます。どちらも `params` オブジェクトで名前でアクセスできます。

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

ネストされたルーティングとは、URL のセグメントをコンポーネント階層とデータに関連付ける一般的なアイデアです。[ルーティングガイド][nested_routing] で詳細を読むことができます。

[ドット区切り文字][dot_delimiters] を使用して、ネストされたルートを作成します。`.` の前のファイル名が他のルートファイル名と一致する場合、自動的に一致する親ルートの子ルートになります。次のルートを考えてみましょう。

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

| URL                        | マッチしたルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

通常、ネストされたルートを追加する場合は、インデックスルートを追加して、ユーザーが親 URL を直接訪問したときに、親のアウトレットに何かがレンダリングされるようにします。

たとえば、URL が `/concerts/salt-lake-city` の場合、UI 階層は次のようになります。

```tsx
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

## レイアウトのネストなしで URL をネストする

場合によっては、URL をネストしたい場合がありますが、自動レイアウトのネストは避けたい場合があります。親セグメントに下線を追加することで、ネストを回避できます。

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

| URL                        | マッチしたルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts/mine`           | `app/routes/concerts_.mine.tsx`    | `app/root.tsx`            |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

`/concerts/mine` は、`app/routes/concerts.tsx` とはネストされなくなりますが、`app/root.tsx` とネストされます。`trailing_` 下線はパスセグメントを作成しますが、レイアウトのネストは作成しません。

`trailing_` 下線を、親の署名の最後にある長い部分と考えてください。親の署名から名前を消し、その後のセグメントをレイアウトのネストから削除します。

## ネストされたレイアウトを URL をネストせずに使用

これらを <a name="pathless-routes"><b>パスなしルート</b></a> と呼びます。

場合によっては、URL にパスセグメントを追加せずに、ルートグループとレイアウトを共有したい場合があります。一般的な例としては、パブリックページやログイン済みアプリのエクスペリエンスとは異なるヘッダー/フッターを持つ認証ルートのセットがあります。`_leading` 下線を使用して、これを実現できます。

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

| URL                        | マッチしたルート                   | レイアウト                    |
| -------------------------- | ------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`         | `app/root.tsx`            |
| `/login`                   | `app/routes/_auth.login.tsx`    | `app/routes/_auth.tsx`    |
| `/register`                | `app/routes/_auth.register.tsx` | `app/routes/_auth.tsx`    |
| `/concerts`                | `app/routes/concerts.tsx`       | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx` | `app/routes/concerts.tsx` |

`_leading` 下線を、ファイル名の上に引っ張る毛布と考えてください。ファイル名を URL から隠します。

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

| URL                        | マッチしたルート                       |
| -------------------------- | ----------------------------------- |
| `/`                        | `app/routes/($lang)._index.tsx`     |
| `/categories`              | `app/routes/($lang).categories.tsx` |
| `/en/categories`           | `app/routes/($lang).categories.tsx` |
| `/fr/categories`           | `app/routes/($lang).categories.tsx` |
| `/american-flag-speedo`    | `app/routes/($lang)._index.tsx`     |
| `/en/american-flag-speedo` | `app/routes/($lang).$productId.tsx` |
| `/fr/american-flag-speedo` | `app/routes/($lang).$productId.tsx` |

`/american-flag-speedo` が `($lang).$productId.tsx` ではなく `($lang)._index.tsx` ルートとマッチングするのはなぜでしょうか。これは、オプションの動的パラメータセグメントの後に別の動的パラメータがある場合、Remix は `/american-flag-speedo` などの単一セグメント URL が `/:lang` `/:productId` とマッチングするかどうかを確実に判断できません。オプションのセグメントは貪欲にマッチングするため、`/:lang` とマッチングします。このような設定の場合、`($lang)._index.tsx` ローダーで `params.lang` を確認し、`params.lang` が有効な言語コードでない場合は、現在の/デフォルト言語の `/:lang/american-flag-speedo` にリダイレクトすることをお勧めします。

## スプラットルート

[動的セグメント][dynamic_segments] は、URL の 2 つの `/` の間の部分（セグメント）とマッチングしますが、スプラットルートはスラッシュを含む URL の残りの部分とマッチングします。

```text lines=[4,6]
 app/
├── routes/
│   ├── _index.tsx
│   ├── $.tsx
│   ├── about.tsx
│   └── files.$.tsx
└── root.tsx
```

| URL                                          | マッチしたルート            |
| -------------------------------------------- | ------------------------ |
| `/`                                          | `app/routes/_index.tsx`  |
| `/about`                                     | `app/routes/about.tsx`   |
| `/beef/and/cheese`                           | `app/routes/$.tsx`       |
| `/files`                                     | `app/routes/files.$.tsx` |
| `/files/talks/remix-conf_old.pdf`            | `app/routes/files.$.tsx` |
| `/files/talks/remix-conf_final.pdf`          | `app/routes/files.$.tsx` |
| `/files/talks/remix-conf-FINAL-MAY_2022.pdf` | `app/routes/files.$.tsx` |

動的ルートパラメータと同様に、マッチングされたパスの値を、スプラットルートの `params` の `"*"` キーでアクセスできます。

```tsx filename=app/routes/files.$.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const filePath = params["*"];
  return fake.getFileInfo(filePath);
}
```

## 特殊文字のエスケープ

これらのルート規則に使用される特殊文字を URL の一部として使用したい場合は、`[]` 文字を使用して規則をエスケープできます。

| ファイル名                            | URL                 |
| ----------------------------------- | ------------------- |
| `app/routes/sitemap[.]xml.tsx`      | `/sitemap.xml`      |
| `app/routes/[sitemap.xml].tsx`      | `/sitemap.xml`      |
| `app/routes/weird-url.[_index].tsx` | `/weird-url/_index` |
| `app/routes/dolla-bills-[$].tsx`    | `/dolla-bills-$`    |
| `app/routes/[[so-weird]].tsx`       | `/[so-weird]`       |

## フォルダによる整理

ルートは、`route.tsx` ファイルを含むフォルダにすることもできます。フォルダ内のファイルはルートにはなりません。これにより、コードをルートで使用されるコードに近い場所に整理し、他のフォルダで機能名を繰り返す必要がなくなります。

<docs-info>フォルダ内のファイルはルートパスとは無関係です。ルートパスはフォルダ名で完全に定義されます</docs-info>

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

これらのルートの一部またはすべては、フォルダにすることができ、その中に独自の `route` モジュールが含まれます。

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

ルートモジュールをフォルダに変換すると、ルートモジュールは `folder/route.tsx` になります。フォルダ内の他のモジュールは、ルートにはなりません。たとえば、

```
# これらは同じルートです。
app/routes/app.tsx
app/routes/app/route.tsx

# これらも同様です
app/routes/app._index.tsx
app/routes/app._index/route.tsx
```

## スケーリング

一般的に、スケーリングの推奨事項は、すべてのルートをフォルダにすることです。そのルートでしか使用されないモジュールをフォルダに入れ、共有モジュールはルートフォルダの外の別の場所に配置します。これには、いくつかの利点があります。

- 共有モジュールを簡単に特定できるため、変更する際は慎重に進めることができます。
- 特定のルートのモジュールを簡単に整理してリファクタリングできます。「ファイル整理疲労」を防ぎ、アプリの他の部分を混乱させることもありません。

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
[dot_delimiters]: #ドット区切り文字
[dynamic_segments]: #動的セグメント
[an_awesome_visualization]: https://interactive-remix-routing-v2.netlify.app/
[flat_routes]: https://github.com/kiliman/remix-flat-routes
[custom_routes]: https://github.com/jacobparis-insiders/remix-custom-routes
[json_routes]: https://github.com/brophdawg11/remix-json-routes
[manual-route-configuration]: ../discussion/routes#ルートを手動で構成する


