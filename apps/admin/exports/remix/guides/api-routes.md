---
title: API ルート
---

# API ルート

サーバー上で実行されない、あるいは少なくともあまり実行されない React アプリを構築することに慣れているかもしれません。そのため、一連の API ルートによってバックアップされています。Remix では、ほとんどのルートが UI と API の両方であるため、ブラウザ内の Remix はサーバー上の Remix と通信する方法を知っています。

一般的に、「API ルート」という概念はまったく必要ありません。しかし、あなたがこの用語を調べてくるだろうと私たちは知っていたので、ここにいます！

## ルートはそれ自体が API

次のルートを考えてみましょう。

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

ユーザーが `<Link to="/teams" />` へのリンクをクリックすると、ブラウザ内の Remix はサーバーへのフェッチを実行して `loader` からデータを取得し、ルートをレンダリングします。コンポーネントへのデータのロードというタスク全体が処理されました。ルートコンポーネントのデータ要件に API ルートは必要ありません。それらはすでにそれ自体が API です。

## ナビゲーション以外でのローダーの呼び出し

ただし、ユーザーがルートを訪問しているからではなく、現在のページが何らかの理由でそのルートのデータを必要としているために、ローダーからデータを取得したい場合があります。非常に明確な例は、データベースからレコードをクエリしてユーザーに提案する `<Combobox>` コンポーネントです。

このような場合は `useFetcher` を使用できます。そして再び、ブラウザ内の Remix はサーバー上の Remix について知っているので、データを取得するために多くのことをする必要はありません。Remix のエラー処理が開始され、競合状態、中断、およびフェッチのキャンセルも処理されます。

たとえば、検索を処理するルートを作成できます。

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

次に、Reach UI のコンボボックス入力とともに `useFetcher` を使用します。

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

他のケースでは、アプリケーションの一部ではあるが、アプリケーションの UI の一部ではないルートが必要になる場合があります。たとえば、レポートを PDF としてレンダリングするローダーが必要な場合があります。

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

ルートが Remix UI（`<Link>` や `useFetcher` など）によって呼び出されず、デフォルトのコンポーネントをエクスポートしない場合、それは汎用リソースルートになります。`GET` で呼び出された場合、ローダーの応答が返されます。`POST`、`PUT`、`PATCH`、または `DELETE` で呼び出された場合、アクションの応答が返されます。

以下に、検討するためのいくつかのユースケースを示します。

- Remix UI でサーバー側のコードを再利用するモバイルアプリ用の JSON API
- PDF の動的な生成
- ブログ記事やその他のページ用のソーシャル画像の動的な生成
- 他のサービス用の Webhook

詳細については、[リソースルート][resource-routes]のドキュメントを参照してください。

[resource-routes]: ./resource-routes

