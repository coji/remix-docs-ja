---
title: API ルート
---

# API ルート

サーバー上で実行されない、またはほとんど実行されない React アプリの構築に慣れているかもしれません。そのため、API ルートのセットによってバックアップされています。Remix では、ほとんどのルートが UI と API の両方になるため、ブラウザの Remix はサーバー上の Remix と通信する方法を知っています。

一般的に、"API ルート" の概念はまったく必要ありません。しかし、この用語を使って調べてくることを知っていたので、ここにあります!

## ルートは独自の API です

このルートを考えてみてください。

```tsx filename=app/routes/teams.tsx
export async function loader() {
  return json(await getTeams());
}

export default function Teams() {
  return (
    <TeamsView teams={useLoaderData<typeof loader>()} />
  );
}
```

ユーザーが `<Link to="/teams" />` へのリンクをクリックするたびに、ブラウザの Remix はサーバーへのフェッチを実行して `loader` からデータを取得し、ルートをレンダリングします。コンポーネントにデータを読み込むタスク全体が処理されました。ルートコンポーネントのデータ要件には、API ルートは必要ありません。それらはすでに独自の API です。

## ナビゲーション以外のローダーを呼び出す

ただし、ユーザーがルートにアクセスするわけではないのに、現在のページが何らかの理由でそのルートのデータが必要なため、ローダーからデータを取得したい場合があります。非常に明確な例は、データベースをクエリしてレコードを検索し、ユーザーに提案する `<Combobox>` コンポーネントです。

このような場合は、`useFetcher` を使用できます。そして、ブラウザの Remix はサーバーの Remix について知っているため、データを取得するために特別なことはする必要はありません。Remix のエラー処理が有効になり、競合状態、割り込み、フェッチのキャンセルも処理されます。

たとえば、検索を処理するルートを次のように作成できます。

```tsx filename=app/routes/city-search.tsx
export async function loader({
  request,
}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return json(
    await searchCities(url.searchParams.get("q"))
  );
}
```

そして、Reach UI のコンボボックス入力とともに `useFetcher` を使用します。

```tsx lines=[2,11,14,19,21,23]
function CitySearchCombobox() {
  const cities = useFetcher();

  return (
    <cities.Form method="get" action="/city-search">
      <Combobox aria-label="Cities">
        <div>
          <ComboboxInput
            name="q"
            onChange={(event) =>
              cities.submit(event.target.form)
            }
          />
          {cities.state === "submitting" ? (
            <Spinner />
          ) : null}
        </div>

        {cities.data ? (
          <ComboboxPopover className="shadow-popup">
            {cities.data.error ? (
              <p>Failed to load cities :(</p>
            ) : cities.data.length ? (
              <ComboboxList>
                {cities.data.map((city) => (
                  <ComboboxOption
                    key={city.id}
                    value={city.name}
                  />
                ))}
              </ComboboxList>
            ) : (
              <span>No results found</span>
            )}
          </ComboboxPopover>
        ) : null}
      </Combobox>
    </cities.Form>
  );
}
```

## リソースルート

他の場合、アプリケーションの一部でありながら、アプリケーションの UI の一部ではないルートが必要になる場合があります。レポートを PDF としてレンダリングするローダーが必要な場合もあります。

```tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const report = await getReport(params.id);
  const pdf = await generateReportPDF(report);
  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
```

ルートが Remix UI （`<Link>` や `useFetcher` など）によって呼び出されず、デフォルトのコンポーネントをエクスポートしない場合、これは汎用リソースルートになります。`GET` で呼び出された場合、ローダーのレスポンスが返されます。`POST`、`PUT`、`PATCH`、または `DELETE` で呼び出された場合、アクションのレスポンスが返されます。

考えを促すために、いくつかのユースケースを紹介します。

- サーバー側のコードを Remix UI で再利用するモバイルアプリ向けの JSON API
- PDF の動的な生成
- ブログ投稿や他のページのソーシャル画像の動的な生成
- 他のサービス向けの Webhook

[リソースルート][resource-routes] のドキュメントで詳しく読むことができます。

[resource-routes]: ./resource-routes


