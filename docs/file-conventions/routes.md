---
title: ルートファイルの命名
---

# ルートファイルの命名

[ "routes" プラグインオプション][routes_config] を使用してルートを設定できますが、ほとんどのルートは次のファイルシステム規則に従って作成されます。ファイルを追加すると、ルートが作成されます。

`.js`、`.jsx`、`.ts`、`.tsx` のいずれかのファイル拡張子を使用できます。重複を避けるために、例では `.tsx` を使用します。

<docs-info>Dilum Sanjaya は、[ファイルシステムのルートがアプリの URL にどのようにマッピングされるかを示す素晴らしい視覚化][an_awesome_visualization] を作成しました。これにより、これらの規則を理解するのに役立つかもしれません。</docs-info>

## 免責事項

Remix の規則について詳しく説明する前に、ファイルベースのルーティングは非常に主観的な考え方であることを指摘しておきたいと思います。フラットルートの考え方が好きな人もいれば、嫌いな人もいます。フォルダにルートをネストすることを好む人もいれば、ファイルベースのルーティングを嫌う人もいます。JSON を介してルートを設定することを好む人もいれば、React Router SPA のように JSX を介してルートを設定することを好む人もいます。

要点は、私たちはこれを認識しており、Remix は最初から、[`routes`][routes_config] / [`ignoredRouteFiles`][ignoredroutefiles_config] を介してオプトアウトし、[手動でルートを設定する][manual-route-configuration] 方法を提供してきました。しかし、人々が迅速かつ簡単に使い始めるために、_何らかの_ デフォルトを設定する必要があり、以下のフラットルート規則ドキュメントは、中小規模のアプリに適した、優れたデフォルトであると考えています。

数百または数千のルートを持つ大規模アプリケーションの場合、どのような規則を使用しても必ず少しは混乱します。そして、`routes` 設定を使用することで、アプリケーション/チームに最適な規則を_正確に_構築することができます。Remix に、全員を満足させるデフォルト規則があることは事実上不可能です。むしろ、かなり簡単なデフォルトを提供し、コミュニティがさまざまな規則を構築できるようにしたいと考えています。そこから、選択することができます。

そこで、Remix のデフォルト規則の詳細に入る前に、当社のデフォルト規則が気に入らなければ確認できる、コミュニティが提供する代替手段をいくつか紹介します。

- [`remix-flat-routes`][flat_routes] - Remix のデフォルトは、基本的にこのパッケージの簡易版です。作成者は、このパッケージの繰り返しを行い、進化させてきました。そのため、「フラットルート」の考え方全般が好きで、さらに多くの機能（ファイルとフォルダのハイブリッドアプローチを含む）が必要な場合は、必ずチェックしてください。
- [`remix-custom-routes`][custom_routes] - さらにカスタマイズが必要な場合は、このパッケージを使用すると、ルートとして処理するファイルの種類を定義できます。これにより、単純なフラット/ネストの概念を超えて、「拡張子が `.route.tsx` のファイルはすべてルートである」などの操作が可能になります。
- [`remix-json-routes`][json_routes] - 設定ファイルを使用してルートを指定したいだけなら、これが最適です。フラット/ネストの概念を完全に省略して、ルートを含む JSON オブジェクトを Remix に提供するだけです。JSX オプションもあります。

## ルートルート

```text lines=[3]
app/
├── routes/
└── root.tsx
```

`app/root.tsx` のファイルは、ルートレイアウトまたは「ルートルート」です（これらの単語を同じように発音する人に申し訳ありません）。他のルートと同じように機能するため、[`loader`][loader]、[`action`][action] などをエクスポートできます。

ルートルートは通常、次のようになります。これは、アプリ全体のルートレイアウトとして機能し、他のすべてのルートは [`<Outlet />`][outlet_component] 内にレンダリングされます。

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

`app/routes` ディレクトリ内の JavaScript または TypeScript ファイルはすべて、アプリケーションのルートになります。ファイル名は、ルートの URL パス名にマッピングされます。ただし、`_index.tsx` は [ルートルート][root_route] の [インデックスルート][index_route] です。

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

これらのルートは、[ネストされたルーティング][nested_routing] のため、`app/root.tsx` のアウトレットにレンダリングされます。

## ドット区切り記号

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

ドット区切り記号により、ネストも作成されます。詳細については、[ネストセクション][nested_routes] を参照してください。

## 動的セグメント

通常、URL は静的ではなく、データ駆動型です。動的セグメントを使用すると、URL のセグメントを一致させ、その値をコード内で使用できます。`$` プレフィックスを使用して作成します。

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

Remix は URL から値を解析し、さまざまな API に渡します。これらの値を「URL パラメーター」と呼びます。URL パラメーターにアクセスするのに最も役立つ場所は、[ローダー][loader] と [アクション][action] です。

```tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

`params` オブジェクトのプロパティ名は、ファイル名に直接マッピングされます。`$city.tsx` は `params.city` になります。

ルートには、`concerts.$city.$date` のように、複数の動的セグメントを含めることができます。どちらも、名前で `params` オブジェクトにアクセスできます。

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

ネストされたルーティングは、URL のセグメントをコンポーネント階層とデータに結合するという一般的な考え方です。詳細については、[ルーティングガイド][nested_routing] を参照してください。

[ドット区切り記号][dot_delimiters] を使用して、ネストされたルートを作成します。`.` の前のファイル名が別のルートファイル名と一致する場合、自動的に一致する親ルートの子ルートになります。次のルートについて考えてみましょう。

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

`app/routes/concerts.` で始まるすべてのルートは、`app/routes/concerts.tsx` の子ルートになり、親ルートの [outlet_component][outlet_component] 内にレンダリングされます。

| URL                        | マッチしたルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

通常、ネストされたルートを追加するときは、インデックスルートを追加して、ユーザーが親 URL を直接訪問したときに、親のアウトレットに何かがレンダリングされるようにします。

たとえば、URL が `/concerts/salt-lake-city` の場合、UI 階層は次のようになります。

```tsx
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

## レイアウトのネストなしのネストされた URL

URL をネストしたいが、自動的なレイアウトのネストは不要な場合もあります。親セグメントに末尾のアンダースコアを付けることで、ネストをオプトアウトできます。

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

`/concerts/mine` は、`app/routes/concerts.tsx` ではなく、`app/root.tsx` にネストされていないことに注意してください。`trailing_` アンダースコアはパスセグメントを作成しますが、レイアウトのネストは作成しません。

`trailing_` アンダースコアは、親の署名の末尾にある長いビットと考えてください。それは、親の署名から書き出され、その後のセグメントをレイアウトのネストから削除します。

## ネストされたレイアウトとネストされていない URL

これらを<a name="pathless-routes"><b>パスレスルート</b></a> と呼びます。

URL にパスセグメントを追加せずに、レイアウトをルートのグループと共有したい場合があります。一般的な例として、パブリックページとは異なるヘッダー/フッターを持つ認証ルートセットや、ログインしたアプリエクスペリエンスがあります。`_leading` アンダースコアを使用すると、これを実現できます。

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

`_leading` アンダースコアは、ファイル名の上に引っ張る毛布のように考えてください。ファイル名を URL から隠しています。

## オプションのセグメント

ルートセグメントを括弧で囲むと、そのセグメントがオプションになります。

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

`/american-flag-speedo` が、`($lang).$productId.tsx` ではなく、`($lang)._index.tsx` ルートと一致する理由を疑問に思うかもしれません。これは、オプションの動的パラメーターセグメントの後に別の動的パラメーターがある場合、Remix は、`/american-flag-speedo` などの単一セグメント URL が `/:lang` `/:productId` と一致するかどうかを確実に判断できないためです。オプションのセグメントは貪欲に一致するため、`/:lang` と一致します。このようなセットアップがある場合は、`($lang)._index.tsx` ローダーで `params.lang` を確認し、`params.lang` が有効な言語コードでない場合、現在の/デフォルトの言語の `/:lang/american-flag-speedo` にリダイレクトすることをお勧めします。

## スプラットルート

[動的セグメント][dynamic_segments] は単一のパスセグメント（URL 内の 2 つの `/` 間の文字列）と一致しますが、スプラットルートはスラッシュを含む、URL の残りの部分をすべてと一致します。

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

動的ルートパラメーターと同様に、マッチしたパスの値に、スプラットルートの `params` で `"*"` キーを使用してアクセスできます。

```tsx filename=app/routes/files.$.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const filePath = params["*"];
  return fake.getFileInfo(filePath);
}
```

## 特殊文字のエスケープ

Remix がこれらのルート規則に使用している特殊文字のいずれかを、実際に URL の一部に含めたい場合は、`[]` 文字を使用して規則をエスケープできます。

| ファイル名                            | URL                 |
| ----------------------------------- | ------------------- |
| `app/routes/sitemap[.]xml.tsx`      | `/sitemap.xml`      |
| `app/routes/[sitemap.xml].tsx`      | `/sitemap.xml`      |
| `app/routes/weird-url.[_index].tsx` | `/weird-url/_index` |
| `app/routes/dolla-bills-[$].tsx`    | `/dolla-bills-$`    |
| `app/routes/[[so-weird]].tsx`       | `/[so-weird]`       |

## フォルダによる整理

ルートは、ルートモジュールを定義する `route.tsx` ファイルを含むフォルダにすることもできます。フォルダ内の残りのファイルは、ルートにはなりません。これにより、他のフォルダで機能名を繰り返すことなく、コードを使用するルートに近づけて整理できます。

<docs-info>フォルダ内のファイルは、ルートパスに対して意味を持ちません。ルートパスは、フォルダ名によって完全に定義されます。</docs-info>

次のルートについて考えてみましょう。

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

これらのルートの一部またはすべてを、独自の `route` モジュールを含むフォルダにすることができます。

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

ルートモジュールをフォルダに変換すると、ルートモジュールは `folder/route.tsx` になり、フォルダ内の他のモジュールはルートにはならないことに注意してください。たとえば、次のようになります。

```
# これらは同じルートです。
app/routes/app.tsx
app/routes/app/route.tsx

# これらも同様です
app/routes/app._index.tsx
app/routes/app._index/route.tsx
```

## スケールアップ

スケールアップするための一般的な推奨事項は、すべてのルートをフォルダにし、そのルートのみで使用されるモジュールをフォルダに配置し、共有モジュールはルートフォルダ以外の別の場所に配置することです。これには、いくつかの利点があります。

- 共有モジュールを簡単に特定できるため、変更する際は慎重に処理できます。
- 特定のルートのモジュールを簡単に整理してリファクタリングできるため、「ファイルの整理の疲労感」が軽減され、アプリの他の部分を混乱させません。

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
[dot_delimiters]: #ドット区切り記号
[dynamic_segments]: #動的セグメント
[an_awesome_visualization]: https://interactive-remix-routing-v2.netlify.app/
[flat_routes]: https://github.com/kiliman/remix-flat-routes
[custom_routes]: https://github.com/jacobparis-insiders/remix-custom-routes
[json_routes]: https://github.com/brophdawg11/remix-json-routes
[manual-route-configuration]: ../discussion/routes#手動のルート設定



