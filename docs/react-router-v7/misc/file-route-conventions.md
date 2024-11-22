---
title: ファイルルートの規約
---

# ファイルルートの規約

`@react-router/fs-routes` パッケージを使用すると、ファイルベースのルート構成を有効にすることができます。

## セットアップ

最初に `@react-router/fs-routes` パッケージをインストールします。

```shellscript nonumber
npm i @react-router/fs-routes
```

次に、`app/routes.ts` ファイルでルート構成を提供します。

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export const routes: RouteConfig = flatRoutes();
```

デフォルトでは `app/routes` ディレクトリ内のルートが検索されますが、これはアプリディレクトリに対する相対パスである `rootDirectory` オプションで構成できます。

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export const routes: RouteConfig = flatRoutes({
  rootDirectory: "file-routes",
});
```

このガイドの残りの部分では、デフォルトの `app/routes` ディレクトリを使用していることを前提とします。

## 基本的なルート

`app/routes` ディレクトリ内のモジュールはすべて、アプリケーションのルートになります。ファイル名はルートの URL パス名に対応します。ただし、`_index.tsx` は [ルートルート][root_route] の [インデックスルート][index_route] です。`.js`、`.jsx`、`.ts`、`.tsx` ファイル拡張子を使用できます。

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

これらのルートは、[ネストされたルーティング][nested_routing] により、`app/root.tsx` のアウトレットにレンダリングされます。

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

ドットデリミタはネストも作成します。詳細については、[ネストセクション][nested_routes] を参照してください。

## 動的セグメント

通常、URL は静的ではなく、データドリブンです。動的セグメントを使用すると、URL のセグメントにマッチし、その値をコードで使用できます。これらは `$` プレフィックスで作成します。

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

値は URL から解析され、さまざまな API に渡されます。これらの値を「URL パラメータ」と呼びます。URL パラメータにアクセスする最も便利な場所は、[ローダー][loaders] と [アクション][actions] です。

```tsx
export async function serverLoader({ params }) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

`params` オブジェクトのプロパティ名は、ファイル名に直接マッピングされます。`$city.tsx` は `params.city` になります。

ルートには、`concerts.$city.$date` のように、複数の動的セグメントを含めることができます。どちらも名前で `params` オブジェクトにアクセスできます。

```tsx
export async function serverLoader({ params }) {
  return fake.db.getConcerts({
    date: params.date,
    city: params.city,
  });
}
```

詳細については、[ルーティングガイド][routing_guide] を参照してください。

## ネストされたルート

ネストされたルーティングとは、一般的に、URL のセグメントをコンポーネントの階層とデータに関連付ける考え方です。詳細については、[ルーティングガイド][nested_routing] を参照してください。

[ドットデリミタ][dot_delimiters] を使用してネストされたルートを作成します。`.` の前のファイル名が別のルートファイル名と一致する場合、自動的に一致する親ルートの子ルートになります。これらのルートを考えてみてください。

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

`app/routes/concerts.` で始まるすべてのルートは、`app/routes/concerts.tsx` の子ルートになり、[親ルートのアウトレット][nested_routing] 内にレンダリングされます。

| URL                        | マッチするルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

ユーザーが親 URL を直接訪問したときに、親のアウトレット内に何かがレンダリングされるように、通常はネストされたルートを追加するときにインデックスルートを追加する必要があります。

たとえば、URL が `/concerts/salt-lake-city` の場合、UI の階層は次のようになります。

```tsx
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

## レイアウトのネストなしでのネストされた URL

URL をネストする必要がある場合がありますが、自動レイアウトのネストは不要です。親セグメントに末尾のアンダースコアを付けて、ネストをオプトアウトできます。

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

`/concerts/mine` は、`app/routes/concerts.tsx` とはネストされず、`app/root.tsx` とネストされていることに注意してください。`trailing_` アンダースコアはパスセグメントを作成しますが、レイアウトのネストは作成しません。

`trailing_` アンダースコアは、親の署名の末尾にある長いビットのように考えてください。これは、あなたを遺言から除外するものであり、それに続くセグメントをレイアウトのネストから削除します。

## ネストされたレイアウトをネストされた URL なしで

これらを <a name="pathless-routes"><b>パスのないルート</b></a> と呼びます

URL にパスセグメントを追加せずに、ルートのグループとレイアウトを共有したい場合があります。一般的な例としては、パブリックページとは異なるヘッダー/フッターを持つ認証ルート、またはログイン済みアプリケーションのエクスペリエンスなどがあります。これは、`_leading` アンダースコアを使用することで実現できます。

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

`_leading` アンダースコアは、ファイル名の上に引く毛布のように考えてください。ファイル名を URL から隠しています。

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

`/american-flag-speedo` が `($lang).$productId.tsx` ではなく `($lang)._index.tsx` ルートにマッチする理由を疑問に思われるかもしれません。これは、オプションの動的パラメータセグメントの後に別の動的パラメータがある場合、`/american-flag-speedo` のような単一セグメントの URL が `/:lang` `/:productId` のどちらにマッチするのか確実に判断できないためです。オプションのセグメントは熱心にマッチするため、`/:lang` にマッチします。このような設定がある場合は、`($lang)._index.tsx` ローダーで `params.lang` を確認し、`params.lang` が有効な言語コードでない場合は現在の/デフォルトの言語の `/:lang/american-flag-speedo` にリダイレクトすることをお勧めします。

## スプラットルート

[動的セグメント][dynamic_segments] は単一のパスセグメント（URL 内の 2 つの `/` の間の部分）にマッチしますが、スプラットルートはスラッシュを含む URL の残りの部分にマッチします。

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

動的ルートパラメータと同様に、`"*"` キーを使用して、スプラットルートの `params` でマッチしたパスの値にアクセスできます。

```tsx filename=app/routes/files.$.tsx
export async function serverLoader({ params }) {
  const filePath = params["*"];
  return fake.getFileInfo(filePath);
}
```

## 特殊文字のエスケープ

これらのルートの規約で使用される特殊文字のいずれかを URL の一部に含めたい場合は、`[]` 文字を使用して規約をエスケープできます。これは、URL に拡張子が含まれている [リソースルート][resource_routes] に特に役立ちます。

| ファイル名                            | URL                 |
| ----------------------------------- | ------------------- |
| `app/routes/sitemap[.]xml.tsx`      | `/sitemap.xml`      |
| `app/routes/[sitemap.xml].tsx`      | `/sitemap.xml`      |
| `app/routes/weird-url.[_index].tsx` | `/weird-url/_index` |
| `app/routes/dolla-bills-[$].tsx`    | `/dolla-bills-$`    |
| `app/routes/[[so-weird]].tsx`       | `/[so-weird]`       |
| `app/routes/reports.$id[.pdf].ts    | `/reports/123.pdf   |
| `app/routes/reports.$id[.].ts       | `/reports/123.pdf   |

## 整理のためのフォルダ

ルートは、フォルダ内に `route.tsx` ファイルがある場合、フォルダになることもできます。このファイルは、ルートモジュールを定義します。フォルダ内の残りのファイルはルートにはなりません。これにより、コードを別のフォルダで機能名を繰り返すのではなく、コードをルートを使用するコードに近づけて整理することができます。

<docs-info>フォルダ内のファイルは、ルートパスに対して意味を持ちません。ルートパスはフォルダ名で完全に定義されます。</docs-info>

これらのルートを考えてみてください。

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

一部またはすべてのルートは、独自の `route` モジュールを含むフォルダになることができます。

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

ルートモジュールをフォルダに変換すると、ルートモジュールは `folder/route.tsx` になり、フォルダ内の他のモジュールはルートにはならないことに注意してください。たとえば、次のとおりです。

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
[resource_routes]: ../misc/resource-routes



