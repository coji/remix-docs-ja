---
title: shouldRevalidate
---

# `shouldRevalidate`

この関数を使用すると、アクション後やクライアントサイドのナビゲーション後にどのルートのデータをリロードすべきかをアプリが最適化できます。

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

<docs-warning>この機能は<i>追加の</i>最適化です。一般的に、Remix の設計は、どのローダーをいつ呼び出す必要があるかをすでに最適化しています。この機能を使用すると、UI がサーバーと同期しなくなるリスクがあります。注意して使用してください！</docs-warning>

クライアントサイドのトランジション中、Remix は、変更されていないレイアウトルートをリロードしないなど、すでにレンダリングされているルートのリロードを最適化します。フォームの送信や検索パラメータの変更など、他のケースでは、Remix はどのルートをリロードする必要があるかを知らないため、安全のためにすべてをリロードします。これにより、UI が常にサーバー上の状態と同期していることが保証されます。

この関数を使用すると、Remix がルートをリロードしようとしているときに `false` を返すことで、アプリをさらに最適化できます。ルートモジュールでこの関数を定義すると、Remix はすべてのナビゲーションとアクションが呼び出された後のすべての再検証で、この関数に従います。繰り返しますが、間違ったことをすると、UI がサーバーと同期しなくなる可能性があるため、注意してください。

`fetcher.load` の呼び出しも再検証しますが、特定の URL をロードするため、ルートパラメータや URL 検索パラメータの再検証を気にする必要はありません。`fetcher.load` は、デフォルトではアクションの送信後と、[`useRevalidator`][userevalidator] を介した明示的な再検証リクエスト後にのみ再検証します。

## `actionResult`

送信によって再検証が発生した場合、これはアクションの結果となります。アクションデータか、アクションが失敗した場合はエラーのいずれかです。`shouldRevalidate` に再検証するかどうかを指示するために、アクションの結果に何らかの情報を含めるのが一般的です。

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

デフォルトでは、Remix はすべてのローダーを常に呼び出すわけではありません。デフォルトで信頼できる最適化が可能です。たとえば、変更されたパラメーターを持つローダーのみが呼び出されます。次の URL から下の URL に移動することを考えてみましょう。

* `/projects/123/tasks/abc`
* `/projects/123/tasks/def`

Remix は `projects/123` のパラメーターが変更されていないため、`tasks/def` のローダーのみを呼び出します。

`false` を返す特定の最適化を行った後は、常に `defaultShouldRevalidate` を返すのが最も安全です。そうしないと、UI がサーバー上のデータと同期しなくなる可能性があります。

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

これはより危険ですが、YOLO:

```tsx
export function shouldRevalidate() {
  return whateverConditionsYouCareAbout;
}
```

## `currentParams`

これらは、リロードが必要かどうかを判断するために `nextParams` と比較できる、URLの[URLパラメータ][url-params]です。データ読み込みのためにパラメータの一部のみを使用している場合、パラメータの余分な部分が変更されても再検証する必要はありません。

たとえば、IDと人間が理解しやすいタイトルを持つイベントのスラッグを考えてみましょう。

* `/events/blink-182-united-center-saint-paul--ae3f9`
* `/events/blink-182-little-caesars-arena-detroit--e87ad`

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

これはナビゲーションが開始された元の URL です。

## `nextParams`

ナビゲーションの場合、これらはユーザーがリクエストしている次のロケーションからの[URLパラメーター][url-params]です。一部の再検証はナビゲーションではないため、単純に `currentParams` と同じになります。

[url-params]: (URLパラメーターへのリンク)

## `nextUrl`

ナビゲーションの場合、これはユーザーがリクエストしている URL です。一部の再検証はナビゲーションではないため、単に `currentUrl` と同じになります。

## `formMethod`

再検証をトリガーしたフォーム送信で使用されたメソッド（おそらく `"GET"` または `"POST"`）。

## `formAction`

再検証をトリガーしたフォームアクション (`<Form action="/somewhere">`)。

## `formData`

再検証をトリガーしたフォームで送信されたデータ。

## ユースケース

### ルートのリロードをしない

ルートローダーが、クライアントアプリに送信される環境変数のように、決して変更されないデータを返すことはよくあります。このような場合、ルートローダーを再度呼び出す必要は決してありません。この場合、単に `return false` を返すことができます。

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

このように設定すると、Remix はフォームの送信後や検索パラメータの変更後など、いかなる理由があってもルートローダーへのリクエストを行わなくなります。

### 検索パラメータの無視

もう一つのよくあるケースは、ネストされたルートがあり、子コンポーネントがURLの検索パラメータを使用する機能を持っている場合です。例えば、検索ページや、検索パラメータに状態を保持したいタブなどです。

次のルートを考えてみましょう。

```
├── $projectId.tsx
└── $projectId.activity.tsx
```

そして、UIが次のようなものだとしましょう。

```
+------------------------------+
|    プロジェクト: デザイン刷新    |
+------------------------------+
|  タスク | コラボ | >アクティビティ |
+------------------------------+
|  検索: _____________       |
|                              |
|  - Ryanが画像を追加しました       |
|                              |
|  - Michaelがコメントしました         |
|                              |
+------------------------------+
```

`$projectId.activity.tsx` のローダーは、検索パラメータを使用してリストをフィルタリングできます。そのため、`/projects/design-revamp/activity?search=image` のようなURLにアクセスすると、結果のリストがフィルタリングされる可能性があります。おそらく、次のようになります。

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

これはアクティビティルートにとっては素晴らしいことですが、Remixは親ローダーである `$projectId.tsx` が検索パラメータを *も* 気にしているかどうかを知りません。そのため、Remixは最も安全な方法として、検索パラメータが変更されたときにページ上のすべてのルートをリロードします。

このUIでは、`$projectId.tsx` が検索パラメータを使用しないため、ユーザー、サーバー、データベースにとって帯域幅の無駄になります。`$projectId.tsx` のローダーが次のようになっているとしましょう。

```tsx filename=app/routes/$projectId.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const data = await fakedb.findProject(params.projectId);
  return json(data);
}
```

これを行う方法はたくさんあり、アプリの残りのコードも重要ですが、理想的には、最適化しようとしているUI（検索パラメータの変更）について考えるのではなく、ローダーが気にする値を見るべきです。この場合、ローダーはprojectIdのみを気にしているので、次の2つのことを確認できます。

* パラメータは同じままだったか？
* `POST` ではなく `GET` だったか？

パラメータが変更されず、`POST` を実行しなかった場合、ローダーは前回と同じデータを返すことがわかります。そのため、子ルートが検索パラメータを変更したときに再検証をオプトアウトできます。

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
