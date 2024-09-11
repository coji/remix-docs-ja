---
title: ルートファイルの命名
---

# ルートファイルの命名

[「routes」プラグインオプション][routes_config] を通じてルートを構成できますが、ほとんどのルートはこのファイルシステム規則で作成されます。ファイルを追加すれば、ルートが作成されます。

.js、.jsx、.ts、.tsx のいずれかのファイル拡張子を使用できます。重複を避けるため、例では .tsx を使用します。

<docs-info>[ファイルシステム内のルートがアプリの URL にどのようにマップされるか、その素晴らしい視覚化][an_awesome_visualization] を Dilum Sanjaya が作成しました。この規則を理解するのに役立つかもしれません。</docs-info>

## 免責事項

Remix の規則について詳しく説明する前に、ファイルベースのルーティングは**非常に**主観的な考え方であることを指摘しておきます。「フラット」なルートの考え方に賛成する人もいれば、反対する人もいます。一部の人は、ルートをフォルダにネストする方が好みです。ファイルベースのルーティングを嫌う人もいれば、JSON を通じてルートを構成したいと考える人もいます。React Router の SPA で行ったように、JSX を通じてルートを構成したいと考える人もいるでしょう。

重要なのは、私たちはこれを認識しており、Remix は当初から [`routes`][routes_config] / [`ignoredRouteFiles`][ignoredroutefiles_config] を通じてオプトアウトする方法を提供し、[ルートを手動で構成][manual-route-configuration] することができます。しかし、人々が迅速かつ簡単に開始できるように、_何らかの_ デフォルトが必要です。そして、以下に示すフラットルート規則ドキュメントは、小規模から中規模のアプリに適した非常に良いデフォルトであると考えています。

数百または数千のルートを持つ大規模なアプリケーションでは、どのような規則を使用しても、必ずある程度の混乱が生じます。`routes` 設定を使用することで、アプリケーション/チームにとって最適な規則を _正確に_ 構築できるというのが、その考え方です。Remix が誰にとっても満足のいくデフォルト規則を持つことは、文字通り不可能です。私たちは、比較的わかりやすいデフォルトを提供し、コミュニティがさまざまな規則を構築できるようにする方が良いと考えています。

そのため、Remix のデフォルト規則の詳細に入る前に、デフォルトが気に入らない場合は、コミュニティが提供する代替案を紹介します。

- [`remix-flat-routes`][flat_routes] - Remix のデフォルトは、このパッケージの簡易版です。著者はこのパッケージを継続的に進化させているため、「フラットルート」の考え方が気に入っているものの、より多くの機能 (ファイルとフォルダのハイブリッドアプローチを含む) が必要であれば、ぜひ検討してください。
- [`remix-custom-routes`][custom_routes] - さらにカスタマイズが必要な場合は、このパッケージを使用すると、ルートとして扱うファイルのタイプを定義できます。これにより、単純なフラット/ネストの概念を超えて、たとえば「拡張子が .route.tsx のファイルはすべてルートである」のようなことを行うことができます。
- [`remix-json-routes`][json_routes] - 単に設定ファイルを使用してルートを指定したい場合は、これがおすすめです。フラット/ネストの概念を完全に無視し、ルートを含む JSON オブジェクトを Remix に提供するだけです。JSX のオプションも用意されています。

## ルートルート

```text lines=[3]
app/
├── routes/
└── root.tsx
```

`app/root.tsx` のファイルは、ルートレイアウトまたは「ルートルート」です (これらの単語を同じように発音する人には申し訳ありません！)。他のすべてのルートと同じように動作するため、[`loader`][loader]、[`action`][action] などをエクスポートできます。

ルートルートは通常、このようなものになります。これは、アプリ全体のルートレイアウトとして機能し、他のすべてのルートは [`<Outlet />`][outlet_component] 内でレンダリングされます。

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

`app/routes` ディレクトリにあるすべての JavaScript または TypeScript ファイルは、アプリケーションのルートになります。ファイル名は、ルートの URL パス名にマップされます。ただし、`_index.tsx` は [ルートルート][root_route] の [インデックスルート][index_route] です。

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

これらのルートは、[ネストされたルーティング][nested_routing] により、`app/root.tsx` のアウトレットでレンダリングされます。

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

ドット区切り文字は、ネストも作成します。詳細については、[ネストセクション][nested_routes] を参照してください。

## 動的セグメント

通常、URL は静的ではなく、データに基づいています。動的セグメントを使用すると、URL のセグメントを一致させ、その値をコードで使用できます。`$` プレフィックスを使用して作成します。

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

Remix は URL から値を解析し、さまざまな API に渡します。これらの値を「URL パラメータ」と呼びます。URL パラメータにアクセスする最も便利な場所は、[loader][loader] と [action][action] です。

```tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

`params` オブジェクトのプロパティ名は、ファイル名に直接マップされます。`$city.tsx` は `params.city` になります。

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

ネストされたルーティングとは、URL のセグメントをコンポーネント階層とデータに関連付ける一般的な考え方です。詳細については、[ルーティングガイド][nested_routing] を参照してください。

[ドット区切り文字][dot_delimiters] を使用して、ネストされたルートを作成します。`.` の前のファイル名が別のルートファイル名と一致する場合、自動的に一致する親ルートの子ルートになります。次のルートについて考えてみましょう。

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

`app/routes/concerts.` で始まるすべてのルートは、`app/routes/concerts.tsx` の子ルートになり、親ルートの [outlet_component][outlet_component] 内でレンダリングされます。

| URL                        | マッチしたルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

ユーザーが親 URL を直接訪問すると、親のアウトレット内に何かがレンダリングされるように、通常はネストされたルートを追加するときにインデックスルートを追加する必要があります。

たとえば、URL が `/concerts/salt-lake-city` の場合、UI 階層は次のようになります。

```tsx
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

## レイアウトのネストなしで URL をネストする

URL をネストしたい場合でも、レイアウトのネストは不要です。親セグメントに末尾の下線を追加すると、ネストをオプトアウトできます。

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

`/concerts/mine` は、`app/routes/concerts.tsx` とはネストされなくなりましたが、`app/root.tsx` とネストされています。`trailing_` 下線はパスセグメントを作成しますが、レイアウトのネストは作成しません。

`trailing_` 下線は、親の署名の一番下にある長い部分と考え、あなたを遺言から外して、続くセグメントをレイアウトのネストから削除します。

## ネストされたレイアウトを URL のネストなしで使用する

これらのルートを <a name="pathless-routes"><b>パスレスルート</b></a> と呼びます。

URL にパスセグメントを追加せずに、レイアウトをルートのグループで共有したい場合があります。一般的な例としては、公開ページとは異なるヘッダー/フッターを持つ認証ルートセットや、ログインしたアプリのエクスペリエンスがあります。`_leading` 下線を使用すると、これを実現できます。

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
| `/concerts`                | `app/routes/concerts.tsx`       | `app/root.tsx`            |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx` | `app/routes/concerts.tsx` |

`_leading` 下線は、ファイル名の上に引く毛布のように、ファイル名を URL から隠します。

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

`/american-flag-speedo` が `($lang).$productId.tsx` ではなく、`($lang)._index.tsx` ルートにマッチするのはなぜでしょうか。これは、オプションの動的パラメータセグメントの後に別の動的パラメータがある場合、Remix は `/american-flag-speedo` などの単一セグメントの URL が `/:lang` `/:productId` のどちらにマッチするのかを確実に判断できないためです。オプションのセグメントは、熱心にマッチするため、`/:lang` にマッチします。このタイプのセットアップの場合、`($lang)._index.tsx` ローダーで `params.lang` を確認し、`params.lang` が有効な言語コードでない場合は、現在の/デフォルトの言語で `/:lang/american-flag-speedo` にリダイレクトすることをお勧めします。

## スプラットルート

[動的セグメント][dynamic_segments] は、URL の 2 つの `/` の間にある部分 (1 つのパスセグメント) にマッチしますが、スプラットルートは、スラッシュを含む URL の残りの部分にマッチします。

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

動的ルートパラメータと同様に、`"*"` キーを使用して、スプラットルートの `params` 上でマッチしたパスの値にアクセスできます。

```tsx filename=app/routes/files.$.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const filePath = params["*"];
  return fake.getFileInfo(filePath);
}
```

## 特殊文字のエスケープ

これらのルート規則で使用される特殊文字を URL の一部に含めたい場合は、`[]` 文字を使用して規則をエスケープできます。

| ファイル名                            | URL                 |
| ----------------------------------- | ------------------- |
| `app/routes/sitemap[.]xml.tsx`      | `/sitemap.xml`      |
| `app/routes/[sitemap.xml].tsx`      | `/sitemap.xml`      |
| `app/routes/weird-url.[_index].tsx` | `/weird-url/_index` |
| `app/routes/dolla-bills-[$].tsx`    | `/dolla-bills-$`    |
| `app/routes/[[so-weird]].tsx`       | `/[so-weird]`       |

## フォルダを使用した整理

ルートは、内部に `route.tsx` ファイルを持つフォルダにすることもできます。このファイルは、ルートモジュールを定義します。フォルダ内の残りのファイルは、ルートになりません。これにより、コードを、他のフォルダに機能名を使用する代わりに、使用するルートに近い場所に整理できます。

<docs-info>フォルダ内のファイルは、ルートパスに意味を持ちません。ルートパスは、フォルダ名で完全に定義されます。</docs-info>

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

これらのうちの一部またはすべてを、内部に独自の `route` モジュールを持つフォルダにすることができます。

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

ルートモジュールをフォルダに変換すると、ルートモジュールは `folder/route.tsx` になり、フォルダ内の他のモジュールはルートになりません。たとえば、

```
# これらは同じルートです。
app/routes/app.tsx
app/routes/app/route.tsx

# これらも同様です
app/routes/app._index.tsx
app/routes/app._index/route.tsx
```

## スケーラビリティ

スケーラビリティに関して、一般的には、すべてのルートをフォルダにし、そのルートでしか使用されないモジュールをフォルダに入れ、共有モジュールをルートフォルダ以外に置くことをお勧めします。これには、いくつかの利点があります。

- 共有モジュールを簡単に特定できるため、変更する際には慎重に進めることができます。
- 特定のルートのモジュールを簡単に整理してリファクタリングできるため、他の部分のアプリがごちゃごちゃになる「ファイル整理の疲れ」を防ぐことができます。

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
[manual-route-configuration]: ../discussion/routes#手動でルートを構成する



