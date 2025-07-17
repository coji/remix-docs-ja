---
title: ファイルルートの規約
---

# ファイルルートの規約

`@react-router/fs-routes` パッケージは、ファイル規約に基づいたルート設定を可能にします。

## セットアップ

まず、`@react-router/fs-routes` パッケージをインストールします。

```shellscript nonumber
npm i @react-router/fs-routes
```

次に、`app/routes.ts` ファイルでルート設定を提供するために使用します。

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes() satisfies RouteConfig;
```

`app/routes` ディレクトリ内のモジュールは、デフォルトでアプリケーションのルートになります。
`ignoredRouteFiles` オプションを使用すると、ルートとして含めないファイルを指定できます。

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes({
  ignoredRouteFiles: ["home.tsx"],
}) satisfies RouteConfig;
```

これはデフォルトで `app/routes` ディレクトリ内のルートを探しますが、これはアプリディレクトリからの相対パスである `rootDirectory` オプションで設定できます。

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes({
  rootDirectory: "file-routes",
}) satisfies RouteConfig;
```

このガイドの残りの部分では、デフォルトの `app/routes` ディレクトリを使用していると仮定します。

## 基本的なルート

ファイル名は、[ルートルート][root_route]の[インデックスルート][index_route]である `_index.tsx` を除き、ルートの URL パス名にマッピングされます。`.js`、`.jsx`、`.ts`、または `.tsx` のファイル拡張子を使用できます。

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

これらのルートは、[ネストされたルーティング][nested_routing]のため、`app/root.tsx` のアウトレットでレンダリングされることに注意してください。

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

| URL                        | マッチするルート                            |
| -------------------------- | ---------------------------------------- |
| `/`                        | `app/routes/_index.tsx`                  |
| `/about`                   | `app/routes/about.tsx`                   |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx`       |
| `/concerts/salt-lake-city` | `app/routes/concerts.salt-lake-city.tsx` |
| `/concerts/san-diego`      | `app/routes/concerts.san-diego.tsx`      |

ドット区切り文字はネストも作成します。詳細については、[ネストセクション][nested_routes]を参照してください。

## 動的セグメント

通常、URL は静的ではなくデータ駆動型です。動的セグメントを使用すると、URL のセグメントを照合し、その値をコードで使用できます。これらは `$` プレフィックスで作成します。

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

値は URL から解析され、さまざまな API に渡されます。これらの値を「URL パラメータ」と呼びます。URL パラメータにアクセスする最も便利な場所は、[ローダー]と[アクション]です。

```tsx
export async function loader({ params }) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

`params` オブジェクトのプロパティ名は、ファイル名に直接マッピングされていることに注意してください。`$city.tsx` は `params.city` になります。

ルートには、`concerts.$city.$date` のように複数の動的セグメントを含めることができ、両方とも名前で params オブジェクトにアクセスできます。

```tsx
export async function loader({ params }) {
  return fake.db.getConcerts({
    date: params.date,
    city: params.city,
  });
}
```

詳細については、[ルーティングガイド][routing_guide]を参照してください。

## ネストされたルート

ネストされたルーティングは、URL のセグメントをコンポーネント階層とデータに結合するという一般的な考え方です。詳細については、[ルーティングガイド][nested_routing]を参照してください。

[ドット区切り文字][dot_delimiters]を使用してネストされたルートを作成します。`.` の前のファイル名が別のルートファイル名と一致する場合、自動的に一致する親の子供ルートになります。これらのルートを検討してください。

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

`app/routes/concerts.` で始まるすべてのルートは、`app/routes/concerts.tsx` の子ルートになり、[親ルートのアウトレット][nested_routing]内でレンダリングされます。

| URL                        | マッチするルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

通常、ユーザーが親 URL に直接アクセスしたときに親のアウトレット内で何かをレンダリングするように、ネストされたルートを追加するときにインデックスルートを追加することに注意してください。

たとえば、URL が `/concerts/salt-lake-city` の場合、UI 階層は次のようになります。

```tsx
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

## レイアウトのネストなしのネストされた URL

URL をネストさせたいが、自動レイアウトのネストは不要な場合があります。親セグメントの末尾にアンダースコアを付けることで、ネストをオプトアウトできます。

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

`/concerts/mine` は `app/routes/concerts.tsx` とネストされなくなり、`app/root.tsx` とネストされることに注意してください。`trailing_` アンダースコアはパスセグメントを作成しますが、レイアウトのネストは作成しません。

`trailing_` アンダースコアは、親の署名の末尾にある長いビットとして考え、遺言からあなたを書き出し、レイアウトのネストから続くセグメントを削除します。

## ネストされた URL なしのネストされたレイアウト

これらを <a name="pathless-routes"><b>パスレスルート</b></a> と呼びます。

URL にパスセグメントを追加せずに、ルートのグループとレイアウトを共有したい場合があります。一般的な例は、公開ページやログインしたアプリのエクスペリエンスとは異なるヘッダー/フッターを持つ認証ルートのセットです。これは、`_leading` アンダースコアで行うことができます。

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

`_leading` アンダースコアは、ファイル名の上に引き上げる毛布として考え、URL からファイル名を隠します。

## オプションのセグメント

ルートセグメントを括弧で囲むと、セグメントはオプションになります。

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

`/american-flag-speedo` が `($lang).$productId.tsx` ではなく `($lang)._index.tsx` ルートに一致するのはなぜだろうと思われるかもしれません。これは、オプションの動的パラメータセグメントの後に別の動的パラメータが続く場合、`/american-flag-speedo` のような単一セグメントの URL が `/:lang` `/:productId` に一致する必要があるかどうかを確実に判断できないためです。オプションのセグメントは積極的に一致するため、`/:lang` に一致します。このタイプのセットアップがある場合は、`($lang)._index.tsx` ローダーで `params.lang` を確認し、`params.lang` が有効な言語コードでない場合は、現在の/デフォルトの言語の `/:lang/american-flag-speedo` にリダイレクトすることをお勧めします。

## スプラットルート

[動的セグメント][dynamic_segments]が単一のパスセグメント（URL の 2 つの `/` の間のもの）に一致するのに対し、スプラットルートはスラッシュを含む URL の残りの部分に一致します。

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

動的ルートパラメータと同様に、スプラットルートの `params` で `"*"` キーを使用して、一致したパスの値にアクセスできます。

```tsx filename=app/routes/files.$.tsx
export async function loader({ params }) {
  const filePath = params["*"];
  return fake.getFileInfo(filePath);
}
```

## キャッチオールルート

他の定義されたルートに一致しないリクエスト（404ページなど）に一致するルートを作成するには、ルートディレクトリ内に `$.tsx` という名前のファイルを作成します。

| URL                            | マッチするルート            |
| ------------------------------ | ------------------------ |
| `/`                            | `app/routes/_index.tsx`  |
| `/about`                       | `app/routes/about.tsx`   |
| `/any-invalid-path-will-match` | `app/routes/$.tsx`       |

デフォルトでは、一致したルートは200応答を返します。そのため、キャッチオールルートを404を返すように変更してください。

```tsx filename=app/routes/$.tsx
export async function loader() {
  return data({}, 404);
}
```

## 特殊文字のエスケープ

これらのルート規約に使用される特殊文字の 1 つを実際に URL の一部にしたい場合は、`[]` 文字で規約をエスケープできます。これは、URL に拡張子を含む[リソースルート][resource_routes]に特に役立ちます。

| ファイル名                            | URL                 |
| ----------------------------------- | ------------------- |
| `app/routes/sitemap[.]xml.tsx`      | `/sitemap.xml`      |
| `app/routes/[sitemap.xml].tsx`      | `/sitemap.xml`      |
| `app/routes/weird-url.[_index].tsx` | `/weird-url/_index` |
| `app/routes/dolla-bills-[$].tsx`    | `/dolla-bills-$`    |
| `app/routes/[[so-weird]].tsx`       | `/[so-weird]`       |
| `app/routes/reports.$id[.pdf].ts`   | `/reports/123.pdf`  |

## 組織のためのフォルダ

ルートは、ルートモジュールを定義する `route.tsx` ファイルを含むフォルダにすることもできます。フォルダ内の残りのファイルはルートになりません。これにより、他のフォルダで機能名を繰り返すのではなく、コードをそれらを使用するルートの近くに整理できます。

フォルダ内のファイルはルートパスには意味がなく、ルートパスはフォルダ名によって完全に定義されます。

これらのルートを検討してください。

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

それらの一部またはすべては、内部に独自の `route` モジュールを保持するフォルダにすることができます。

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

ルートモジュールをフォルダに変換すると、ルートモジュールは `folder/route.tsx` になり、フォルダ内の他のすべてのモジュールはルートにならないことに注意してください。例：

```
# これらは同じルートです。
app/routes/app.tsx
app/routes/app/route.tsx

# これらも同様です。
app/routes/app._index.tsx
app/routes/app._index/route.tsx
```

[route-config-file]: ../start/framework/routing#configuring-routes
[loaders]: ../start/framework/data-loading
[actions]: ../start/framework/actions
[routing_guide]: ../start/framework/routing
[root_route]: ../start/framework/route-module
[index_route]: ../start/framework/routing#index-routes
[nested_routing]: ../start/framework/routing#nested-routes
[nested_routes]: #nested-routes
[dot_delimiters]: #dot-delimiters
[dynamic_segments]: #dynamic-segments
[resource_routes]: ../how-to/resource-routes