---
title: ルートファイルの命名
---

# ルートファイルの命名

ルートは[「routes」プラグインオプション][routes_config]で設定できますが、ほとんどのルートはこのファイルシステム規約で作成されます。ファイルを追加すると、ルートが作成されます。

`.js`、`.jsx`、`.ts`、`.tsx`のいずれかのファイル拡張子を使用できることに注意してください。重複を避けるため、例では`.tsx`を使用します。

<docs-info>Dilum Sanjaya氏が、ファイルシステム内のルートがアプリのURLにどのようにマッピングされるかを[素晴らしい視覚化][an_awesome_visualization]で示してくれました。これらの規約を理解するのに役立つかもしれません。</docs-info>

## 免責事項

Remixの規約について詳しく説明する前に、ファイルベースのルーティングは**非常に**主観的な考え方であることを指摘しておきたいと思います。「フラット」なルートの考え方を好む人もいれば、嫌ってフォルダにルートをネストすることを好む人もいます。ファイルベースのルーティングを嫌って、JSONでルートを設定することを好む人もいます。React Router SPAで行っていたように、JSXでルートを設定することを好む人もいます。

重要なのは、私たちはこのことをよく認識しており、Remixは最初から、[`routes`][routes_config]/[`ignoredRouteFiles`][ignoredroutefiles_config]と[手動でのルート設定][manual-route-configuration]によって、オプトアウトできる一流の方法を提供してきたということです。しかし、人々が迅速かつ簡単に起動できるように、_何らかの_デフォルトが必要であり、以下のフラットルート規約は、中小規模のアプリに適したデフォルトであると考えています。

数百または数千のルートを持つ大規模なアプリケーションは、どのような規約を使用しても_常に_少し混沌とするでしょう。そして、`routes`設定を通じて、アプリケーション/チームに最適な規約を_正確に_構築できるという考え方です。Remixがすべての人を満足させるデフォルトの規約を持つことは、文字通り不可能でしょう。私たちは、かなり簡単なデフォルトを提供し、コミュニティが選択できる多くの規約を構築できるようにすることを望んでいます。

Remixのデフォルト規約の詳細に入る前に、私たちのデフォルトが気に入らない場合に確認できるコミュニティの代替案をいくつか紹介します。

- [`remix-flat-routes`][flat_routes] - Remixのデフォルトは、基本的にこのパッケージの簡略化されたバージョンです。作者はこのパッケージを反復して進化させ続けているため、「フラットルート」の考え方が好きだが、もう少しパワー（ファイルとフォルダのハイブリッドアプローチを含む）が必要な場合は、ぜひチェックしてみてください。
- [`remix-custom-routes`][custom_routes] - さらにカスタマイズしたい場合は、このパッケージを使用すると、どのタイプのファイルをルートとして扱うかを定義できます。これにより、単純なフラット/ネストの概念を超えて、「`.route.tsx`という拡張子を持つファイルはすべてルートである」などの処理を行うことができます。
- [`remix-json-routes`][json_routes] - 設定ファイルでルートを指定したい場合は、これが最適です。ルートを含むJSONオブジェクトをRemixに提供するだけで、フラット/ネストの概念を完全にスキップできます。JSXオプションもあります。

## ルートルート

```text lines=[3]
app/
├── routes/
└── root.tsx
```

`app/root.tsx`内のファイルは、ルートレイアウト、または「ルートルート」です（これらの単語の発音が同じである方には大変申し訳ありません！）。他のすべてのルートと同じように機能するため、[`loader`][loader]、[`action`][action]などをエクスポートできます。

ルートルートは通常、次のようになります。アプリ全体のルートレイアウトとして機能し、他のすべてのルートは[`<Outlet />`][outlet_component]内でレンダリングされます。

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

`app/routes`ディレクトリ内のJavaScriptまたはTypeScriptファイルは、アプリケーションのルートになります。ファイル名はルートのURLパス名にマッピングされますが、[`_index.tsx`][index_route]は[ルートルート][root_route]の[インデックスルート][index_route]です。

```text lines=[3-4]
app/
├── routes/
│   ├── _index.tsx
│   └── about.tsx
└── root.tsx
```

| URL      | 一致するルート          |
| -------- | ----------------------- |
| `/`      | `app/routes/_index.tsx` |
| `/about` | `app/routes/about.tsx`  |

これらのルートは、[ネストされたルーティング][nested_routing]のため、`app/root.tsx`のアウトレットでレンダリングされることに注意してください。

## ドット区切り文字

ルートファイル名に`.`を追加すると、URLに`/`が作成されます。

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

| URL                        | 一致するルート                            |
| -------------------------- | ---------------------------------------- |
| `/`                        | `app/routes/_index.tsx`                  |
| `/about`                   | `app/routes/about.tsx`                   |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx`       |
| `/concerts/salt-lake-city` | `app/routes/concerts.salt-lake-city.tsx` |
| `/concerts/san-diego`      | `app/routes/concerts.san-diego.tsx`      |

ドット区切り文字はネストも作成します。詳細については、[ネストセクション][nested_routes]を参照してください。

## 動的セグメント

通常、URLは静的ではなくデータ駆動型です。動的セグメントを使用すると、URLのセグメントを照合し、その値をコードで使用できます。`$`プレフィックスを使用して作成します。

```text lines=[5]
 app/
├── routes/
│   ├── _index.tsx
│   ├── about.tsx
│   ├── concerts.$city.tsx
│   └── concerts.trending.tsx
└── root.tsx
```

| URL                        | 一致するルート                      |
| -------------------------- | ---------------------------------- |
| `/`                        | `app/routes/_index.tsx`            |
| `/about`                   | `app/routes/about.tsx`             |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    |
| `/concerts/san-diego`      | `app/routes/concerts.$city.tsx`    |

RemixはURLから値を解析し、さまざまなAPIに渡します。これらの値を「URLパラメータ」と呼びます。URLパラメータにアクセスする最も便利な場所は、[ローダー][loader]と[アクション][action]です。

```tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

`params`オブジェクトのプロパティ名は、ファイル名に直接マッピングされることに注意してください。`$city.tsx`は`params.city`になります。

ルートには、`concerts.$city.$date`のように複数の動的セグメントを含めることができます。どちらも名前でparamsオブジェクトにアクセスできます。

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

詳細については、[ルーティングガイド][routing_guide]を参照してください。

## ネストされたルート

ネストされたルーティングは、URLのセグメントをコンポーネント階層とデータに結合するという一般的な考え方です。詳細については、[ルーティングガイド][nested_routing]を参照してください。

[ドット区切り文字][dot_delimiters]を使用して、ネストされたルートを作成します。`.`の前のファイル名が別のルートファイル名と一致する場合、自動的に一致する親の子供ルートになります。次のルートを検討してください。

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

`app/routes/concerts.`で始まるすべてのルートは、`app/routes/concerts.tsx`の子供ルートになり、親ルートの[outlet_component][outlet_component]内でレンダリングされます。

| URL                        | 一致するルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

通常、ネストされたルートを追加するときは、ユーザーが親URLに直接アクセスしたときに親のアウトレット内で何かをレンダリングするように、インデックスルートを追加する必要があります。

たとえば、URLが`/concerts/salt-lake-city`の場合、UI階層は次のようになります。

```tsx
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

## レイアウトのネストなしのネストされたURL

URLをネストさせたいが、自動レイアウトのネストは不要な場合があります。親セグメントに末尾のアンダースコアを付けると、ネストをオプトアウトできます。

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

| URL                        | 一致するルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts/mine`           | `app/routes/concerts_.mine.tsx`    | `app/root.tsx`            |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

`/concerts/mine`は`app/routes/concerts.tsx`とネストされなくなりましたが、`app/root.tsx`とネストされることに注意してください。`trailing_`アンダースコアはパスセグメントを作成しますが、レイアウトのネストは作成しません。

`trailing_`アンダースコアは、親の署名の末尾にある長いビットであり、遺言からあなたを削除し、レイアウトのネストから続くセグメントを削除すると考えてください。

## ネストされたURLなしのネストされたレイアウト

これらを<a name="pathless-routes"><b>パスレスルート</b></a>と呼びます。

URLにパスセグメントを追加せずに、ルートのグループとレイアウトを共有したい場合があります。一般的な例は、公開ページやログインしたアプリのエクスペリエンスとは異なるヘッダー/フッターを持つ認証ルートのセットです。これは、`_leading`アンダースコアを使用して行うことができます。

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

| URL                        | 一致するルート                   | レイアウト                    |
| -------------------------- | ------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`         | `app/root.tsx`            |
| `/login`                   | `app/routes/_auth.login.tsx`    | `app/routes/_auth.tsx`    |
| `/register`                | `app/routes/_auth.register.tsx` | `app/routes/_auth.tsx`    |
| `/concerts`                | `app/routes/concerts.tsx`       | `app/root.tsx`            |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx` | `app/routes/concerts.tsx` |

`_leading`アンダースコアは、ファイル名の上に引き上げる毛布であり、URLからファイル名を隠すと考えてください。

## オプションのセグメント

ルートセグメントを括弧で囲むと、セグメントがオプションになります。

```text lines=[3-5]
 app/
├── routes/
│   ├── ($lang)._index.tsx
│   ├── ($lang).$productId.tsx
│   └── ($lang).categories.tsx
└── root.tsx
```

| URL                        | 一致するルート                       |
| -------------------------- | ----------------------------------- |
| `/`                        | `app/routes/($lang)._index.tsx`     |
| `/categories`              | `app/routes/($lang).categories.tsx` |
| `/en/categories`           | `app/routes/($lang).categories.tsx` |
| `/fr/categories`           | `app/routes/($lang).categories.tsx` |
| `/american-flag-speedo`    | `app/routes/($lang)._index.tsx`     |
| `/en/american-flag-speedo` | `app/routes/($lang).$productId.tsx` |
| `/fr/american-flag-speedo` | `app/routes/($lang).$productId.tsx` |

`/american-flag-speedo`が`($lang).$productId.tsx`ではなく、`($lang)._index.tsx`ルートに一致するのはなぜだろうと思われるかもしれません。これは、オプションの動的パラメータセグメントの後に別の動的パラメータが続く場合、Remixは`/american-flag-speedo`のような単一セグメントのURLが`/:lang` `/:productId`に一致する必要があるかどうかを確実に判断できないためです。オプションのセグメントは積極的に一致するため、`/:lang`に一致します。このタイプのセットアップがある場合は、`($lang)._index.tsx`ローダーで`params.lang`を確認し、`params.lang`が有効な言語コードでない場合は、現在の/デフォルトの言語の`/:lang/american-flag-speedo`にリダイレクトすることをお勧めします。

## スプラットルート

[動的セグメント][dynamic_segments]は単一のパスセグメント（URL内の2つの`/`の間のもの）に一致しますが、スプラットルートはスラッシュを含むURLの残りの部分に一致します。

```text lines=[4,6]
 app/
├── routes/
│   ├── _index.tsx
│   ├── $.tsx
│   ├── about.tsx
│   └── files.$.tsx
└── root.tsx
```

| URL                                          | 一致するルート            |
| -------------------------------------------- | ------------------------ |
| `/`                                          | `app/routes/_index.tsx`  |
| `/about`                                     | `app/routes/about.tsx`   |
| `/beef/and/cheese`                           | `app/routes/$.tsx`       |
| `/files`                                     | `app/routes/files.$.tsx` |
| `/files/talks/remix-conf_old.pdf`            | `app/routes/files.$.tsx` |
| `/files/talks/remix-conf_final.pdf`          | `app/routes/files.$.tsx` |
| `/files/talks/remix-conf-FINAL-MAY_2022.pdf` | `app/routes/files.$.tsx` |

動的ルートパラメータと同様に、スプラットルートの`params`で、`"*"`キーを使用して一致したパスの値にアクセスできます。

```tsx filename=app/routes/files.$.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const filePath = params["*"];
  return fake.getFileInfo(filePath);
}
```

## 特殊文字のエスケープ

これらのルート規約に使用するRemixの特殊文字の1つを実際にURLの一部にしたい場合は、`[]`文字で規約をエスケープできます。

| ファイル名                            | URL                 |
| ----------------------------------- | ------------------- |
| `app/routes/sitemap[.]xml.tsx`      | `/sitemap.xml`      |
| `app/routes/[sitemap.xml].tsx`      | `/sitemap.xml`      |
| `app/routes/weird-url.[_index].tsx` | `/weird-url/_index` |
| `app/routes/dolla-bills-[$].tsx`    | `/dolla-bills-$`    |
| `app/routes/[[so-weird]].tsx`       | `/[so-weird]`       |

## 組織のためのフォルダ

ルートは、ルートモジュールを定義する`route.tsx`ファイルを含むフォルダにすることもできます。フォルダ内の残りのファイルはルートになりません。これにより、他のフォルダで機能名を繰り返すのではなく、コードをそれを使用するルートの近くに整理できます。

<docs-info>フォルダ内のファイルはルートパスには意味がなく、ルートパスはフォルダ名によって完全に定義されます</docs-info>

次のルートを検討してください。

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

一部またはすべてを、独自の`route`モジュールを内部に保持するフォルダにすることができます。

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

ルートモジュールをフォルダに変換すると、ルートモジュールは`folder/route.tsx`になり、フォルダ内の他のすべてのモジュールはルートにならないことに注意してください。例：

```
# これらは同じルートです。
app/routes/app.tsx
app/routes/app/route.tsx

# これらも同様です。
app/routes/app._index.tsx
app/routes/app._index/route.tsx
```

## スケーリング

スケーリングに関する一般的な推奨事項は、すべてのルートをフォルダにし、そのルートでのみ使用されるモジュールをフォルダに入れ、共有モジュールをルートフォルダの外の別の場所に配置することです。これにはいくつかの利点があります。

- 共有モジュールを簡単に識別できるため、変更するときは慎重に行う
- 「ファイル整理の疲労」を引き起こしたり、アプリの他の部分を散らかしたりすることなく、特定のルートのモジュールを簡単に整理およびリファクタリングできる

[loader]: ../route/loader
[action]: ../route/action
[outlet_component]: ../components/outlet
[routing_guide]: ../discussion/routes
[root_route]: #root-route
[index_route]: ../discussion/routes#index-routes
[nested_routing]: ../discussion/routes#what-is-nested-routing
[nested_routes]: #nested-routes
[routes_config]: ./vite-config#routes
[ignoredroutefiles_config]: ./vite-config#ignoredroutefiles
[dot_delimiters]: #dot-delimiters
[dynamic_segments]: #dynamic-segments
[an_awesome_visualization]: https://interactive-remix-routing-v2.netlify.app/
[flat_routes]: https://github.com/kiliman/remix-flat-routes
[custom_routes]: https://github.com/jacobparis-insiders/remix-custom-routes
[json_routes]: https://github.com/brophdawg11/remix-json-routes
[manual-route-configuration]: ../discussion/routes#manual-route-configuration

