---
title: shouldRevalidate
---

# `shouldRevalidate`

この関数は、アプリがアクション後およびクライアントサイドナビゲーション時にどのルートのデータをリロードする必要があるかを最適化できるようにします。

```tsx
import type { ShouldRevalidateFunction } from "@remix-run/react";

export const shouldRevalidate: ShouldRevalidateFunction = ({
  actionResult,
  currentParams,
  currentUrl,
  defaultShouldRevalidate,
  formAction,
  formData,
  formEncType,
  formMethod,
  nextParams,
  nextUrl,
}) => {
  return true;
};
```

<docs-warning>この機能は、<i>追加の</i>最適化です。一般的に、Remix の設計は、どのローダーを呼び出す必要があるか、およびいつ呼び出す必要があるかをすでに最適化しています。この機能を使用すると、UI とサーバーの状態が同期しなくなる可能性があります。注意して使用してください！</docs-warning>

クライアントサイドの遷移中、Remix は、レイアウトルートの変更がないなど、すでにレンダリングされているルートの再読み込みを最適化します。フォームの送信や検索パラメータの変更などの他のケースでは、Remix はどのルートを再読み込みする必要があるかを認識しないため、安全のためにすべてを再読み込みします。これにより、UI が常にサーバー上の状態と同期した状態に保たれます。

この関数は、アプリが Remix がルートを再読み込みしようとしているときに `false` を返すことで、さらに最適化できるようにします。ルートモジュールにこの関数を定義すると、Remix はすべてのナビゲーションと、アクションが呼び出された後のすべての再検証で、この関数に従います。繰り返しますが、これにより、UI とサーバーの状態が同期しなくなる可能性があるため、注意してください。

`fetcher.load` の呼び出しも再検証しますが、特定の URL を読み込むため、ルートパラメータまたは URL 検索パラメータの再検証を心配する必要はありません。`fetcher.load` は、デフォルトでは、アクションの送信後と、[`useRevalidator`][userevalidator] を介した明示的な再検証要求の後でのみ再検証します。

## `actionResult`

送信によって再検証が発生した場合、これはアクションの結果（アクションデータまたはアクションが失敗した場合のエラー）になります。`shouldRevalidate` に再検証を行うかどうかの指示を与えるために、アクション結果にいくつかの情報を含めるのが一般的です。

```tsx
export async function action() {
  await saveSomeStuff();
  return { ok: true };
}

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}) {
  if (actionResult?.ok) {
    return false;
  }
  return defaultShouldRevalidate;
}
```

## `defaultShouldRevalidate`

デフォルトでは、Remix は常にすべてのローダーを呼び出すわけではありません。デフォルトで実行できる信頼性の高い最適化がいくつかあります。たとえば、変更されたパラメータを持つローダーのみが呼び出されます。次の URL から下の URL に移動することを考えてみましょう。

- `/projects/123/tasks/abc`
- `/projects/123/tasks/def`

Remix は、`projects/123` のパラメータが変更されていないため、`tasks/def` のローダーのみを呼び出します。

`false` を返す特定の最適化を行った後、常に `defaultShouldRevalidate` を返すのが最も安全です。そうしないと、UI がサーバー上のデータと同期しなくなる可能性があります。

```tsx
export function shouldRevalidate({
  defaultShouldRevalidate,
}) {
  if (whateverConditionsYouCareAbout) {
    return false;
  }

  return defaultShouldRevalidate;
}
```

これはより危険ですが、YOLO です。

```tsx
export function shouldRevalidate() {
  return whateverConditionsYouCareAbout;
}
```

## `currentParams`

これらは、`nextParams` と比較して、再読み込みが必要かどうかを判断するために使用できる、URL の [URL パラメータ][url-params] です。データ読み込みにパラメータの一部のみを使用している場合は、パラメータの無関係な部分が変更されても再検証する必要はありません。

たとえば、ID と人間が判読できるタイトルを含むイベントスラグを考えてみましょう。

- `/events/blink-182-united-center-saint-paul--ae3f9`
- `/events/blink-182-little-caesars-arena-detroit--e87ad`

```tsx filename=app/routes/events.$slug.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const id = params.slug.split("--")[1];
  return loadEvent(id);
}

export function shouldRevalidate({
  currentParams,
  nextParams,
  defaultShouldRevalidate,
}) {
  const currentId = currentParams.slug.split("--")[1];
  const nextId = nextParams.slug.split("--")[1];
  if (currentId === nextId) {
    return false;
  }

  return defaultShouldRevalidate;
}
```

## `currentUrl`

これは、ナビゲーションが開始された URL です。

## `nextParams`

ナビゲーションの場合、これはユーザーが要求している次の場所の [URL パラメータ][url-params] です。一部の再検証はナビゲーションではないため、これは単に `currentParams` と同じになります。

## `nextUrl`

ナビゲーションの場合、これはユーザーが要求している URL です。一部の再検証はナビゲーションではないため、これは単に `currentUrl` と同じになります。

## `formMethod`

再検証をトリガーしたフォーム送信で使用されたメソッド（おそらく `"GET"` または `"POST"`）。

## `formAction`

再検証をトリガーしたフォームアクション (`<Form action="/somewhere">`)。

## `formData`

再検証をトリガーしたフォームで送信されたデータ。

## 使用例

### ルートを再読み込みしない

ルートローダーが環境変数などの、変更されないデータを返すことは一般的です。このような場合は、ルートローダーを再び呼び出す必要はありません。この場合、単に `false` を返せばよいだけです。

```tsx lines=[10]
export const loader = async () => {
  return json({
    ENV: {
      CLOUDINARY_ACCT: process.env.CLOUDINARY_ACCT,
      STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    },
  });
};

export const shouldRevalidate = () => false;
```

これにより、Remix は、フォームの送信後、検索パラメータの変更後など、どのような理由があっても、ルートローダーへのリクエストを発行しなくなります。

### 検索パラメータを無視する

もう 1 つの一般的なケースとして、ネストされたルートがあり、子コンポーネントが、検索ページや、検索パラメータに状態を保持するタブなどの、URL の検索パラメータを使用する機能を持っている場合があります。

これらのルートを考えてみましょう。

```
├── $projectId.tsx
└── $projectId.activity.tsx
```

そして、UI は次のようになります。

```
+------------------------------+
|    Project: Design Revamp    |
+------------------------------+
|  Tasks | Collabs | >ACTIVITY |
+------------------------------+
|  Search: _____________       |
|                              |
|  - Ryan added an image       |
|                              |
|  - Michael commented         |
|                              |
+------------------------------+
```

`$projectId.activity.tsx` のローダーは、検索パラメータを使用してリストをフィルターできます。そのため、`/projects/design-revamp/activity?search=image` のような URL にアクセスすると、結果のリストをフィルターできます。ローダーは次のようになるかもしれません。

```tsx filename=app/routes/$projectId.activity.tsx lines=[11]
export async function loader({
  params,
  request,
}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return json(
    await exampleDb.activity.findAll({
      where: {
        projectId: params.projectId,
        name: {
          contains: url.searchParams.get("search"),
        },
      },
    })
  );
}
```

これはアクティビティルートには適していますが、Remix は、親ローダー `$projectId.tsx` が検索パラメータを気にするかどうかは知りません。そのため、Remix は最も安全な方法として、検索パラメータが変更されたときにページ上のすべてのルートを再読み込みします。

この UI では、これは、`$projectId.tsx` が検索パラメータを使用しないため、ユーザー、サーバー、データベースにとって無駄な帯域幅となります。`$projectId.tsx` のローダーが次のようになっているとします。

```tsx filename=app/routes/$projectId.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const data = await fakedb.findProject(params.projectId);
  return json(data);
}
```

これを実現する方法はたくさんあり、アプリの他のコードが問題となりますが、理想的には、最適化しようとしている UI（検索パラメータの変更）について考えるのではなく、ローダーが気にする値を検討します。この場合、ローダーが気にするのは `projectId` のみであるため、次の 2 つのことを確認できます。

- パラメータは同じですか？
- それは `GET` であり、変更ではありませんか？

パラメータが変更されておらず、`POST` を実行していない場合は、ローダーが前回と同じデータ返すことがわかっているため、子ルートが検索パラメータを変更したときに再検証を省略できます。

```tsx filename=app/routes/$projectId.tsx
export function shouldRevalidate({
  currentParams,
  nextParams,
  formMethod,
  defaultShouldRevalidate,
}) {
  if (
    formMethod === "GET" &&
    currentParams.projectId === nextParams.projectId
  ) {
    return false;
  }

  return defaultShouldRevalidate;
}
```

[url-params]: ../file-conventions/routes#dynamic-segments
[userevalidator]: ../hooks/use-revalidator


