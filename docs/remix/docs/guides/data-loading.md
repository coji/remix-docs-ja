---
title: データの読み込み
description: Remix の主要な機能の 1 つは、サーバーとのやり取りを簡素化して、コンポーネントにデータを取得することです。このドキュメントでは、Remix のデータの読み込みを最大限に活用するのに役立ちます。
---

# データの読み込み

Remix の主要な機能の 1 つは、サーバーとのやり取りを簡素化して、コンポーネントにデータを取得することです。これらの規則に従うと、Remix は自動的に次のような処理を実行できます。

- ページをサーバーでレンダリングします
- JavaScript の読み込みに失敗した場合でも、ネットワークの状態に左右されません
- ユーザーがサイトと対話する際に、ページの変更部分のデータのみを読み込むことで、最適化を実行して高速化します
- トランジション時にデータ、JavaScript モジュール、CSS、その他の資産を並行してフェッチし、UI がぎこちなくなる原因となるレンダー+フェッチのウォーターフォールを回避します
- [アクション][action] の後に再検証することで、UI のデータがサーバー上のデータと同期していることを確認します
- 前後へのクリック（ドメイン間でも）での優れたスクロール復元
- [エラー境界][error-boundary] でサーバー側のエラーを処理します
- [エラー境界][error-boundary] を使用して、「見つかりません」と「権限がありません」の堅牢な UX を有効にします
- UI のハッピーパスをハッピーに保つのに役立ちます

## 基礎

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
      <h1>商品</h1>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

コンポーネントはサーバーとブラウザでレンダリングされます。ローダーは _サーバー上でのみ_ 実行されます。つまり、ハードコードされた products 配列はブラウザバンドルに含まれず、データベース、決済処理、コンテンツ管理システムなど、API や SDK のサーバー専用に使用できます。

サーバー側のモジュールがクライアントバンドルに含まれてしまう場合は、[サーバーとクライアントのコード実行][server-vs-client-code] に関するガイドを参照してください。

## ルートパラメーター

`app/routes/users.$userId.tsx` や `app/routes/users.$userId.projects.$projectId.tsx` のように `$` を含む名前のファイルを指定すると、動的なセグメント（`$` で始まるセグメント）は URL から解析され、`params` オブジェクトでローダーに渡されます。

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

これらのパラメーターは URL から取得されるため、ソースコードでは定義されているかどうかを確認できません。そのため、パラメーターキーの型は `string | undefined` になります。特に TypeScript で型安全性を得るには、使用する前に検証することが良い習慣です。`invariant` を使用すると、簡単です。

```tsx filename=app/routes/users.$userId.projects.$projectId.tsx lines=[2,7-8]
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import invariant from "tiny-invariant";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.userId, "params.userId が必要です");
  invariant(params.projectId, "params.projectId が必要です");

  params.projectId; // <-- TypeScript はこれで string であることを認識します
};
```

`invariant` が失敗した場合にこのようなエラーをスローすることを不安に思うかもしれませんが、Remix では、ユーザーは壊れた UI ではなく、[エラー境界][error-boundary] に到達することになるので、問題から回復できると覚えておいてください。

## 外部 API

Remix はサーバー上で `fetch` API をポリフィルするため、既存の JSON API からデータをフェッチするのは非常に簡単です。状態、エラー、競合状態などを自分で管理する代わりに、ローダー（サーバー上）からフェッチを実行し、残りを Remix に任せることができます。

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

これは、すでに API があり、Remix アプリでデータソースに直接接続する必要がない場合に便利です。

## データベース

Remix はサーバー上で実行されるため、ルートモジュールでデータベースに直接接続できます。たとえば、[Prisma][prisma] を使用して Postgres データベースに接続できます。

```tsx filename=app/db.server.ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
export { db };
```

次に、ルートでこれをインポートして、クエリを実行できます。

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
      <p>{products.length} 商品</p>
      {/* ... */}
    </div>
  );
}
```

TypeScript を使用している場合、`useLoaderData` を呼び出す際に Prisma Client で生成された型を使用するように型推論を使用できます。これにより、ロードされたデータを使用するコードを記述する際に、より良い型安全性とインテリセンスが得られます。

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
      <p>商品 {product.id}</p>
      {/* ... */}
    </div>
  );
}
```

## Cloudflare KV

Cloudflare Pages または Workers を環境として選択した場合、[Cloudflare Key Value][cloudflare-kv] ストレージを使用すると、エッジにデータを静的リソースのように永続化できます。

Pages の場合、ローカル開発を開始するには、`--kv` パラメーターをパッケージ.json タスクに名前空間の名前とともに追加する必要があります。これは次のようになります。

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
      <p>商品</p>
      {product.name}
    </div>
  );
}
```

## 見つかりません

データを読み込む際に、レコードが見つからないことはよくあります。コンポーネントを期待どおりにレンダリングできないことがわかったら、すぐにレスポンスを `throw` します。Remix は現在のローダーでのコードの実行を停止し、最も近い[エラー境界][error-boundary] に切り替えます。

```tsx lines=[10-13]
export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  const product = await db.product.findOne({
    where: { id: params.productId },
  });

  if (!product) {
    // コンポーネントをレンダリングできないことがわかっています
    // したがって、コードの実行を停止し、
    // 見つかりませんページを表示するために、すぐにスローします
    throw new Response("見つかりません", { status: 404 });
  }

  const cart = await getCart(request);
  return json({
    product,
    inCart: cart.includes(product.id),
  });
};
```

## URL 検索パラメーター

URL 検索パラメーターは、`?` の後の URL の部分です。これは、「クエリ文字列」、「検索文字列」、「場所の検索」とも呼ばれます。`request.url` から URL を作成することで、値にアクセスできます。

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

ここで使用するウェブプラットフォームの型はいくつかあります。

- [`request`][request] オブジェクトには、`url` プロパティがあります
- URL を文字列からオブジェクトに解析する[URL コンストラクター][url]
- `url.searchParams` は[URLSearchParams][url-search-params] のインスタンスであり、場所の検索文字列を解析したバージョンで、検索文字列の読み取りと操作が簡単になります

次の URL が与えられた場合、検索パラメーターは次のように解析されます。

| URL                             | `url.searchParams.get("term")` |
| ------------------------------- | ------------------------------ |
| `/products?term=stretchy+pants` | `"stretchy pants"`             |
| `/products?term=`               | `""`                           |
| `/products`                     | `null`                         |

### データの再読み込み

複数のネストされたルートがレンダリングされていて、検索パラメーターが変更された場合、すべてのルートが再読み込みされます（新しいルートや変更されたルートのみが再読み込みされるのではなく）。これは、検索パラメーターはクロスカットの懸念事項であり、どのローダーにも影響を与える可能性があるためです。このような状況で、一部のルートの再読み込みを防ぎたい場合は、[shouldRevalidate][should-revalidate] を使用してください。

### コンポーネントでの検索パラメーター

ローダーで検索パラメーターを読み取るだけでなく、コンポーネントでもアクセスする必要がある場合もあります。

これを行うには、ユースケースに応じていくつかの方法があります。

**検索パラメーターの設定**

検索パラメーターを設定する最も一般的な方法はおそらく、ユーザーがフォームで制御できるようにすることです。

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

      <button type="submit">更新</button>
    </Form>
  );
}
```

ユーザーが 1 つだけ選択した場合：

- [x] Nike
- [ ] Adidas

URL は `/products/shoes?brand=nike` になります。

ユーザーが両方を選択した場合：

- [x] Nike
- [x] Adidas

URL は `/products/shoes?brand=nike&brand=adidas` になります。

`brand` は両方のチェックボックスの名前が `"brand"` であるため、URL 検索文字列で繰り返されることに注意してください。ローダーでは、[`searchParams.getAll`][search-params-getall] を使用して、これらの値すべてにアクセスできます。

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

開発者として、検索文字列を含む URL にリンクすることで、検索パラメーターを制御できます。リンクは、現在の URL の検索文字列を（存在する場合）リンクの検索文字列に置き換えます。

```tsx
<Link to="?brand=nike">Nike（のみ）</Link>
```

**コンポーネントでの検索パラメーターの読み取り**

ローダーで検索パラメーターを読み取ることに加えて、多くの場合、コンポーネントでも検索パラメーターにアクセスする必要があります。

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

      <button type="submit">更新</button>
    </Form>
  );
}
```

フォームのフィールドをすべて変更したときにフォームを自動送信する場合があります。そのためには、[`useSubmit`][use-submit] を使用します。

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

**検索パラメーターの設定（命令的）**

まれにですが、あらゆる理由で、いつでも検索パラメーターを命令的に設定することもできます。ここでのユースケースは非常に限られており、良い例さえ思いつきませんでしたが、ばかげた例を以下に示します。

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

多くの場合、チェックボックスなどの入力を、URL の検索パラメーターと同期させたい場合があります。React の制御されたコンポーネントの概念を使用すると、これは少し難しい場合があります。

これは、検索パラメーターを 2 つの方法で設定でき、入力を検索パラメーターと同期させたい場合にのみ必要になります。たとえば、このコンポーネントでは、`<input type="checkbox">` と `Link` の両方でブランドを変更できます。

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
        <Link to="?brand=nike">(のみ)</Link>
      </p>

      <button type="submit">更新</button>
    </Form>
  );
}
```

ユーザーがチェックボックスをクリックしてフォームを送信すると、URL が更新され、チェックボックスの状態も変更されます。ただし、ユーザーがリンクをクリックした場合、_URL は更新されるだけで、チェックボックスの状態は更新されません_。これは期待する動作ではありません。React の制御されたコンポーネントに精通している場合は、ここで `defaultChecked` ではなく `checked` に切り替えることを考えるかもしれません。

```tsx bad lines=[6]
<input
  type="checkbox"
  id="adidas"
  name="brand"
  value="adidas"
  checked={brands.includes("adidas")}
/>
```

これで、逆の問題が発生します。リンクをクリックすると、URL とチェックボックスの状態の両方が更新されますが、_チェックボックスは動作しなくなります_。これは、React は URL が変更されるまで状態を変更することを防ぐため、コントロールする URL は変更されません。つまり、チェックボックスを変更してフォームを再送信することはできません。

React は状態を制御することを望んでいますが、ユーザーがフォームを送信するまでは制御させたいと考えており、送信後に URL が変更されたときは、URL を制御させたいと考えています。そのため、「一種制御されている」状態です。

2 つの選択肢があり、どちらを選択するかは、望むユーザーエクスペリエンスによって異なります。

**最初の選択肢**: 最も簡単な方法は、ユーザーがチェックボックスをクリックしたときにフォームを自動送信することです。

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
        <Link to="?brand=nike">(のみ)</Link>
      </p>

      {/* ... */}
    </Form>
  );
}
```

（フォームの `onChange` で自動送信もしている場合は、イベントがフォームにバブルアップしないように `e.stopPropagation()` を実行してください。そうでないと、チェックボックスをクリックするたびに 2 回送信されてしまいます。）

**2 番目の選択肢**: チェックボックスが URL の状態を反映し、ユーザーがフォームを送信して URL を変更する前にオンとオフを切り替えることができるように、入力を「半制御」にする場合は、状態を配線する必要があります。少し手間がかかりますが、簡単です。

- 検索パラメーターから状態を初期化します
- ユーザーがチェックボックスをクリックしたときに状態を更新して、ボックスを「チェック済み」に変更します
- 検索パラメーターが変更されたときに状態を更新して（ユーザーがフォームを送信したかリンクをクリックしたか）、URL の検索パラメーターを反映します

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

このようなチェックボックスの抽象化を作成したい場合があります。

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

**3 番目の選択肢**: 2 つの選択肢しかないと言いましたが、React をよく知っていれば、3 番目の不聖な選択肢が誘惑するかもしれません。`key` プロップのいたずらで、入力部分を削除して再マウントしたいと思うかもしれません。賢い方法ですが、ユーザーがクリックしたときに React がノードをドキュメントから削除するため、アクセシビリティの問題が発生します。

<docs-error>これを実行しないでください。アクセシビリティの問題が発生します</docs-error>

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

Remix は、ナビゲーション時に変更されるページの部分のデータのみを読み込むことで、ユーザーエクスペリエンスを最適化します。たとえば、これらのドキュメントで現在使用している UI を考えてみてください。サイドのナビゲーションバーは、親ルートにあり、動的に生成されたすべてのドキュメントのメニューをフェッチしています。子ルートは、現在読んでいるドキュメントをフェッチしています。サイドバーのリンクをクリックすると、Remix は親ルートがページに残ることを認識しますが、ドキュメントの URL パラメーターが変更されるため、子ルートのデータは変更されます。この洞察に基づいて、Remix は_親ルートのデータを再フェッチしません_。

Remix がなければ、次の質問は「すべてのデータをどのように再読み込みするか」です。これも Remix に組み込まれています。[アクション][action] が呼び出されるたびに（ユーザーがフォームを送信するか、プログラマーが `useSubmit` から `submit` を呼び出した場合）、Remix はページ上のすべてのルートを自動的に再読み込みして、発生した可能性のある変更をすべて取得します。

ユーザーがアプリと対話するときに、キャッシュの期限切れや過剰なデータのフェッチを心配する必要はありません。すべて自動で行われます。

Remix がすべてのルートを再読み込みするケースは 3 つあります。

- アクションの後（フォーム、`useSubmit`、[`fetcher.submit`][fetcher-submit]）
- URL 検索パラメーターが変更された場合（どのローダーでも使用できます）
- ユーザーが、すでに存在する URL とまったく同じ URL へのリンクをクリックした場合（これにより、履歴スタックの現在のエントリも置き換えられます）

これらの動作はすべて、ブラウザのデフォルトの動作を模倣しています。これらの場合、Remix はコードについて十分に理解していないため、データの読み込みを最適化できませんが、[shouldRevalidate][should-revalidate] を使用して、自分で最適化できます。

## データライブラリ

Remix のデータ規則とネストされたルートのおかげで、多くの場合、React Query、SWR、Apollo、Relay、`urql` などのクライアント側のデータライブラリに頼る必要はありません。redux などのグローバル状態管理ライブラリを、主にサーバー上のデータと対話するために使用している場合も、これらのライブラリは必要ありません。

もちろん、Remix はこれらのライブラリを使用することを防ぎません（バンドラーの統合が必要な場合を除く）。お気に入りの React データライブラリを導入して、Remix API よりも UI に適していると考える場所で自由に使用できます。場合によっては、Remix を最初のサーバーレンダリングに使用し、その後は、お気に入りのライブラリに切り替えて対話を行うこともできます。

とはいえ、外部のデータライブラリを導入して、Remix の独自のデータ規則を回避した場合、Remix は自動的に次の操作を実行できなくなります。

- ページをサーバーでレンダリングします
- JavaScript の読み込みに失敗した場合でも、ネットワークの状態に左右されません
- ユーザーがサイトと対話する際に、ページの変更部分のデータのみを読み込むことで、最適化を実行して高速化します
- トランジション時にデータ、JavaScript モジュール、CSS、その他の資産を並行してフェッチし、UI がぎこちなくなる原因となるレンダー+フェッチのウォーターフォールを回避します
- アクションの後で再検証することで、UI のデータがサーバー上のデータと同期していることを確認します
- 前後へのクリック（ドメイン間でも）での優れたスクロール復元
- [エラー境界][error-boundary] でサーバー側のエラーを処理します
- [エラー境界][error-boundary] を使用して、「見つかりません」と「権限がありません」の堅牢な UX を有効にします
- UI のハッピーパスをハッピーに保つのに役立ちます。

代わりに、優れたユーザーエクスペリエンスを提供するために、追加の作業を行う必要があります。

Remix は、設計可能なすべてのユーザーエクスペリエンスに対応するように設計されています。外部のデータライブラリが_必要_になることは考えにくいですが、それでも_必要_になる場合があり、それは問題ありません！

Remix を学習していくうちに、クライアントの状態ではなく URL で考えるようになり、そうすれば多くの機能が無料で提供されるようになります。

## 注意点

ローダーはサーバー上でのみ呼び出され、ブラウザからの `fetch` を介して呼び出されるため、データは `JSON.stringify` でシリアル化され、ネットワークを介して送信されてからコンポーネントに到達します。つまり、データはシリアル化可能である必要があります。たとえば、次のようになります。

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

すべてが渡されるわけではありません！ローダーは_データ_用であり、データはシリアル化可能である必要があります。

一部のデータベース（[FaunaDB][fauna] など）は、メソッドを含むオブジェクトを返しますが、ローダーから返す前にシリアル化する必要があることに注意する必要があります。通常は問題ありませんが、データがネットワークを介して転送されていることを理解しておくことは重要です。

さらに、Remix はローダーを自動的に呼び出すため、ローダーを直接呼び出そうとしてはいけません。

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



