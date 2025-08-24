---
title: データローディング
description: Remix の主要な機能の 1 つは、サーバーとのやり取りを簡素化して、コンポーネントにデータを取得することです。このドキュメントでは、Remix でのデータローディングを最大限に活用する方法について説明します。
---

# データローディング

Remix の主要な機能の 1 つは、サーバーとのやり取りを簡素化して、コンポーネントにデータを取得することです。これらの規約に従うと、Remix は自動的に次のことを行えます。

- ページをサーバーレンダリングする
- JavaScript のロードに失敗した場合のネットワーク状態に対する耐性
- ユーザーがサイトを操作する際に、ページの変更部分のデータのみをロードすることで高速化する最適化を行う
- 遷移時にデータ、JavaScript モジュール、CSS、その他のアセットを並行してフェッチし、UI が途切れ途切れになる原因となるレンダリング + フェッチのウォーターフォールを回避する
- [アクション][action]後に再検証することで、UI のデータがサーバー上のデータと同期していることを確認する
- (ドメインをまたいでも) 前後クリック時の優れたスクロール復元
- [エラー境界][error-boundary]によるサーバー側のエラーの処理
- [エラー境界][error-boundary]による「Not Found」および「Unauthorized」に対する堅牢な UX の実現
- UI のハッピーパスを維持するのに役立つ

## 基本

各ルートモジュールは、コンポーネントと [`loader`][loader] をエクスポートできます。[`useLoaderData`][useloaderdata] は、ローダーのデータをコンポーネントに提供します。

```tsx filename=app/routes/products.tsx lines=[1-2,4-9,12]
import { json } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  return json([
    { id: "1", name: "パンツ" },
    { id: "2", name: "ジャケット" },
  ]);
};

export default function Products() {
  const products = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>製品</h1>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

コンポーネントはサーバーとブラウザーでレンダリングされます。ローダーは _サーバーでのみ実行されます_。つまり、ハードコードされた製品配列はブラウザーバンドルに含まれず、データベース、決済処理、コンテンツ管理システムなどの API や SDK にサーバーのみを使用しても安全です。

サーバー側のモジュールがクライアントバンドルに含まれてしまう場合は、[サーバーとクライアントのコード実行][server-vs-client-code]に関するガイドを参照してください。

## ルートパラメーター

`app/routes/users.$userId.tsx` や `app/routes/users.$userId.projects.$projectId.tsx` のように、ファイルに `$` を付けて名前を付けると、動的なセグメント (`$` で始まるもの) が URL から解析され、`params` オブジェクトでローダーに渡されます。

```tsx filename=app/routes/users.$userId.projects.$projectId.tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  console.log(params.userId);
  console.log(params.projectId);
};
```

次の URL が与えられた場合、パラメーターは次のように解析されます。

| URL                             | `params.userId` | `params.projectId` |
| ------------------------------- | --------------- | ------------------ |
| `/users/123/projects/abc`       | `"123"`         | `"abc"`            |
| `/users/aec34g/projects/22cba9` | `"aec34g"`      | `"22cba9"`         |

これらのパラメーターは、データの検索に最も役立ちます。

```tsx filename=app/routes/users.$userId.projects.$projectId.tsx lines=[10-11]
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  return json(
    await fakeDb.project.findMany({
      where: {
        userId: params.userId,
        projectId: params.projectId,
      },
    })
  );
};
```

### パラメーターの型安全性

これらのパラメーターはソースコードではなく URL から取得されるため、定義されているかどうかを確実に知ることはできません。そのため、パラメーターのキーの型は `string | undefined` になっています。特に TypeScript で型安全性を確保するには、使用する前に検証することをお勧めします。`invariant` を使用すると簡単になります。

```tsx filename=app/routes/users.$userId.projects.$projectId.tsx lines=[2,7-8]
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import invariant from "tiny-invariant";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.userId, "Expected params.userId");
  invariant(params.projectId, "Expected params.projectId");

  params.projectId; // <-- TypeScript はこれが文字列であることを認識する
};
```

失敗した場合に `invariant` でこのようなエラーをスローすることに抵抗があるかもしれませんが、Remix では、ユーザーは壊れた UI ではなく、問題から回復できる[エラー境界][error-boundary]に到達することを覚えておいてください。

## 外部 API

Remix はサーバー上で `fetch` API をポリフィルするため、既存の JSON API からデータをフェッチするのが非常に簡単です。状態、エラー、競合状態などを自分で管理する代わりに、ローダー (サーバー上) からフェッチを実行し、残りは Remix に任せることができます。

```tsx filename=app/routes/gists.tsx lines=[5]
import { json } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData } from "@remix-run/react";

export async function loader() {
  const res = await fetch("https://api.github.com/gists");
  return json(await res.json());
}

export default function GistsRoute() {
  const gists = useLoaderData<typeof loader>();
  return (
    <ul>
      {gists.map((gist) => (
        <li key={gist.id}>
          <a href={gist.html_url}>{gist.id}</a>
        </li>
      ))}
    </ul>
  );
}
```

これは、すでに使用する API があり、Remix アプリでデータソースに直接接続することを気にしない場合や必要がない場合に最適です。

## データベース

Remix はサーバー上で実行されるため、ルートモジュールでデータベースに直接接続できます。たとえば、[Prisma][prisma] を使用して Postgres データベースに接続できます。

```tsx filename=app/db.server.ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
export { db };
```

そして、ルートはそれをインポートしてクエリを実行できます。

```tsx filename=app/routes/products.$categoryId.tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData } from "@remix-run/react";

import { db } from "~/db.server";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  return json(
    await db.product.findMany({
      where: {
        categoryId: params.categoryId,
      },
    })
  );
};

export default function ProductCategory() {
  const products = useLoaderData<typeof loader>();
  return (
    <div>
      <p>{products.length} 製品</p>
      {/* ... */}
    </div>
  );
}
```

TypeScript を使用している場合は、`useLoaderData` を呼び出すときに型推論を使用して Prisma Client で生成された型を使用できます。これにより、ロードされたデータを使用するコードを記述する際に、型安全性とインテリセンスが向上します。

```tsx filename=app/routes/products.$productId.tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData } from "@remix-run/react";

import { db } from "~/db.server";

async function getLoaderData(productId: string) {
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      imgSrc: true,
    },
  });

  return product;
}

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  return json(await getLoaderData(params.productId));
};

export default function Product() {
  const product = useLoaderData<typeof loader>();
  return (
    <div>
      <p>製品 {product.id}</p>
      {/* ... */}
    </div>
  );
}
```

## Cloudflare KV

環境として Cloudflare Pages または Workers を選択した場合、[Cloudflare Key Value][cloudflare-kv] ストレージを使用すると、静的リソースであるかのようにエッジにデータを永続化できます。

Pages の場合、ローカル開発を開始するには、package.json タスクに `--kv` パラメーターと名前空間の名前を追加する必要があります。次のようになります。

```
"dev:wrangler": "cross-env NODE_ENV=development wrangler pages dev ./public --kv PRODUCTS_KV"
```

Cloudflare Workers 環境の場合は、[他の構成を行う][cloudflare-kv-setup]必要があります。

これにより、ローダーコンテキストで `PRODUCTS_KV` を使用できるようになります (KV ストアは Cloudflare Pages アダプターによってローダーコンテキストに自動的に追加されます)。

```tsx
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({
  context,
  params,
}: LoaderFunctionArgs) => {
  return json(
    await context.PRODUCTS_KV.get(
      `product-${params.productId}`,
      { type: "json" }
    )
  );
};

export default function Product() {
  const product = useLoaderData<typeof loader>();
  return (
    <div>
      <p>製品</p>
      {product.name}
    </div>
  );
}
```

## Not Found

データをロードしているときに、レコードが「見つからない」ことはよくあります。コンポーネントを期待どおりにレンダリングできないことがわかったらすぐに、レスポンスを `throw` すると、Remix は現在のローダーでのコードの実行を停止し、最も近い[エラー境界][error-boundary]に切り替えます。

```tsx lines=[10-13]
export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  const product = await db.product.findOne({
    where: { id: params.productId },
  });

  if (!product) {
    // コンポーネントをレンダリングできないことがわかったら
    // コードの実行を停止してすぐにスローします
    // そして、見つからないページを表示します
    throw new Response("Not Found", { status: 404 });
  }

  const cart = await getCart(request);
  return json({
    product,
    inCart: cart.includes(product.id),
  });
};
```

## URL 検索パラメーター

URL 検索パラメーターは、`?` の後の URL の部分です。これの他の名前は、「クエリ文字列」、「検索文字列」、または「ロケーション検索」です。`request.url` から URL を作成することで値にアクセスできます。

```tsx filename=app/routes/products.tsx lines=[7-8]
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const term = url.searchParams.get("term");
  return json(await fakeProductSearch(term));
};
```

ここでは、いくつかの Web プラットフォームの型が使用されています。

- [`request`][request] オブジェクトには `url` プロパティがあります
- URL 文字列をオブジェクトに解析する[URL コンストラクター][url]
- `url.searchParams` は、ロケーション検索文字列の解析済みバージョンである[URLSearchParams][url-search-params]のインスタンスであり、検索文字列の読み取りと操作が簡単になります

次の URL が与えられた場合、検索パラメーターは次のように解析されます。

| URL                             | `url.searchParams.get("term")` |
| ------------------------------- | ------------------------------ |
| `/products?term=stretchy+pants` | `"stretchy pants"`             |
| `/products?term=`               | `""`                           |
| `/products`                     | `null`                         |

### データのリロード

複数のネストされたルートがレンダリングされていて、検索パラメーターが変更された場合、(新しいルートまたは変更されたルートだけでなく) すべてのルートがリロードされます。これは、検索パラメーターが横断的な関心事であり、どのローダーにも影響を与える可能性があるためです。このシナリオで一部のルートがリロードされないようにする場合は、[shouldRevalidate][should-revalidate]を使用してください。

### コンポーネント内の検索パラメーター

ローダーやアクションではなく、コンポーネントから検索パラメーターを読み取って変更する必要がある場合があります。ユースケースに応じて、これを行う方法はいくつかあります。

**検索パラメーターの設定**

検索パラメーターを設定する最も一般的な方法は、ユーザーがフォームでそれらを制御できるようにすることです。

```tsx filename=app/routes/products.shoes.tsx lines=[8,9,16,17]
export default function ProductFilters() {
  return (
    <Form method="get">
      <label htmlFor="nike">ナイキ</label>
      <input
        type="checkbox"
        id="nike"
        name="brand"
        value="nike"
      />

      <label htmlFor="adidas">アディダス</label>
      <input
        type="checkbox"
        id="adidas"
        name="brand"
        value="adidas"
      />

      <button type="submit">更新</button>
    </Form>
  );
}
```

ユーザーが 1 つだけ選択した場合:

- [x] ナイキ
- [ ] アディダス

すると、URL は `/products/shoes?brand=nike` になります。

ユーザーが両方を選択した場合:

- [x] ナイキ
- [x] アディダス

すると、URL は `/products/shoes?brand=nike&brand=adidas` になります。

両方のチェックボックスに `"brand"` という名前が付けられているため、`brand` が URL 検索文字列で繰り返されていることに注意してください。ローダーでは、[`searchParams.getAll`][search-params-getall] を使用して、これらのすべての値にアクセスできます。

```tsx lines=[8]
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const brands = url.searchParams.getAll("brand");
  return json(await getProducts({ brands }));
}
```

**検索パラメーターへのリンク**

開発者として、検索文字列を含む URL にリンクすることで、検索パラメーターを制御できます。リンクは、URL の現在の検索文字列 (存在する場合) をリンク内の文字列に置き換えます。

```tsx
<Link to="?brand=nike">ナイキ (のみ)</Link>
```

**コンポーネントでの検索パラメーターの読み取り**

ローダーで検索パラメーターを読み取るだけでなく、コンポーネントでもアクセスする必要があることがよくあります。

```tsx lines=[1,4-5,15,24]
import { useSearchParams } from "@remix-run/react";

export default function ProductFilters() {
  const [searchParams] = useSearchParams();
  const brands = searchParams.getAll("brand");

  return (
    <Form method="get">
      <label htmlFor="nike">ナイキ</label>
      <input
        type="checkbox"
        id="nike"
        name="brand"
        value="nike"
        defaultChecked={brands.includes("nike")}
      />

      <label htmlFor="adidas">アディダス</label>
      <input
        type="checkbox"
        id="adidas"
        name="brand"
        value="adidas"
        defaultChecked={brands.includes("adidas")}
      />

      <button type="submit">更新</button>
    </Form>
  );
}
```

フィールドの変更時にフォームを自動送信したい場合は、[`useSubmit`][use-submit] があります。

```tsx lines=[2,7,14]
import {
  useSubmit,
  useSearchParams,
} from "@remix-run/react";

export default function ProductFilters() {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const brands = searchParams.getAll("brand");

  return (
    <Form
      method="get"
      onChange={(e) => submit(e.currentTarget)}
    >
      {/* ... */}
    </Form>
  );
}
```

**命令的な検索パラメーターの設定**

一般的ではありませんが、いつでも理由を問わず、命令的に searchParams を設定することもできます。ここでのユースケースはわずかであり、良い例を思い付くことさえできませんでしたが、ここに簡単な例を示します。

```tsx
import { useSearchParams } from "@remix-run/react";

export default function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const id = setInterval(() => {
      setSearchParams({ now: Date.now() });
    }, 1000);
    return () => clearInterval(id);
  }, [setSearchParams]);

  // ...
}
```

### 検索パラメーターと制御された入力

多くの場合、チェックボックスなどの一部の入力を URL の検索パラメーターと同期させたいと考えています。これは、React の制御されたコンポーネントの概念では少しトリッキーになる可能性があります。

これは、検索パラメーターを 2 つの方法で設定でき、入力を検索パラメーターと同期させたい場合にのみ必要です。たとえば、このコンポーネントでは、`<input type="checkbox">` と `Link` の両方でブランドを変更できます。

```tsx bad lines=[11-18]
import { useSearchParams } from "@remix-run/react";

export default function ProductFilters() {
  const [searchParams] = useSearchParams();
  const brands = searchParams.getAll("brand");

  return (
    <Form method="get">
      <p>
        <label htmlFor="nike">ナイキ</label>
        <input
          type="checkbox"
          id="nike"
          name="brand"
          value="nike"
          defaultChecked={brands.includes("nike")}
        />
        <Link to="?brand=nike">(のみ)</Link>
      </p>

      <button type="submit">更新</button>
    </Form>
  );
}
```

ユーザーがチェックボックスをクリックしてフォームを送信すると、URL が更新され、チェックボックスの状態も変更されます。ただし、ユーザーがリンクをクリックすると、_URL のみが更新され、チェックボックスは更新されません_。これは私たちが望むものではありません。ここでは、React の制御されたコンポーネントに精通しており、`defaultChecked` の代わりに `checked` に切り替えることを考えるかもしれません。

```tsx bad lines=[6]
<input
  type="checkbox"
  id="adidas"
  name="brand"
  value="adidas"
  checked={brands.includes("adidas")}
/>
```

これで、反対の問題が発生しました。リンクをクリックすると、URL とチェックボックスの状態の両方が更新されますが、_チェックボックスは機能しなくなりました_。これは、それを制御する URL が変更されるまで React が状態の変更を防止するためです。チェックボックスを変更してフォームを再送信することはできないため、URL は変更されません。

React は、何らかの状態を使用して制御することを望んでいますが、フォームを送信するまでユーザーに制御させ、変更されたら URL に制御させたいと考えています。そのため、この「半制御」状態になっています。

2 つの選択肢があり、どちらを選択するかは、必要なユーザーエクスペリエンスによって異なります。

**最初の選択肢**: 最も簡単なことは、ユーザーがチェックボックスをクリックしたときにフォームを自動送信することです。

```tsx lines=[2,7,20]
import {
  useSubmit,
  useSearchParams,
} from "@remix-run/react";

export default function ProductFilters() {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const brands = searchParams.getAll("brand");

  return (
    <Form method="get">
      <p>
        <label htmlFor="nike">ナイキ</label>
        <input
          type="checkbox"
          id="nike"
          name="brand"
          value="nike"
          onChange={(e) => submit(e.currentTarget.form)}
          checked={brands.includes("nike")}
        />
        <Link to="?brand=nike">(のみ)</Link>
      </p>

      {/* ... */}
    </Form>
  );
}
```

(フォームの `onChange` でも自動送信する場合は、イベントがフォームにバブリングしないように `e.stopPropagation()` を必ず実行してください。そうしないと、チェックボックスをクリックするたびに二重送信が発生します。)

**2 番目の選択肢**: チェックボックスが URL の状態を反映し、ユーザーがフォームを送信して URL を変更する前にオンとオフを切り替えることもできる「半制御」入力を希望する場合は、いくつかの状態を配線する必要があります。少し手間がかかりますが、簡単です。

- 検索パラメーターからいくつかの状態を初期化します
- ユーザーがチェックボックスをクリックしたときに状態を更新して、ボックスが「チェック済み」に変更されるようにします
- 検索パラメーターが変更されたとき (ユーザーがフォームを送信したか、リンクをクリックしたとき) に状態を更新して、URL 検索パラメーターの内容を反映します

```tsx lines=[11-14,16-20,31-35]
import {
  useSubmit,
  useSearchParams,
} from "@remix-run/react";

export default function ProductFilters() {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const brands = searchParams.getAll("brand");

  const [nikeChecked, setNikeChecked] = React.useState(
    // URL から初期化
    brands.includes("nike")
  );

  // パラメーターが変更されたときに状態を更新します
  // (フォームの送信またはリンクのクリック)
  React.useEffect(() => {
    setNikeChecked(brands.includes("nike"));
  }, [brands, searchParams]);

  return (
    <Form method="get">
      <p>
        <label htmlFor="nike">ナイキ</label>
        <input
          type="checkbox"
          id="nike"
          name="brand"
          value="nike"
          onChange={(e) => {
            // フォームを送信せずにチェックボックスの状態を更新します
            setNikeChecked(true);
          }}
          checked={nikeChecked}
        />
        <Link to="?brand=nike">(のみ)</Link>
      </p>

      {/* ... */}
    </Form>
  );
}
```

このようなチェックボックスの抽象化を作成することもできます。

```tsx
<div>
  <SearchCheckbox name="brand" value="nike" />
  <SearchCheckbox name="brand" value="reebok" />
  <SearchCheckbox name="brand" value="adidas" />
</div>;

function SearchCheckbox({ name, value }) {
  const [searchParams] = useSearchParams();
  const paramsIncludeValue = searchParams
    .getAll(name)
    .includes(value);
  const [checked, setChecked] = React.useState(
    paramsIncludeValue
  );

  React.useEffect(() => {
    setChecked(paramsIncludeValue);
  }, [paramsIncludeValue]);

  return (
    <input
      type="checkbox"
      name={name}
      value={value}
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
}
```

**オプション 3**: 選択肢は 2 つしかないと言いましたが、React をよく知っている場合は、3 番目の不敬な選択肢に誘惑される可能性があります。`key` プロップの仕掛けを使用して入力を消去して再マウントしたいと思うかもしれません。賢い方法ですが、ユーザーがクリックした後に React がドキュメントからノードを削除すると、ユーザーがフォーカスを失うため、アクセシビリティの問題が発生します。

<docs-error>これはしないでください。アクセシビリティの問題が発生します</docs-error>

```tsx bad lines=[6,7]
<input
  type="checkbox"
  id="adidas"
  name="brand"
  value="adidas"
  key={"adidas" + brands.includes("adidas")}
  defaultChecked={brands.includes("adidas")}
/>
```

## Remix の最適化

Remix は、ナビゲーション時に変更されるページのパーツのデータのみをロードすることで、ユーザーエクスペリエンスを最適化します。たとえば、このドキュメントで使用している UI を考えてみましょう。サイドのナビゲーションバーは、すべてのドキュメントの動的に生成されたメニューをフェッチした親ルートにあり、子ルートは現在読んでいるドキュメントをフェッチしました。サイドバーのリンクをクリックすると、Remix は親ルートがページに残ることを認識しますが、ドキュメントの URL パラメーターが変更されるため、子ルートのデータは変更されます。この洞察により、Remix は _親ルートのデータを再フェッチしません_。

Remix がない場合、次の質問は「すべてのデータをリロードするにはどうすればよいか」です。これは Remix にも組み込まれています。[アクション][action]が呼び出されると (ユーザーがフォームを送信したか、プログラマーが `useSubmit` から `submit` を呼び出した場合)、Remix はページ上のすべてのルートを自動的にリロードして、発生した可能性のある変更をキャプチャします。

ユーザーがアプリを操作するときに、キャッシュの期限切れやデータの過剰フェッチを心配する必要はありません。すべて自動です。

Remix がすべてのルートをリロードするケースは 3 つあります。

- アクション後 (フォーム、`useSubmit`、[`fetcher.submit`][fetcher-submit])
- URL 検索パラメーターが変更された場合 (どのローダーでも使用できる可能性があります)
- ユーザーがすでにいるまったく同じ URL へのリンクをクリックした場合 (これにより、履歴スタックの現在のエントリも置き換えられます)

これらの動作はすべて、ブラウザーのデフォルトの動作をエミュレートします。これらの場合、Remix はコードを最適化するのに十分な情報を把握していませんが、[shouldRevalidate][should-revalidate] を使用して自分で最適化できます。

## データライブラリ

Remix のデータ規約とネストされたルートのおかげで、通常は React Query、SWR、Apollo、Relay、`urql` などのクライアント側のデータライブラリに手を伸ばす必要がないことがわかります。主にサーバー上のデータとやり取りするために redux などのグローバル状態管理ライブラリを使用している場合も、それらが必要になる可能性は低いでしょう。

もちろん、Remix はそれらの使用を妨げるものではありません (バンドラーの統合が必要な場合を除く)。好きな React データライブラリを持ち込んで、Remix API よりも UI に適していると思われる場所で使用できます。場合によっては、最初のサーバーレンダリングに Remix を使用し、その後、インタラクションのために好きなライブラリに切り替えることができます。

ただし、外部データライブラリを持ち込み、Remix 独自のデータ規約を回避すると、Remix は自動的に次のことを行えなくなります。

- ページをサーバーレンダリングする
- JavaScript のロードに失敗した場合のネットワーク状態に対する耐性
- ユーザーがサイトを操作する際に、ページの変更部分のデータのみをロードすることで高速化する最適化を行う
- 遷移時にデータ、JavaScript モジュール、CSS、その他のアセットを並行してフェッチし、UI が途切れ途切れになる原因となるレンダリング + フェッチのウォーターフォールを回避する
- アクション後に再検証することで、UI のデータがサーバー上のデータと同期していることを確認する
- (ドメインをまたいでも) 前後クリック時の優れたスクロール復元
- [エラー境界][error-boundary]によるサーバー側のエラーの処理
- [エラー境界][error-boundary]による「Not Found」および「Unauthorized」に対する堅牢な UX の実現
- UI のハッピーパスを維持するのに役立つ

代わりに、優れたユーザーエクスペリエンスを提供するために追加の作業を行う必要があります。

Remix は、設計できるあらゆるユーザーエクスペリエンスに対応できるように設計されています。外部データライブラリが _必要_ であることは予想外ですが、それでも _必要_ である可能性があり、それはそれで問題ありません。

Remix を学習するにつれて、クライアントの状態での思考から URL での思考に移行し、そうすることで多くのものを無料で手に入れることができるでしょう。

## 注意点

ローダーは、ブラウザーからの `fetch` を介してサーバーでのみ呼び出されるため、データは `JSON.stringify` でシリアル化され、コンポーネントに到達する前にネットワーク経由で送信されます。つまり、データはシリアル化可能である必要があります。例:

<docs-error>これは機能しません!</docs-error>

```tsx bad nocopy lines=[3-6]
export async function loader() {
  return {
    date: new Date(),
    someMethod() {
      return "こんにちは!";
    },
  };
}

export default function RouteComp() {
  const data = useLoaderData<typeof loader>();
  console.log(data);
  // '{"date":"2021-11-27T23:54:26.384Z"}'
}
```

すべてがうまくいくわけではありません! ローダーは _データ_ 用であり、データはシリアル化可能である必要があります。

一部のデータベース ([FaunaDB][fauna] など) は、ローダーから返す前にシリアル化に注意する必要があるメソッドを持つオブジェクトを返します。通常、これは問題ではありませんが、データがネットワーク経由で転送されることを理解しておくことをお勧めします。

さらに、Remix はローダーを自動的に呼び出します。ローダーを直接呼び出そうとしないでください。

<docs-error>これは機能しません</docs-error>

```tsx bad nocopy
export const loader = async () => {
  return json(await fakeDb.products.findMany());
};

export default function RouteComp() {
  const data = loader();
  // ...
}
```

[action]: ../route/action
[cloudflare-kv-setup]: https://developers.cloudflare.com/workers/cli-wrangler/commands#kv
[cloudflare-kv]: https://developers.cloudflare.com/workers/learning/how-kv-works
[error-boundary]: ../route/error-boundary
[fauna]: https://fauna.com
[fetcher-submit]: ../hooks/use-fetcher#fetchersubmit
[loader]: ../route/loader
[prisma]: https://prisma.io
[request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[search-params-getall]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/getAll
[should-revalidate]: ../route/should-revalidate
[url-search-params]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[url]: https://developer.mozilla.org/en-US/docs/Web/API/URL
[use-submit]: ../hooks/use-submit
[useloaderdata]: ../hooks/use-loader-data
[server-vs-client-code]: ../discussion/server-vs-client
