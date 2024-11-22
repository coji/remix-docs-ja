---
title: ファイルルートの規約
---

# ファイルルートの規約

`@react-router/fs-routes`パッケージは、ファイル規約に基づいたルート設定を可能にします。

## 設定方法

まず、`@react-router/fs-routes`パッケージをインストールします。

```shellscript nonumber
npm i @react-router/fs-routes
```

次に、`app/routes.ts`ファイルでルート設定を提供するために使用します。

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes() satisfies RouteConfig;
```

これはデフォルトで`app/routes`ディレクトリ内のルートを探しますが、アプリディレクトリを基準とした`rootDirectory`オプションで設定できます。

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes({
  rootDirectory: "file-routes",
}) satisfies RouteConfig;
```

このガイドの残りの部分では、デフォルトの`app/routes`ディレクトリを使用していることを前提としています。

## 基本的なルート

`app/routes`ディレクトリ内のモジュールは、アプリケーションのルートになります。ファイル名はルートのURLパス名に対応しますが、`_index.tsx`は[ルートルート][root_route]の[インデックスルート][index_route]です。`.js`、`.jsx`、`.ts`、`.tsx`のファイル拡張子を使用できます。

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

これらのルートは、[ネストされたルーティング][nested_routing]のため、`app/root.tsx`のアウトレットでレンダリングされます。


## ドット区切り記号

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

ドット区切り記号はネストも作成します。詳細は[ネストセクション][nested_routes]を参照してください。

## 動的セグメント

通常、URLは静的ではなく、データ駆動型です。動的セグメントを使用すると、URLのセグメントに一致させ、その値をコードで使用できます。`$`プレフィックスを使用して作成します。

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

値はURLから解析され、さまざまなAPIに渡されます。これらの値を「URLパラメータ」と呼びます。URLパラメータにアクセスする最も便利な場所は、[ローダー][loaders]と[アクション][actions]です。

```tsx
export async function serverLoader({ params }) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

`params`オブジェクトのプロパティ名は、ファイル名に直接マップされていることに注意してください。`$city.tsx`は`params.city`になります。

ルートには、`concerts.$city.$date`のように複数の動的セグメントを含めることができ、どちらも名前で`params`オブジェクトからアクセスできます。

```tsx
export async function serverLoader({ params }) {
  return fake.db.getConcerts({
    date: params.date,
    city: params.city,
  });
}
```

詳細は[ルーティングガイド][routing_guide]を参照してください。

## ネストされたルート

ネストされたルーティングとは、URLのセグメントとコンポーネント階層およびデータの結合という一般的な概念です。詳細は[ルーティングガイド][nested_routing]を参照してください。

[ドット区切り記号][dot_delimiters]を使用してネストされたルートを作成します。`.`の前にあるファイル名が別のルートファイル名と一致する場合、自動的に一致する親ルートの子ルートになります。これらのルートを考えてみましょう。

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

`app/routes/concerts.`で始まるすべてのルートは、`app/routes/concerts.tsx`の子ルートになり、[親ルートのアウトレット][nested_routing]内でレンダリングされます。

| URL                        | マッチするルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

ユーザーが親URLを直接訪問したときに親のアウトレット内で何かがレンダリングされるように、ネストされたルートを追加する場合は通常、インデックスルートを追加することをお勧めします。

たとえば、URLが`/concerts/salt-lake-city`の場合、UI階層は次のようになります。

```tsx
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

## レイアウトネストなしのネストされたURL

URLをネストしたいが、自動的なレイアウトネストは不要な場合があります。親セグメントに末尾の下線を追加することで、ネストをオプトアウトできます。

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

`/concerts/mine`はもはや`app/routes/concerts.tsx`とネストしませんが、`app/root.tsx`とネストします。`trailing_`アンダースコアはパスセグメントを作成しますが、レイアウトネストは作成しません。

`trailing_`アンダースコアを、親の署名の末尾にある長いビットと考えてください。これは、あなたを遺言から書き出し、続くセグメントをレイアウトネストから削除します。


## ネストされたURLなしのネストされたレイアウト

これらを<a name="pathless-routes"><b>パスレスルート</b></a>と呼びます。

URLにパスセグメントを追加せずに、ルートのグループとレイアウトを共有したい場合があります。一般的な例としては、パブリックページやログイン済みアプリエクスペリエンスとは異なるヘッダー/フッターを持つ認証ルートのセットがあります。これは`_leading`アンダースコアを使用して行うことができます。

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
| `/concerts`                | `app/routes/concerts.tsx`       | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx` | `app/routes/concerts.tsx` |

`_leading`アンダースコアは、ファイル名の上に引っかける毛布のように考えてください。ファイル名をURLから隠します。


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

`/american-flag-speedo`が`($lang).$productId.tsx`ではなく`($lang)._index.tsx`ルートに一致する理由を疑問に思うかもしれません。これは、オプションの動的パラメーターセグメントの後に別の動的パラメーターがある場合、`/american-flag-speedo`のような単一セグメントのURLが`/:lang` `/:productId`に一致するかどうかを確実に判断できないためです。オプションのセグメントは熱心に一致するため、`/:lang`に一致します。このような設定がある場合は、`($lang)._index.tsx`ローダーで`params.lang`を確認し、`params.lang`が有効な言語コードでない場合は現在の/デフォルトの言語の`/:lang/american-flag-speedo`にリダイレクトすることをお勧めします。


## スプラットルート

[動的セグメント][dynamic_segments]は単一のパスセグメント（URLの2つの`/`の間の部分）に一致しますが、スプラットルートはスラッシュを含むURLの残りの部分に一致します。

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
| `/files/talks/react-conf_old.pdf`            | `app/routes/files.$.tsx` |
| `/files/talks/react-conf_final.pdf`          | `app/routes/files.$.tsx` |
| `/files/talks/react-conf-FINAL-MAY_2024.pdf` | `app/routes/files.$.tsx` |

動的ルートパラメーターと同様に、`"*"`キーを使用して、スプラットルートの`params`で一致するパスの値にアクセスできます。

```tsx filename=app/routes/files.$.tsx
export async function serverLoader({ params }) {
  const filePath = params["*"];
  return fake.getFileInfo(filePath);
}
```

## 特殊文字のエスケープ

これらのルート規約で使用される特殊文字のいずれかをURLの一部にしたい場合は、`[]`文字を使用して規約をエスケープできます。これは、URLに拡張子が含まれる[リソースルート][resource_routes]に特に役立ちます。

| ファイル名                            | URL                 |
| ----------------------------------- | ------------------- |
| `app/routes/sitemap[.]xml.tsx`      | `/sitemap.xml`      |
| `app/routes/[sitemap.xml].tsx`      | `/sitemap.xml`      |
| `app/routes/weird-url.[_index].tsx` | `/weird-url/_index` |
| `app/routes/dolla-bills-[$].tsx`    | `/dolla-bills-$`    |
| `app/routes/[[so-weird]].tsx`       | `/[so-weird]`       |
| `app/routes/reports.$id[.pdf].ts    | `/reports/123.pdf   |


## 整理のためのフォルダ

ルートは、ルートモジュールを定義する`route.tsx`ファイルを含むフォルダにもできます。フォルダ内の他のファイルはルートになりません。これにより、他のフォルダで機能名を繰り返す代わりに、コードをそれらを使用するルートにより近づけて整理できます。

フォルダ内のファイルはルートパスには意味がなく、ルートパスはフォルダ名によって完全に定義されます。

これらのルートを考えてみましょう。

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

それらのいくつか、またはすべてを、独自の`route`モジュールを含むフォルダにすることができます。

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

ルートモジュールをフォルダに変換すると、ルートモジュールは`folder/route.tsx`になり、フォルダ内の他のすべてのモジュールはルートになりません。たとえば、

```
# これらは同じルートです。
app/routes/app.tsx
app/routes/app/route.tsx

# これらも同様です
app/routes/app._index.tsx
app/routes/app._index/route.tsx
```

[route-config-file]: ../start/routing#route-config-file
[loaders]: ../start/data-loading
[actions]: ../start/actions
[routing_guide]: ../start/routing
[root_route]: ../start/route-module#root-route
[index_route]: ../start/routing#index-routes
[nested_routing]: ../start/routing#nested-routes
[nested_routes]: #nested-routes
[dot_delimiters]: #dot-delimiters
[dynamic_segments]: #dynamic-segments
[resource_routes]: ../how-to/resource-routes


