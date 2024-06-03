---
title: 処理中 UI
order: 8
---

# 処理中および楽観的 UI

ウェブでの優れたユーザーエクスペリエンスと平凡なユーザーエクスペリエンスの違いは、開発者がネットワークを意識したユーザーインターフェースフィードバックをどのように実装するか、つまりネットワークを多用するアクション中に視覚的な手がかりを提供するかです。処理中 UI には、ビジーインジケーター、楽観的 UI、スケルトンフォールバックの 3 つの主なタイプがあります。このドキュメントでは、特定のシナリオに基づいて適切なフィードバックメカニズムを選択および実装するためのガイドラインを提供します。

## 処理中 UI フィードバックメカニズム

**ビジーインジケーター**: ビジーインジケーターは、サーバーがアクションを処理している間にユーザーに視覚的な手がかりを表示します。このフィードバックメカニズムは、アプリケーションがアクションの結果を予測できず、UI を更新する前にサーバーの応答を待機する必要がある場合に使用されます。

**楽観的 UI**: 楽観的 UI は、サーバーの応答を受信する前に、予想される状態で UI をすぐに更新することで、知覚される速度と応答性を向上させます。このアプローチは、アプリケーションがコンテキストとユーザー入力に基づいてアクションの結果を予測できる場合に使用され、アクションに対する即時応答が可能になります。

**スケルトンフォールバック**: スケルトンフォールバックは、UI が最初にロードされるときに使用され、ユーザーに今後のコンテンツの構造を概説する視覚的なプレースホルダーを提供します。このフィードバックメカニズムは、できるだけ早く何か有用なものをレンダリングするのに特に役立ちます。

## フィードバック選択の指針

楽観的 UI を使用する場合:

- **次の状態の予測可能性**: アプリケーションは、ユーザーのアクションに基づいて UI の次の状態を正確に予測できます。
- **エラー処理**: プロセス中に発生する可能性のあるエラーに対処するために、堅牢なエラー処理メカニズムが用意されています。
- **URL の安定性**: アクションによって URL が変更されず、ユーザーは同じページにとどまります。

ビジーインジケーターを使用する場合:

- **次の状態の不確実性**: アクションの結果を確実に予測できないため、サーバーの応答を待機する必要があります。
- **URL の変更**: アクションによって URL が変更され、新しいページまたはセクションへのナビゲーションを示します。
- **エラー境界**: エラー処理アプローチは、例外と予期しない動作を管理するエラー境界に主に依存しています。
- **副作用**: アクションは、メールの送信、支払いの処理など、重要なプロセスを含む副作用をトリガーします。

スケルトンフォールバックを使用する場合:

- **最初のロード**: UI はロード中であり、ユーザーに今後のコンテンツ構造の視覚的な表示を提供します。
- **重要なデータ**: データはページの最初のレンダリングに必須ではないため、データがロードされている間にスケルトンフォールバックが表示されます。
- **アプリのような感覚**: アプリケーションは、スタンドアロンアプリの動作に似せるように設計されており、フォールバックへの即時遷移が可能になります。

## 例

### ページのナビゲーション

**ビジーインジケーター**: [`useNavigation`][use_navigation] を使用して、ユーザーが新しいページにナビゲートしていることを示すことができます。

```tsx
import { useNavigation } from "@remix-run/react";

function PendingNavigation() {
  const navigation = useNavigation();
  return navigation.state === "loading" ? (
    <div className="spinner" />
  ) : null;
}
```

### 処理中のリンク

**ビジーインジケーター**: [`<NavLink className>`][nav_link_component_classname] コールバックを使用して、ナビゲーションリンク自体にユーザーがそのリンクにナビゲートしていることを示すことができます。

```tsx lines=[10-12]
import { NavLink } from "@remix-run/react";

export function ProjectList({ projects }) {
  return (
    <nav>
      {projects.map((project) => (
        <NavLink
          key={project.id}
          to={project.id}
          className={({ isPending }) =>
            isPending ? "pending" : null
          }
        >
          {project.name}
        </NavLink>
      ))}
    </nav>
  );
}
```

または、パラメーターを検査して、その横にスピナーを追加します。

```tsx lines=[1,4,10-12]
import { useParams } from "@remix-run/react";

export function ProjectList({ projects }) {
  const params = useParams();
  return (
    <nav>
      {projects.map((project) => (
        <NavLink key={project.id} to={project.id}>
          {project.name}
          {params.projectId === project.id ? (
            <Spinner />
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}
```

リンクのローカライズされたインジケーターは良いですが、不完全です。ナビゲーションをトリガーできる方法は他にもたくさんあります。フォームの送信、ブラウザの戻るボタンと進むボタンのクリック、アクションのリダイレクト、`navigate(path)` の命令型呼び出しなどです。そのため、通常はすべてをキャプチャするグローバルインジケーターが必要になります。

### レコードの作成

**ビジーインジケーター**: ID やその他のフィールドは完了するまで不明であるため、通常は楽観的 UI を使用するのではなく、レコードの作成を待つのが最適です。また、このアクションは、アクションから新しいレコードにリダイレクトされることに注意してください。

```tsx filename=app/routes/create-project.tsx lines=[2,13,21-22,26,35]
import type { ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { redirect } from "@remix-run/node"; // or cloudflare/deno
import { useNavigation } from "@remix-run/react";

export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const project = await createRecord({
    name: formData.get("name"),
    owner: formData.get("owner"),
  });
  return redirect(`/projects/${project.id}`);
}

export default function CreateProject() {
  const navigation = useNavigation();

  // 重要なのは、処理中 UI のためにアクションを送信しているかどうかを確認することです。
  // 任意のアクションではなく。
  const isSubmitting =
    navigation.formAction === "/create-project";

  return (
    <Form method="post" action="/create-project">
      <fieldset disabled={isSubmitting}>
        <label>
          Name: <input type="text" name="projectName" />
        </label>
        <label>
          Owner: <UserSelect />
        </label>
        <button type="submit">Create</button>
      </fieldset>
      {isSubmitting ? <BusyIndicator /> : null}
    </Form>
  );
}
```

URL を変更していない場合 (レコードをリストに追加している場合など)、[`useFetcher`][use_fetcher] を使用して同じことができます。

```tsx lines=[5]
import { useFetcher } from "@remix-run/react";

function CreateProject() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  return (
    <fetcher.Form method="post" action="/create-project">
      {/* ... */}
    </fetcher.Form>
  );
}
```

### レコードの更新

**楽観的 UI**: UI がレコードのフィールドを単純に更新する場合、楽観的 UI は優れた選択肢です。ウェブアプリの多くの、場合によってはほとんどのユーザーインタラクションは更新である傾向があるため、これは一般的なパターンです。

```tsx lines=[6-8,19,22]
import { useFetcher } from "@remix-run/react";

function ProjectListItem({ project }) {
  const fetcher = useFetcher();

  const starred = fetcher.formData
    ? // 送信中の場合は楽観的な値を使用する
      fetcher.formData.get("starred") === "1"
    : // データベースの状態にフォールバックする
      project.starred;

  return (
    <>
      <div>{project.name}</div>
      <fetcher.Form method="post">
        <button
          type="submit"
          name="starred"
          // 中断を許可するために楽観的な値を使用する
          value={starred ? "0" : "1"}
        >
          {/* 👇 楽観的な値を表示する */}
          {starred ? "☆" : "★"}
        </button>
      </fetcher.Form>
    </>
  );
}
```

## 遅延データのロード

**スケルトンフォールバック**: データが遅延されている場合は、[`<Suspense>`][suspense_component] を使用してフォールバックを追加できます。これにより、UI はデータのロードを待たずにレンダリングでき、アプリケーションの知覚されるパフォーマンスと実際のパフォーマンスが向上します。

```tsx lines=[11-14,24-28]
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { defer } from "@remix-run/node"; // or cloudflare/deno
import { Await } from "@remix-run/react";
import { Suspense } from "react";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const reviewsPromise = getReviews(params.productId);
  const product = await getProduct(params.productId);
  return defer({
    product: product,
    reviews: reviewsPromise,
  });
}

export default function ProductRoute() {
  const { product, reviews } =
    useLoaderData<typeof loader>();
  return (
    <>
      <ProductPage product={product} />

      <Suspense fallback={<ReviewsSkeleton />}>
        <Await resolve={reviews}>
          {(reviews) => <Reviews reviews={reviews} />}
        </Await>
      </Suspense>
    </>
  );
}
```

スケルトンフォールバックを作成する際は、次の原則を考慮してください。

- **一貫性のあるサイズ**: スケルトンフォールバックは、実際のコンテンツの寸法と一致していることを確認してください。これにより、レイアウトの急激なシフトを防ぎ、よりスムーズで視覚的に調和のとれたローディングエクスペリエンスを提供します。ウェブパフォーマンスの観点から、このトレードオフは、[最初のコンテンツフルペイント][first_contentful_paint] (FCP) を改善するために、[累積レイアウトシフト][cumulative_layout_shift] (CLS) を最小限に抑えます。フォールバックで正確な寸法を指定することで、トレードオフを最小限に抑えることができます。
- **重要なデータ**: ページの主要なコンテンツなど、重要な情報にはフォールバックを使用しないでください。これは、SEO とメタタグにとって特に重要です。重要なデータを遅延して表示すると、正確なメタタグを提供できず、検索エンジンがページを正しくインデックス付けできません。
- **アプリのような感覚**: SEO を懸念しないウェブアプリケーション UI の場合は、スケルトンフォールバックをより広範囲に使用すると有益です。これにより、スタンドアロンアプリの動作に似せるインターフェースが作成されます。ユーザーがリンクをクリックすると、スケルトンフォールバックへの即時遷移が実行されます。
- **リンクの事前取得**: [`<Link prefetch="intent">`][link-component-prefetch] を使用すると、フォールバックを完全にスキップできることがよくあります。ユーザーがリンクにマウスをホバーするかフォーカスすると、この方法によって必要なデータが事前にロードされ、ネットワークはユーザーがクリックする前にコンテンツを取得する時間を少し確保できます。これにより、多くの場合、次のページへの即時ナビゲーションが実行されます。

## まとめ

ビジーインジケーター、楽観的 UI、スケルトンフォールバックを使用してネットワークを意識した UI を作成すると、ネットワークとのやり取りを必要とするアクション中に視覚的な手がかりを表示することで、ユーザーエクスペリエンスが大幅に向上します。これをうまくできるようになることは、ユーザーが信頼できるアプリケーションを構築するための最善の方法です。

[use_navigation]: ../hooks/use-navigation
[nav_link_component_classname]: ../components/nav-link#classname-callback
[use_fetcher]: ../hooks/use-fetcher
[suspense_component]: https://react.dev/reference/react/Suspense
[cumulative_layout_shift]: https://web.dev/cls
[first_contentful_paint]: https://web.dev/fcp
[link-component-prefetch]: ../components/link#prefetch


