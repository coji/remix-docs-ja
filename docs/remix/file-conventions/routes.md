---
title: ルートファイルの命名
---

# ルートファイルの命名

[「routes」プラグインオプション][routes_config]でルートを構成することもできますが、ほとんどのルートは、このファイルシステム規則を使用して作成されます。ファイルを追加すれば、ルートが作成されます。

`.js`、`.jsx`、`.ts`、`.tsx`のいずれかのファイル拡張子を使用できます。重複を避けるために、例では`.tsx`を使用します。

<docs-info>ディルム・サンジャヤは、[素晴らしい可視化][an_awesome_visualization]を作成しました。これは、ファイルシステム内のルートがアプリのURLにどのようにマッピングされるかを示しており、これらの規則を理解するのに役立ちます。</docs-info>

## 免責事項

Remixの規則に深く踏み込む前に、ファイルベースのルーティングは**非常に**主観的なアイデアであることを指摘しておきたいと思います。フラットなルートのアイデアを気に入っている人もいれば、嫌いでルートをフォルダ内にネストしたい人もいます。ファイルベースのルーティングを単純に嫌いで、JSONでルートを構成したい人もいます。React Router SPAで行っていたように、JSXでルートを構成したい人もいます。

要点は、私たちはこれを知っており、最初からRemixは、[`routes`][routes_config]/[`ignoredRouteFiles`][ignoredroutefiles_config]を介してオプトアウトし、[ルートを手動で構成する][manual-route-configuration]ためのファーストクラスの方法を提供してきました。しかし、人々が迅速かつ簡単に開始できるように、_何らかの_デフォルトが必要です。そして、私たちは、以下のフラットなルート規則ドキュメントは、小規模から中規模のアプリにうまくスケールする、かなり良いデフォルトだと考えています。

数百または数千ものルートを持つ大規模なアプリケーションでは、どのような規則を使用しても、_常に_多少は混沌としています。そして、`routes`構成を使用すれば、アプリケーション/チームにとって最適な規則を_正確に_構築できます。Remixに、すべての人が満足するデフォルト規則を持たせるのは、事実上不可能です。むしろ、私たちは、かなりわかりやすいデフォルトを提供し、コミュニティがさまざまな規則を構築できるようにしたいと考えています。そこから、自由に選択できます。

そこで、Remixのデフォルト規則の詳細について説明する前に、デフォルトが気に入らない場合は、確認できるコミュニティの代替規則をいくつか紹介します。

- [`remix-flat-routes`][flat_routes] - Remixのデフォルトは、基本的にこのパッケージの簡略版です。作者は、このパッケージの反復と進化を続けているため、一般的に「フラットルート」のアイデアは好きですが、もう少しパワーが欲しい場合は（ファイルとフォルダのハイブリッドアプローチを含む）、このパッケージをぜひ確認してください。
- [`remix-custom-routes`][custom_routes] - さらにカスタマイズしたい場合は、このパッケージを使用すると、どのタイプのファイルをルートとして扱うかを定義できます。これにより、単純なフラット/ネストされた概念を超えて、たとえば「`.route.tsx`という拡張子のファイルはすべてルート」などを行うことができます。
- [`remix-json-routes`][json_routes] - 構成ファイルでルートを指定したいだけなら、これが最適です。Remixにルートを含むJSONオブジェクトを提供し、フラット/ネストされた概念を完全にスキップします。JSXオプションも含まれています。

## ルートルート

```text lines=[3]
app/
├── routes/
└── root.tsx
```

`app/root.tsx`内のファイルは、ルートレイアウトまたは「ルートルート」です（これらの単語を同じように発音する人は本当に申し訳ありません！）。これは、他のすべてのルートと同じように機能するため、[`loader`][loader]、[`action`][action]などをエクスポートできます。

ルートルートは通常、このようなものです。これは、アプリ全体のルートレイアウトとして機能し、他のすべてのルートは[`<Outlet />`][outlet_component]内でレンダリングされます。

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

`app/routes`ディレクトリ内のJavaScriptまたはTypeScriptファイルはすべて、アプリケーション内のルートになります。ファイル名は、ルートのURLパス名にマッピングされます。ただし、`_index.tsx`は、[ルートルート][root_route]の[インデックスルート][index_route]です。

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

これらのルートは、[ネストされたルーティング][nested_routing]のため、`app/root.tsx`のアウトレットにレンダリングされます。

## ドットデリミタ

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

| URL                        | マッチするルート                            |
| -------------------------- | ---------------------------------------- |
| `/`                        | `app/routes/_index.tsx`                  |
| `/about`                   | `app/routes/about.tsx`                   |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx`       |
| `/concerts/salt-lake-city` | `app/routes/concerts.salt-lake-city.tsx` |
| `/concerts/san-diego`      | `app/routes/concerts.san-diego.tsx`      |

ドットデリミタは、ネストも作成します。詳細については、[ネストセクション][nested_routes]を参照してください。

## 動的セグメント

通常、URLは静的ではなく、データ駆動型です。動的セグメントを使用すると、URLのセグメントを一致させ、その値をコードで使用できます。`$`プレフィックスで作成します。

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

Remixは、URLから値を解析し、さまざまなAPIに渡します。これらの値を「URLパラメータ」と呼びます。URLパラメータにアクセスする最も便利な場所は、[loader][loader]と[action][action]です。

```tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

`params`オブジェクトのプロパティ名は、ファイル名に直接マッピングされます。`$city.tsx`は`params.city`になります。

ルートには、`concerts.$city.$date`のように、複数の動的セグメントを含めることができます。どちらも、`params`オブジェクトで名前でアクセスされます。

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

ネストされたルーティングとは、URLのセグメントとコンポーネントの階層およびデータを結びつける一般的な考え方です。詳細については、[ルーティングガイド][nested_routing]を参照してください。

[ドットデリミタ][dot_delimiters]を使用して、ネストされたルートを作成します。`.`前のファイル名が別のルートファイル名と一致する場合、自動的に一致する親ルートの子ルートになります。次のルートを考えてみてください。

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

`app/routes/concerts.`で始まるすべてのルートは、`app/routes/concerts.tsx`の子ルートになり、親ルートの[outlet_component][outlet_component]内でレンダリングされます。

| URL                        | マッチするルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

通常、ネストされたルートを追加するときは、インデックスルートを追加して、ユーザーが親URLに直接アクセスした場合に、親のアウトレット内に何かがレンダリングされるようにします。

たとえば、URLが`/concerts/salt-lake-city`の場合、UI階層は次のようになります。

```tsx
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

## レイアウトのネストなしにネストされたURL

これらを<a name="pathless-routes"><b>パスのないルート</b></a>と呼びます

URLをネストしたい場合でも、自動的なレイアウトのネストは不要な場合があります。親セグメントに下線を追加すると、ネストをオプトアウトできます。

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

`/concerts/mine`は、`app/routes/concerts.tsx`ではなく、`app/root.tsx`にネストされていないことに注意してください。`trailing_`の下線は、パスセグメントを作成しますが、レイアウトのネストは作成しません。

`trailing_`の下線を、親の署名の下部の長い部分と考えてください。あなたを遺言から除外して、それに続くセグメントをレイアウトのネストから削除しています。

## ネストされたレイアウトとネストされていないURL

これらを<a name="pathless-routes"><b>パスのないルート</b></a>と呼びます

URLにパスセグメントを追加せずに、ルートグループでレイアウトを共有したい場合があります。一般的な例としては、公開ページやログイン済みのアプリエクスペリエンスとは異なるヘッダー/フッターを持つ一連の認証ルートがあります。`_leading`の下線を使用すると、これを実現できます。

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

`_leading`の下線を、ファイル名にかぶせる毛布と考えてください。ファイル名をURLから隠しています。

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

| URL                        | マッチするルート                       |
| -------------------------- | ----------------------------------- |
| `/`                        | `app/routes/($lang)._index.tsx`     |
| `/categories`              | `app/routes/($lang).categories.tsx` |
| `/en/categories`           | `app/routes/($lang).categories.tsx` |
| `/fr/categories`           | `app/routes/($lang).categories.tsx` |
| `/american-flag-speedo`    | `app/routes/($lang)._index.tsx`     |
| `/en/american-flag-speedo` | `app/routes/($lang).$productId.tsx` |
| `/fr/american-flag-speedo` | `app/routes/($lang).$productId.tsx` |

`/american-flag-speedo`が`($lang).$productId.tsx`ではなく、`($lang)._index.tsx`ルートと一致するのはなぜでしょうか？これは、オプションの動的パラメータセグメントの後に別の動的パラメータがある場合、Remixは、`/american-flag-speedo`のような単一セグメントのURLが`/:lang` `/:productId`と一致するかどうかを確実に判断できないためです。オプションのセグメントは熱心に一致するため、`/:lang`と一致します。このような設定がある場合は、`($lang)._index.tsx`のローダーで`params.lang`を確認し、`params.lang`が有効な言語コードでない場合は、現在の/デフォルトの言語の`/:lang/american-flag-speedo`にリダイレクトすることをお勧めします。

## スプラットルート

[動的セグメント][dynamic_segments]は単一のパスセグメント（URL内の2つの`/`の間にあるもの）と一致しますが、スプラットルートはスラッシュを含むURLの残りの部分と一致します。

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

動的ルートパラメータと同様に、スプラットルートの`params`で、`"*"`キーを使用して、一致したパスの値にアクセスできます。

```tsx filename=app/routes/files.$.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const filePath = params["*"];
  return fake.getFileInfo(filePath);
}
```

## 特殊文字のエスケープ

これらのルート規則で使用される特殊文字のいずれかを、実際にURLの一部として使用したい場合は、`[]`文字を使用して規則をエスケープできます。

| ファイル名                            | URL                 |
| ----------------------------------- | ------------------- |
| `app/routes/sitemap[.]xml.tsx`      | `/sitemap.xml`      |
| `app/routes/[sitemap.xml].tsx`      | `/sitemap.xml`      |
| `app/routes/weird-url.[_index].tsx` | `/weird-url/_index` |
| `app/routes/dolla-bills-[$].tsx`    | `/dolla-bills-$`    |
| `app/routes/[[so-weird]].tsx`       | `/[so-weird]`       |

## 整理のためのフォルダ

ルートは、フォルダとして作成することもできます。その中には、ルートモジュールを定義する`route.tsx`ファイルが入っています。フォルダ内の他のファイルはルートになりません。これにより、コードを、別のフォルダで機能名を繰り返すのではなく、コードを使用するルートに近づけて整理できます。

<docs-info>フォルダ内のファイルは、ルートパスには意味を持ちません。ルートパスは、フォルダ名によって完全に定義されます</docs-info>

次のルートを考えてみてください。

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

一部またはすべてのルートを、独自の`route`モジュールを内部に含むフォルダにすることができます。

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

ルートモジュールをフォルダに変換すると、ルートモジュールは`folder/route.tsx`になり、フォルダ内の他のモジュールはルートになりません。たとえば、次のようになります。

```
# これらは同じルートです。
app/routes/app.tsx
app/routes/app/route.tsx

# これらも同様です
app/routes/app._index.tsx
app/routes/app._index/route.tsx
```

## スケール

一般的に、スケールするためには、すべてのルートをフォルダにし、そのルートでしか使用されないモジュールをフォルダ内に配置し、共有モジュールをルートフォルダの外部の別の場所に配置することをお勧めします。これには、次の利点があります。

- 共有モジュールを簡単に特定できるため、変更する際は注意深く行うことができます
- 特定のルートのモジュールを簡単に整理してリファクタリングできるため、「ファイル整理の疲労」が解消され、アプリの他の部分に不要なものを散乱させることがなくなります

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
[manual-route-configuration]: ../discussion/routes#ルートを手動で構成する



