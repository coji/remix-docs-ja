---
title: ファイルルートの規約
new: true
---

# ファイルルートの規約

[ `routes.ts` 内の構成ベースのルートの定義][route-config-file]に加えて、React Router は、一連のファイル命名規則を使用してファイルシステム内にルートを定義できる、ファイルベースのルート規約を提供します。

`.js`、`.jsx`、`.ts`、`.tsx` のいずれかのファイル拡張子を使用できます。重複を避けるために、例では `.tsx` を使用します。

## セットアップ

まず、`@react-router/fs-routes` パッケージをインストールします。

```shellscript nonumber
npm i @react-router/fs-routes
```

次に、これを使い、`app/routes.ts` ファイルでルート構成を提供します。

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export const routes: RouteConfig = flatRoutes();
```

これにより、デフォルトでは `app/routes` ディレクトリ内のルートが検索されますが、これはアプリディレクトリを基準にした `rootDirectory` オプションで構成できます。

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export const routes: RouteConfig = flatRoutes({
  rootDirectory: "file-routes",
});
```

このガイドの残りの部分では、デフォルトの `app/routes` ディレクトリを使用していることを前提としています。

## 基本的なルート

`app/routes` ディレクトリ内の任意の JavaScript または TypeScript ファイルは、アプリケーション内のルートになります。ファイル名はルートの URL パス名にマップされますが、`_index.tsx` は [ルートルート][root_route] の [インデックスルート][index_route] です。

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

これらのルートは [ネストされたルーティング][nested_routing] のために `app/root.tsx` のアウトレット内でレンダリングされることに注意してください。

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

通常、URL は静的ではなくデータ駆動型です。動的セグメントを使用すると、URL のセグメントをマッチングし、その値をコードで使用できます。`$` プレフィックスを使用して作成します。

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

値は URL から解析され、さまざまな API に渡されます。これらの値を「URL パラメータ」と呼びます。URL パラメータにアクセスする最も便利な場所は、[ローダー] と [アクション] です。

```tsx
export async function serverLoader({ params }) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

`params` オブジェクトのプロパティ名は、ファイル名に直接マップされていることに注意してください。`$city.tsx` は `params.city` になります。

ルートには、`concerts.$city.$date` のように、複数の動的セグメントを含めることができます。両方とも、名前で `params` オブジェクトでアクセスされます。

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

ネストされたルーティングとは、一般的に URL のセグメントをコンポーネントの階層とデータに関連付けることです。詳細については、[ルーティングガイド][nested_routing] を参照してください。

[ドットデリミタ][dot_delimiters] を使用してネストされたルートを作成します。ファイル名の `.` の前の部分が他のルートファイル名と一致する場合、自動的に一致する親ルートの子ルートになります。これらのルートを考えてみましょう。

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

`app/routes/concerts.` で始まるすべてのルートは、`app/routes/concerts.tsx` の子ルートになり、[親ルートのアウトレット][nested_routing] 内でレンダリングされます。

| URL                        | マッチするルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

通常、ユーザーが親 URL を直接訪れたときに親のアウトレット内で何かがレンダリングされるように、ネストされたルートを追加する場合はインデックスルートを追加することをお勧めします。

たとえば、URL が `/concerts/salt-lake-city` の場合、UI の階層は次のようになります。

```tsx
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

## レイアウトのネストなしのネストされた URL

URL をネストしますが、自動レイアウトのネストは不要な場合があります。親セグメントの末尾にアンダースコアを付けて、ネストをオプトアウトできます。

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

`/concerts/mine` は、`app/routes/concerts.tsx` とはネストされず、`app/root.tsx` とネストされることに注意してください。`trailing_` アンダースコアはパスセグメントを作成しますが、レイアウトのネストは作成しません。

`trailing_` アンダースコアは、親の署名の末尾にある長い部分と考えて、あなたを遺言から除外します。その後のセグメントをレイアウトのネストから削除します。

## ネストされたレイアウトのネストされていない URL

これらを <a name="pathless-routes"><b>パスのないルート</b></a> と呼びます

URL にパスセグメントを追加せずに、ルートのグループでレイアウトを共有したい場合があります。一般的な例としては、パブリックページやログイン済みアプリのエクスペリエンスとは異なるヘッダー/フッターを持つ認証ルートのセットがあります。`_leading` アンダースコアを使用してこれを実行できます。

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

`_leading` アンダースコアは、ファイル名の上に引く毛布のように考えて、ファイル名を URL から隠します。

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

`/american-flag-speedo` が `($lang).$productId.tsx` ではなく `($lang)._index.tsx` ルートにマッチしているのはなぜでしょうか。これは、オプションの動的パラメータセグメントの後に別の動的パラメータがある場合、`/american-flag-speedo` などの単一セグメント URL が `/:lang` `/:productId` にマッチするかどうかを確実に判断できないためです。オプションのセグメントは熱心にマッチするため、`/:lang` にマッチします。このような設定がある場合は、`($lang)._index.tsx` ローダーの `params.lang` を見て、`params.lang` が有効な言語コードでない場合は現在の/デフォルトの言語の `/:lang/american-flag-speedo` にリダイレクトすることをお勧めします。

## スプラットルート

[動的セグメント][dynamic_segments] は単一のパスセグメント（URL 内の 2 つの `/` 間にあるもの）をマッチングしますが、スプラットルートはスラッシュを含む URL の残りをマッチングします。

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

動的ルートパラメータと同様に、スプラットルートの `params` の `"*"` キーでマッチしたパスの値にアクセスできます。

```tsx filename=app/routes/files.$.tsx
export async function serverLoader({ params }) {
  const filePath = params["*"];
  return fake.getFileInfo(filePath);
}
```

## 特殊文字のエスケープ

これらのルート規約で使用される特殊文字のいずれかを URL の一部にしたい場合は、`[]` 文字を使用して規約をエスケープできます。

| ファイル名                            | URL                 |
| ----------------------------------- | ------------------- |
| `app/routes/sitemap[.]xml.tsx`      | `/sitemap.xml`      |
| `app/routes/[sitemap.xml].tsx`      | `/sitemap.xml`      |
| `app/routes/weird-url.[_index].tsx` | `/weird-url/_index` |
| `app/routes/dolla-bills-[$].tsx`    | `/dolla-bills-$`    |
| `app/routes/[[so-weird]].tsx`       | `/[so-weird]`       |

## フォルダーによる整理

ルートは、`route.tsx` ファイルを含むフォルダーにすることもできます。このファイルはルートモジュールを定義します。フォルダー内の残りのファイルはルートになりません。これにより、コードを、他のフォルダーで機能名を繰り返すのではなく、使用するルートに近づけて整理できます。

<docs-info>フォルダー内のファイルはルートパスに対して意味を持ちません。ルートパスはフォルダー名によって完全に定義されます。</docs-info>

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

一部またはすべてのルートは、独自の `route` モジュールを含むフォルダーにすることができます。

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

ルートモジュールをフォルダーに変換すると、ルートモジュールは `folder/route.tsx` になり、フォルダー内の他のすべてのモジュールはルートになりません。たとえば、

```
# これらは同じルートです。
app/routes/app.tsx
app/routes/app/route.tsx

# これらも同様です
app/routes/app._index.tsx
app/routes/app._index/route.tsx
```

## スケーリング

スケーリングの一般的な推奨事項は、すべてのルートをフォルダーにして、そのルートで排他的に使用されるモジュールをフォルダーに配置し、共有モジュールをルートフォルダー以外の他の場所に配置することです。これには、いくつかの利点があります。

- 共有モジュールを簡単に識別できるため、変更する際には注意が必要です。
- 特定のルートのモジュールを簡単に整理およびリファクタリングでき、ファイルの整理の疲労がなくなり、アプリの他の部分に混乱が生じません。

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



