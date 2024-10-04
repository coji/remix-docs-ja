---
title: ファイルルートの規則
---

# ファイルルートの規則

`@react-router/fs-routes` パッケージを使用すると、ファイル規則に基づいたルート構成を有効にすることができます。

## セットアップ

最初に `@react-router/fs-routes` パッケージをインストールします。

```shellscript nonumber
npm i @react-router/fs-routes
```

次に、`app/routes.ts` ファイルでルート構成を提供するために使用します。

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export const routes: RouteConfig = flatRoutes();
```

これにより、デフォルトで `app/routes` ディレクトリ内のルートが検索されますが、これはアプリディレクトリを基準とした `rootDirectory` オプションで構成できます。

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export const routes: RouteConfig = flatRoutes({
  rootDirectory: "file-routes",
});
```

このガイドの残りの部分では、デフォルトの `app/routes` ディレクトリを使用していることを前提とします。

## 基本ルート

`app/routes` ディレクトリ内のモジュールはすべて、アプリケーションのルートになります。ファイル名はルートの URL パス名にマップされます。ただし、`_index.tsx` は [ルートルート][root_route] の [インデックスルート][index_route] です。`.js`、`.jsx`、`.ts`、または `.tsx` ファイル拡張子を使用できます。

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

これらのルートは、[ネストされたルーティング][nested_routing] のため、`app/root.tsx` のアウトレットでレンダリングされることに注意してください。

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

通常、URL は静的ではなく、データ駆動型です。動的セグメントを使用すると、URL のセグメントをマッチングして、その値をコードで使用できます。これらは `$` プレフィックスで作成します。

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

この値は URL から解析され、さまざまな API に渡されます。これらの値を「URL パラメータ」と呼びます。URL パラメータにアクセスする最も便利な場所は、[ローダー] と [アクション] です。

```tsx
export async function serverLoader({ params }) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

`params` オブジェクトのプロパティ名は、ファイル名に直接マップされます。`$city.tsx` は `params.city` になります。

ルートには、`concerts.$city.$date` のように、複数の動的セグメントを含めることができます。どちらも、名前で `params` オブジェクトにアクセスできます。

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

ネストされたルーティングは、URL のセグメントをコンポーネント階層とデータに結合するという一般的な考え方です。詳細については、[ルーティングガイド][nested_routing] を参照してください。

[ドット区切り文字][dot_delimiters] を使用して、ネストされたルートを作成します。`.` の前のファイル名が別のルートファイル名と一致する場合、そのファイル名は自動的に一致する親ルートの子ルートになります。次のルートを考えてみましょう。

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

| URL                        | マッチしたルート                      | レイアウト                    |
| -------------------------- | ---------------------------------- | ------------------------- |
| `/`                        | `app/routes/_index.tsx`            | `app/root.tsx`            |
| `/about`                   | `app/routes/about.tsx`             | `app/root.tsx`            |
| `/concerts`                | `app/routes/concerts._index.tsx`   | `app/routes/concerts.tsx` |
| `/concerts/trending`       | `app/routes/concerts.trending.tsx` | `app/routes/concerts.tsx` |
| `/concerts/salt-lake-city` | `app/routes/concerts.$city.tsx`    | `app/routes/concerts.tsx` |

ユーザーが親 URL を直接訪問したときに、親のアウトレットに何かがレンダリングされるように、ネストされたルートを追加するときは、通常、インデックスルートを追加する必要があることに注意してください。

たとえば、URL が `/concerts/salt-lake-city` の場合、UI 階層は次のようになります。

```tsx
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

## レイアウトのネストなしのネストされた URL

URL をネストしたい場合がありますが、レイアウトのネストは自動的に行いたくない場合があります。親セグメントに下線 `_` を追加することで、ネストをオプトアウトできます。

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

`/concerts/mine` は、`app/routes/concerts.tsx` とはネストされなくなりましたが、`app/root.tsx` とネストされていることに注意してください。`trailing_` 下線はパスセグメントを作成しますが、レイアウトのネストは作成しません。

`trailing_` 下線は、親の署名の最後にある長いビットのように考えてください。これは、あなたを遺言から除外して、それに続くセグメントをレイアウトのネストから削除します。

## ネストされたレイアウトなしのネストされた URL

これらを <a name="pathless-routes"><b>パスなしルート</b></a> と呼びます

URL にパスセグメントを追加せずに、ルートのグループでレイアウトを共有したい場合があります。一般的な例としては、公開ページやログイン済みアプリエクスペリエンスとは異なるヘッダー/フッターを持つ認証ルートのセットがあります。これには、`_leading` 下線を使用できます。

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

`_leading` 下線は、ファイル名を覆っている毛布のように考えてください。ファイル名を URL から隠しています。

## オプションのセグメント

ルートセグメントをかっこで囲むと、そのセグメントはオプションになります。

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

`/american-flag-speedo` が `($lang).$productId.tsx` ではなく `($lang)._index.tsx` ルートとマッチングしているのはなぜでしょうか。これは、オプションの動的パラメータセグメントの後に別の動的パラメータがある場合、`/american-flag-speedo` などの単一セグメントの URL が `/:lang` `/:productId` とマッチングするかどうかを確実に判断できないためです。オプションのセグメントは熱心にマッチングするため、`/:lang` とマッチングします。このような設定がある場合は、`($lang)._index.tsx` ローダーで `params.lang` を確認して、`params.lang` が有効な言語コードでない場合は、現在の/デフォルトの言語に対して `/:lang/american-flag-speedo` にリダイレクトすることをお勧めします。

## スプラットルート

[動的セグメント][dynamic_segments] は単一のパスセグメント（URL の 2 つの `/` の間のもの）とマッチングしますが、スプラットルートはスラッシュを含む URL の残りとマッチングします。

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
| `/files/talks/react-conf_old.pdf`            | `app/routes/files.$.tsx` |
| `/files/talks/react-conf_final.pdf`          | `app/routes/files.$.tsx` |
| `/files/talks/react-conf-FINAL-MAY_2024.pdf` | `app/routes/files.$.tsx` |

動的ルートパラメータと同様に、スプラットルートの `params` で `"*"` キーを使用して、マッチしたパスの値にアクセスできます。

```tsx filename=app/routes/files.$.tsx
export async function serverLoader({ params }) {
  const filePath = params["*"];
  return fake.getFileInfo(filePath);
}
```

## 特殊文字のエスケープ

これらのルート規則で使用される特殊文字のいずれかを URL の一部にしたい場合は、`[]` 文字を使用して規則をエスケープできます。

| ファイル名                            | URL                 |
| ----------------------------------- | ------------------- |
| `app/routes/sitemap[.]xml.tsx`      | `/sitemap.xml`      |
| `app/routes/[sitemap.xml].tsx`      | `/sitemap.xml`      |
| `app/routes/weird-url.[_index].tsx` | `/weird-url/_index` |
| `app/routes/dolla-bills-[$].tsx`    | `/dolla-bills-$`    |
| `app/routes/[[so-weird]].tsx`       | `/[so-weird]`       |

## 整理のためのフォルダー

ルートは、内部に `route.tsx` ファイルを持つフォルダーにすることもできます。このファイルはルートモジュールを定義します。フォルダー内の残りのファイルはルートになりません。これにより、コードを他のフォルダー全体で機能名を繰り返すのではなく、使用するルートにより近い場所に整理できます。

<docs-info>フォルダー内のファイルは、ルートパスに対して意味を持ちません。ルートパスは、フォルダー名で完全に定義されます。</docs-info>

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

一部、またはすべてを独自の `route` モジュールを内部に含むフォルダーにすることができます。

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

ルートモジュールをフォルダーに変換すると、ルートモジュールは `folder/route.tsx` になり、フォルダー内の他のモジュールはすべてルートにならないことに注意してください。たとえば、次のようになります。

```
# これらは同じルートです:
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



