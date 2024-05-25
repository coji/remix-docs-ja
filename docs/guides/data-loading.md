---
title: データの読み込み
description: Remix の主要な機能の 1 つは、サーバーとのやり取りを簡素化してデータをコンポーネントに取得することです。このドキュメントは、Remix のデータ読み込みを最大限に活用するのに役立ちます。
---

# データの読み込み

Remix の主要な機能の 1 つは、サーバーとのやり取りを簡素化してデータをコンポーネントに取得することです。これらの規則に従うと、Remix は自動的に次のことを行うことができます。

- ページをサーバーレンダリングします。
- JavaScript がロードに失敗した場合でも、ネットワーク状況に耐性があります。
- ユーザーがサイトと対話する際に最適化を行い、ページの変更部分のデータのみを読み込むことで高速化します。
- トランジション時にデータ、JavaScript モジュール、CSS、その他の資産を並行してフェッチし、UI がぎこちなくなる原因となるレンダー + フェッチのウォーターフォールを回避します。
- [アクション][action] の後に再検証することで、UI のデータとサーバーのデータが同期していることを確認します。
- 前後へのクリック時の優れたスクロール復元（ドメイン間でも）
- [エラーバウンダリ][error-boundary] を使用してサーバー側のエラーを処理します。
- [エラーバウンダリ][error-boundary] を使用して、「見つかりません」や「承認されていません」の堅牢な UX を実現します。
- UI のハッピーパスをハッピーに保つのに役立ちます。

## 基礎

各ルートモジュールは、コンポーネントと [`loader`][loader] をエクスポートできます。[`useLoaderData`][useloaderdata] は、ローダーのデータをコンポーネントに提供します。

```tsx filename=app/routes/products.tsx lines=[1-2,4-9,12]
import { json } from "@remix-run/node"; // or cloudflare/deno
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  return json([
    { id: "1", name: "Pants" },
    { id: "2", name: "Jacket" },
  ]);
};

export default function Products() {
  const products = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Products</h1>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

コンポーネントは、サーバーとブラウザの両方でレンダリングされます。ローダーは _サーバーでのみ実行されます_。つまり、ハードコーディングされた products 配列はブラウザバンドルに含まれず、データベース、支払い処理、コンテンツ管理システムなどの、サーバーのみの API や SDK に安全に使用できます。

サーバー側のモジュールがクライアントバンドルに含まれてしまう場合は、[サーバーとクライアントのコード実行][server-vs-client-code] に関するガイドを参照してください。

## ルートパラメータ

`app/routes/users.$userId.tsx` や `app/routes/users.$userId.projects.$projectId.tsx` のように `$` を使用してファイルを名前付けると、動的セグメント（`$` で始まるもの）が URL から解析され、`params` オブジェクトにローダーに渡されます。

```tsx filename=app/routes/users.$userId.projects.$projectId.tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  console.log(params.userId);
  console.log(params.projectId);
};
```

次の URL を例に挙げます。パラメータは次のように解析されます。

| URL                             | `params.userId` | `params.projectId` |
| ------------------------------- | --------------- | ------------------ |
| `/users/123/projects/abc`       | `"123"`         | `"abc"`            |
| `/users/aec34g/projects/22cba9` | `"aec34g"`      | `"22cba9"`         |

これらのパラメータは、データの検索に最も役立ちます。

```tsx filename=app/routes/users.$userId.projects.$projectId.tsx lines=[10-11]
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno

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

### パラメータの型安全性

これらのパラメータは、ソースコードではなく URL から取得されるため、定義されているかどうかは確実にはわかりません。そのため、パラメータのキーの型は `string | undefined` になります。特に TypeScript を使用して型安全性を得るために、使用する前に検証することをお勧めします。`invariant` を使用すると簡単です。

```tsx filename=app/routes/users.$userId.projects.$projectId.tsx lines=[2,7-8]
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import invariant from "tiny-invariant";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.userId, "Expected params.userId");
  invariant(params.projectId, "Expected params.projectId");

  params.projectId; // <-- TypeScript は、これが string であることを認識するようになりました
};
```

`invariant` が失敗した場合に、このようなエラーをスローすることに抵抗があるかもしれませんが、Remix では、ユーザーが[エラーバウンダリ][error-boundary] に入り、壊れた UI ではなく問題から回復できることを覚えておいてください。

## 外部 API

Remix はサーバー上の `fetch` API をポリフィルするため、既存の JSON API からデータをフェッチするのが非常に簡単です。状態、エラー、競合状態などを自分で管理する代わりに、ローダー（サーバー上）からフェッチを行い、残りを Remix に処理させることができます。

```tsx filename=app/routes/gists.tsx lines=[5]
import { json } from "@remix-run/node"; // or cloudflare/deno
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

これは、すでに API があり、Remix アプリで直接データソースに接続する必要がない場合に最適です。

## データベース

Remix はサーバー上で実行されるため、ルートモジュールからデータベースに直接接続できます。たとえば、[Prisma][prisma] を使用して Postgres データベースに接続できます。

```tsx filename=app/db.server.ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
export { db };
```

そして、ルートからそれをインポートしてクエリを実行できます。

```tsx filename=app/routes/products.$categoryId.tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno
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
      <p>{products.length} Products</p>
      {/* ... */}
    </div>
  );
}
```

TypeScript を使用している場合は、型推論を使用して、`useLoaderData` を呼び出す際に Prisma Client で生成された型を使用できます。これにより、読み込まれたデータを使用するコードを記述する際に、より優れた型安全性とインテリセンスが実現します。

```tsx filename=app/routes/products.$productId.tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno
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
      <p>Product {product.id}</p>
      {/* ... */}
    </div>
  );
}
```

## Cloudflare KV

Cloudflare Pages または Workers を環境として選択した場合、[Cloudflare Key Value][cloudflare-kv] ストレージを使用すると、静的リソースのようにエッジにデータを永続化できます。

Pages の場合、ローカル開発を開始するには、`--kv` パラメータを namespace の名前と共に `package.json` タスクに追加する必要があります。そのため、次のように表示されます。

```
"dev:wrangler": "cross-env NODE_ENV=development wrangler pages dev ./public --kv PRODUCTS_KV"
```

Cloudflare Workers 環境の場合、[別の構成を行う必要があります][cloudflare-kv-setup]。

これにより、ローダーコンテキストで `PRODUCTS_KV` を使用できるようになります（KV ストアは、Cloudflare Pages アダプターによってローダーコンテキストに自動的に追加されます）。

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
      <p>Product</p>
      {product.name}
    </div>
  );
}
```

## 見つかりません

データを読み込む際に、レコードが見つからないことはよくあります。コンポーネントを期待通りにレンダリングできないとわかったらすぐに、応答を `throw` します。Remix は、現在のローダーでのコードの実行を停止し、最も近い[エラーバウンダリ][error-boundary] に切り替えます。

```tsx lines=[10-13]
export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  const product = await db.product.findOne({
    where: { id: params.productId },
  });

  if (!product) {
    // コンポーネントをレンダリングできないことがわかっています。
    // したがって、すぐに throw してコードの実行を停止し、
    // 見つからないページを表示します。
    throw new Response("Not Found", { status: 404 });
  }

  const cart = await getCart(request);
  return json({
    product,
    inCart: cart.includes(product.id),
  });
};
```

## URL 検索パラメータ

URL 検索パラメータは、`?` の後の URL の部分です。この名称は、クエリ文字列、検索文字列、またはロケーション検索とも呼ばれます。`request.url` から URL を作成することで、値にアクセスできます。

```tsx filename=app/routes/products.tsx lines=[7-8]
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const term = url.searchParams.get("term");
  return json(await fakeProductSearch(term));
};
```

ここで使用されるウェブプラットフォームの型はいくつかあります。

- [`request`][request] オブジェクトには、`url` プロパティがあります。
- [URL コンストラクタ][url] は、URL 文字列をオブジェクトに解析します。
- `url.searchParams` は、[URLSearchParams][url-search-params] のインスタンスです。これは、ロケーション検索文字列を解析したバージョンであり、検索文字列の読み取りと操作を容易にします。

次の URL を例に挙げます。検索パラメータは次のように解析されます。

| URL                             | `url.searchParams.get("term")` |
| ------------------------------- | ------------------------------ |
| `/products?term=stretchy+pants` | `"stretchy pants"`             |
| `/products?term=`               | `""`                           |
| `/products`                     | `null`                         |

### データの再読み込み

複数のネストされたルートがレンダリングされており、検索パラメータが変更されると、すべてのルートが再読み込みされます（新しく変更されたルートのみではなく）。これは、検索パラメータはクロスカットする懸念事項であり、すべてのローダーに影響を与える可能性があるためです。このようなシナリオで一部のルートが再読み込みされないようにするには、[shouldRevalidate][should-revalidate] を使用してください。

### コンポーネントでの検索パラメータ

ローダーで検索パラメータを読み取るだけでなく、コンポーネントでもアクセスする必要があることがよくあります。これには、ユースケースに応じていくつかの方法があります。

**検索パラメータの設定**

検索パラメータを設定する最も一般的な方法の 1 つは、ユーザーがフォームで制御できるようにすることです。

```tsx filename=app/routes/products.shoes.tsx lines=[8,9,16,17]
export default function ProductFilters() {
  return (
    <Form method="get">
      <label htmlFor="nike">Nike</label>
      <input
        type="checkbox"
        id="nike"
        name="brand"
        value="nike"
      />

      <label htmlFor="adidas">Adidas</label>
      <input
        type="checkbox"
        id="adidas"
        name="brand"
        value="adidas"
      />

      <button type="submit">Update</button>
    </Form>
  );
}
```

ユーザーが 1 つだけ選択している場合：

- [x] Nike
- [ ] Adidas

URL は `/products/shoes?brand=nike` になります。

ユーザーが両方とも選択している場合：

- [x] Nike
- [x] Adidas

URL は `/products/shoes?brand=nike&brand=adidas` になります。

ブランドは、両方のチェックボックスの名前が `"brand"` であるため、URL 検索文字列に繰り返されていることに注意してください。ローダーでは、[`searchParams.getAll`][search-params-getall] を使用して、これらのすべての値にアクセスできます。

```tsx lines=[8]
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const brands = url.searchParams.getAll("brand");
  return json(await getProducts({ brands }));
}
```

**検索パラメータへのリンク**

開発者として、検索パラメータを制御するために、検索文字列を含む URL にリンクできます。リンクは、現在の URL の検索文字列を（存在する場合）リンク内のものに置き換えます。

```tsx
<Link to="?brand=nike">Nike (only)</Link>
```

**コンポーネントでの検索パラメータの読み取り**

ローダーで検索パラメータを読み取るだけでなく、コンポーネントでも読み取る必要があることがよくあります。

```tsx lines=[1,4-5,15,24]
import { useSearchParams } from "@remix-run/react";

export default function ProductFilters() {
  const [searchParams] = useSearchParams();
  const brands = searchParams.getAll("brand");

  return (
    <Form method="get">
      <label htmlFor="nike">Nike</label>
      <input
        type="checkbox"
        id="nike"
        name="brand"
        value="nike"
        defaultChecked={brands.includes("nike")}
      />

      <label htmlFor="adidas">Adidas</label>
      <input
        type="checkbox"
        id="adidas"
        name="brand"
        value="adidas"
        defaultChecked={brands.includes("adidas")}
      />

      <button type="submit">Update</button>
    </Form>
  );
}
```

フォームをフィールドの変更時に自動的に送信したい場合は、[`useSubmit`][use-submit] があります。

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

**検索パラメータを命令的に設定する**

一般的ではありませんが、任意の理由で任意のタイミングで検索パラメータを命令的に設定することもできます。このユースケースは非常に少なく、適切なユースケースを思いつくことができませんでした。しかし、ここでは、ばかげた例を挙げてみます。

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

### 検索パラメータと制御された入力

多くの場合、チェックボックスなど、入力内容を URL の検索パラメータと同期させたい場合があります。これは、React の制御されたコンポーネントの概念では少し難しくなる可能性があります。

これは、検索パラメータが 2 つの方法で設定できる場合にのみ必要です。たとえば、このコンポーネントでは、`<input type="checkbox">` と `Link` の両方でブランドを変更できます。

```tsx bad lines=[11-18]
import { useSearchParams } from "@remix-run/react";

export default function ProductFilters() {
  const [searchParams] = useSearchParams();
  const brands = searchParams.getAll("brand");

  return (
    <Form method="get">
      <p>
        <label htmlFor="nike">Nike</label>
        <input
          type="checkbox"
          id="nike"
          name="brand"
          value="nike"
          defaultChecked={brands.includes("nike")}
        />
        <Link to="?brand=nike">(only)</Link>
      </p>

      <button type="submit">Update</button>
    </Form>
  );
}
```

ユーザーがチェックボックスをクリックしてフォームを送信すると、URL が更新され、チェックボックスの状態も変化します。しかし、ユーザーがリンクをクリックした場合 _URL のみが更新され、チェックボックスは更新されません_。これは私たちが求めるものではありません。ここで React の制御されたコンポーネントについてよく知っているかもしれませんが、`defaultChecked` ではなく `checked` に切り替えることを考えているかもしれません。

```tsx bad lines=[6]
<input
  type="checkbox"
  id="adidas"
  name="brand"
  value="adidas"
  checked={brands.includes("adidas")}
/>
```

これで、逆の問題が発生します。リンクをクリックすると、URL とチェックボックスの状態の両方が更新されますが、_チェックボックスは機能しなくなります_。これは、React は、それを制御する URL が変更されるまで、状態の変更を防止するためです。そして、チェックボックスを変更してフォームを再送信することはできないため、決して変更されることはありません。

React は、ある状態を使用して制御することを期待していますが、私たちはユーザーがフォームを送信するまで制御することを期待しており、その後、URL が変更されたときに URL に制御することを期待しています。そのため、私たちは「一種の制御された」状態にあります。

2 つの選択肢があり、どちらを選ぶかは、実現したいユーザーエクスペリエンスによって異なります。

**最初の選択肢**: 最も単純な方法は、ユーザーがチェックボックスをクリックしたときにフォームを自動送信することです。

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
        <label htmlFor="nike">Nike</label>
        <input
          type="checkbox"
          id="nike"
          name="brand"
          value="nike"
          onChange={(e) => submit(e.currentTarget.form)}
          checked={brands.includes("nike")}
        />
        <Link to="?brand=nike">(only)</Link>
      </p>

      {/* ... */}
    </Form>
  );
}
```

（フォームの `onChange` で自動送信も行っている場合は、イベントがフォームにバブルアップしないように `e.stopPropagation()` を実行してください。そうでない場合、チェックボックスをクリックするたびに 2 回送信されます。）

**2 番目の選択肢**: 入力内容を「半制御」にする場合、つまり、チェックボックスが URL の状態を反映しますが、ユーザーはフォームを送信して URL を変更する前に、チェックボックスをオンとオフに切り替えることができる場合は、状態を接続する必要があります。これは少し作業が必要ですが、簡単です。

- 検索パラメータから状態を初期化します。
- ユーザーがチェックボックスをクリックしたときに状態を更新して、ボックスを「チェック済み」に変更します。
- 検索パラメータが変更されたときに状態を更新して（ユーザーがフォームを送信したか、リンクをクリックした）、URL の検索パラメータを反映します。

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

  // パラメータが変更されたときに状態を更新します。
  // （フォームの送信またはリンクのクリック）
  React.useEffect(() => {
    setNikeChecked(brands.includes("nike"));
  }, [brands, searchParams]);

  return (
    <Form method="get">
      <p>
        <label htmlFor="nike">Nike</label>
        <input
          type="checkbox"
          id="nike"
          name="brand"
          value="nike"
          onChange={(e) => {
            // フォームを送信せずにチェックボックスの状態を更新します。
            setNikeChecked(true);
          }}
          checked={nikeChecked}
        />
        <Link to="?brand=nike">(only)</Link>
      </p>

      {/* ... */}
    </Form>
  );
}
```

このようなチェックボックスの抽象化を作成する必要があるかもしれません。

```tsx
<div>
  <SearchCheckbox name="brand" value="nike" />
  <SearchCheckbox name="brand" value="reebok" />
  <SearchCheckbox name="brand" value="adidas" />
</div>;

function SearchCheckbox({ name, value }) {
  const [searchParams] = useSearchParams();
  const all = searchParams.getAll(name);
  const [checked, setChecked] = React.useState(
    all.includes(value)
  );

  React.useEffect(() => {
    setChecked(all.includes(value));
  }, [all, searchParams, value]);

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

**オプション 3**: 2 つの選択肢しかないと言いましたが、React をよく知っている場合、誘惑する可能性のある 3 番目の不吉な選択肢があります。`key` プロップのいたずらで、入力を破棄して再マウントしたいと思うかもしれません。これは賢い方法ですが、ユーザーがクリックしたときに React がノードをドキュメントから削除するため、アクセシビリティの問題が発生します。

<docs-error>これはしないでください。アクセシビリティの問題が発生します。</docs-error>

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

Remix は、ナビゲーション時に変更されるページの部分のデータのみを読み込むことで、ユーザーエクスペリエンスを最適化します。たとえば、このドキュメントで現在使用している UI を考えてみてください。サイドのナビゲーションバーは、動的に生成されたすべてのドキュメントのメニューをフェッチした親ルートにあり、子ルートは現在読んでいるドキュメントをフェッチしました。サイドバーのリンクをクリックすると、Remix は、親ルートはページに残ることを認識しますが、ドキュメントの URL パラメータが変更されるため、子ルートのデータは変更されます。この認識により、Remix は _親ルートのデータを再フェッチしません_。

Remix がなければ、次の質問は「どのようにすべてのデータを再読み込みするか」です。これは、Remix にも組み込まれています。[アクション][action] が呼び出されると（ユーザーがフォームを送信するか、プログラマーが `useSubmit` から `submit` を呼び出す）、Remix は、ページ上のすべてのルートを自動的に再読み込みして、発生した可能性のある変更をすべて取得します。

ユーザーがアプリと対話する際に、キャッシュの期限切れやデータの過剰なフェッチを心配する必要はありません。すべて自動的に処理されます。

Remix がすべてのルートを再読み込みするケースは 3 つあります。

- アクションの後（フォーム、`useSubmit`、[`fetcher.submit`][fetcher-submit]）
- URL 検索パラメータが変更された場合（すべてのローダーが使用できる）
- ユーザーが、現在いる URL とまったく同じ URL へのリンクをクリックした場合（これにより、履歴スタックの現在のエントリも置き換えられます）

これらの動作はすべて、ブラウザのデフォルトの動作をエミュレートしています。これらのケースでは、Remix はコードについて十分に理解していないため、データの読み込みを最適化できませんが、[shouldRevalidate][should-revalidate] を使用して自分で最適化できます。

## データライブラリ

Remix のデータ規則とネストされたルートのおかげで、多くの場合、React Query、SWR、Apollo、Relay、`urql` などのクライアント側のデータライブラリは不要になります。redux などのグローバルな状態管理ライブラリを主にサーバー上のデータとのやり取りに使用している場合も、これらのライブラリは不要になる可能性があります。

もちろん、Remix はこれらのライブラリを使用することを妨げません（バンドラーの統合を必要とする場合を除く）。好きな React データライブラリを持ち込み、Remix API よりも UI に適していると考える場所に使用できます。場合によっては、Remix を最初のサーバーレンダリングに使用し、その後の対話にはお気に入りのライブラリに切り替えることができます。

ただし、外部のデータライブラリを持ち込んで、Remix の独自のデータ規則を回避すると、Remix は自動的に次のことができなくなります。

- ページをサーバーレンダリングします。
- JavaScript がロードに失敗した場合でも、ネットワーク状況に耐性があります。
- ユーザーがサイトと対話する際に最適化を行い、ページの変更部分のデータのみを読み込むことで高速化します。
- トランジション時にデータ、JavaScript モジュール、CSS、その他の資産を並行してフェッチし、UI がぎこちなくなる原因となるレンダー + フェッチのウォーターフォールを回避します。
- [アクション][action] の後に再検証することで、UI のデータとサーバーのデータが同期していることを確認します。
- 前後へのクリック時の優れたスクロール復元（ドメイン間でも）
- [エラーバウンダリ][error-boundary] を使用してサーバー側のエラーを処理します。
- [エラーバウンダリ][error-boundary] を使用して、「見つかりません」や「承認されていません」の堅牢な UX を実現します。
- UI のハッピーパスをハッピーに保つのに役立ちます。

代わりに、優れたユーザーエクスペリエンスを提供するために、追加の作業を行う必要があります。

Remix は、設計できるあらゆるユーザーエクスペリエンスを満たすように設計されています。外部のデータライブラリが _必要_ であることは予想外ですが、それでも _必要_ となる可能性があり、それは問題ありません。

Remix を学習していくと、クライアントの状態ではなく、URL について考えるようになり、そうすれば、多くの機能が無料で提供されます。

## 注意事項

ローダーはサーバーでのみ呼び出され、ブラウザから `fetch` 経由で呼び出されるため、データは `JSON.stringify` でシリアル化され、ネットワークを介して送信されてからコンポーネントに渡されます。これは、データがシリアル化可能である必要があることを意味します。たとえば：

<docs-error>これは機能しません！</docs-error>

```tsx bad nocopy lines=[3-6]
export async function loader() {
  return {
    date: new Date(),
    someMethod() {
      return "hello!";
    },
  };
}

export default function RouteComp() {
  const data = useLoaderData<typeof loader>();
  console.log(data);
  // '{"date":"2021-11-27T23:54:26.384Z"}'
}
```

すべてが渡されるわけではありません！ローダーは _データ_ 用であり、データはシリアル化可能である必要があります。

一部のデータベース（[FaunaDB][fauna] など）は、ローダーから返す前にシリアル化する必要があるメソッドを含むオブジェクトを返します。通常は問題ありませんが、データがネットワークを介して移動することを理解しておくことは重要です。

さらに、Remix はローダーを呼び出すため、ローダーを直接呼び出そうとしないでください。

<docs-error>これは機能しません。</docs-error>

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
