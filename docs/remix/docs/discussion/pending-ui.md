---
title: 待ち UI
order: 8
---

# 待ちと楽観的 UI

ウェブにおける優れたユーザーエクスペリエンスと平凡なユーザーエクスペリエンスの違いは、開発者がネットワークを意識したユーザーインターフェースのフィードバックをどのように実装し、ネットワーク負荷の高いアクション中に視覚的な手がかりを提供するかです。待ち UI の主なタイプには、ビジーインジケーター、楽観的 UI、スケルトンフォールバックがあります。このドキュメントでは、特定のシナリオに基づいて適切なフィードバックメカニズムを選択して実装するためのガイドラインを示します。

## 待ち UI フィードバックメカニズム

**ビジーインジケーター**: ビジーインジケーターは、アクションがサーバーによって処理されている間、ユーザーに視覚的な手がかりを表示します。このフィードバックメカニズムは、アプリケーションがアクションの結果を予測できず、UI を更新する前にサーバーの応答を待機する必要がある場合に使用されます。

**楽観的 UI**: 楽観的 UI は、サーバーの応答を受信する前に期待される状態で UI をすぐに更新することで、認識される速度と応答性を向上させます。このアプローチは、アプリケーションがコンテキストとユーザー入力に基づいてアクションの結果を予測でき、アクションに対する即時応答を可能にする場合に使用されます。

**スケルトンフォールバック**: スケルトンフォールバックは、UI が最初にロードされているときに使用され、今後表示されるコンテンツの構造の概要を示す視覚的なプレースホルダーを提供します。このフィードバックメカニズムは、できるだけ早く有用なものをレンダリングするために特に役立ちます。

## フィードバック選択の指針

楽観的 UI を使用する：

- **次の状態の予測可能性**: アプリケーションは、ユーザーのアクションに基づいて UI の次の状態を正確に予測できます。
- **エラー処理**: 処理中に発生する可能性のある潜在的なエラーに対処するための堅牢なエラー処理メカニズムが備わっています。
- **URL の安定性**: アクションは URL の変更をもたらさず、ユーザーは同じページ内に留まります。

ビジーインジケーターを使用する：

- **次の状態の不確実性**: アクションの結果を確実に予測できず、サーバーの応答を待機する必要があります。
- **URL の変更**: アクションは URL の変更につながり、新しいページまたはセクションへのナビゲーションを示します。
- **エラー境界**: エラー処理のアプローチは、主に例外と予期しない動作を管理するエラー境界に依存しています。
- **副作用**: アクションは、メールの送信、支払いの処理など、重要なプロセスを含む副作用を引き起こします。

スケルトンフォールバックを使用する：

- **最初のロード**: UI はロードプロセス中にあり、今後表示されるコンテンツ構造の視覚的な表示を提供します。
- **重要なデータ**: データはページの最初のレンダリングには重要ではなく、データがロードされている間にスケルトンフォールバックを表示できます。
- **アプリのような感覚**: アプリケーションは、スタンドアロンアプリの動作に似せて設計されており、フォールバックへの即時遷移を可能にします。

## 例

### ページナビゲーション

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

### 待ち中のリンク

**ビジーインジケーター**: [`<NavLink className>`][nav_link_component_classname] コールバックを使用して、ナビゲーションリンク自体にユーザーがナビゲートしていることを示すことができます。

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

または、パラメーターを検査して、隣にスピナーを追加できます。

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

リンク上のローカライズされたインジケーターは良いですが、完全ではありません。ナビゲーションをトリガーする方法は他にもたくさんあります。フォームの送信、ブラウザの戻るボタンと進むボタンのクリック、アクションのリダイレクト、インペレーティブな `navigate(path)` の呼び出しなど、そのため、通常はすべてをキャプチャするグローバルなインジケーターが必要です。

### レコードの作成

**ビジーインジケーター**: ID やその他のフィールドは完了するまで不明なため、通常は楽観的 UI を使用するのではなく、レコードの作成を待つのが最適です。また、このアクションはアクションから新しいレコードにリダイレクトすることに注意してください。

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

  // important to check you're submitting to the action
  // for the pending UI, not just any action
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

URL を変更しない場合（レコードをリストに追加する場合など）、[`useFetcher`][use_fetcher] を使用して同じことができます。

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

**楽観的 UI**: UI がレコードのフィールドを単純に更新する場合、楽観的 UI は素晴らしい選択肢です。ウェブアプリケーションにおける多くの（ほとんどではないにしても）ユーザーの操作は更新であるため、これは一般的なパターンです。

```tsx lines=[6-8,19,22]
import { useFetcher } from "@remix-run/react";

function ProjectListItem({ project }) {
  const fetcher = useFetcher();

  const starred = fetcher.formData
    ? // use optimistic value if submitting
      fetcher.formData.get("starred") === "1"
    : // fall back to the database state
      project.starred;

  return (
    <>
      <div>{project.name}</div>
      <fetcher.Form method="post">
        <button
          type="submit"
          name="starred"
          // use optimistic value to allow interruptions
          value={starred ? "0" : "1"}
        >
          {/* 👇 display optimistic value */}
          {starred ? "★" : "☆"}
        </button>
      </fetcher.Form>
    </>
  );
}
```

## 遅延データのロード

**スケルトンフォールバック**: データが遅延している場合、[`<Suspense>`][suspense_component] を使用してフォールバックを追加できます。これにより、UI はデータのロードを待つことなくレンダリングされ、アプリケーションの認識されるパフォーマンスと実際のパフォーマンスが向上します。

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

スケルトンフォールバックを作成する際には、次の原則を考慮してください。

- **一貫したサイズ**: スケルトンフォールバックが実際のコンテンツの寸法と一致していることを確認します。これにより、レイアウトが突然シフトすることが防止され、よりスムーズで視覚的に一貫性のあるロードエクスペリエンスが提供されます。ウェブパフォーマンスの観点から、このトレードオフは、[First Contentful Paint][first_contentful_paint] (FCP) を改善するために、[Cumulative Layout Shift][cumulative_layout_shift] (CLS) を最小限に抑えます。フォールバックで正確な寸法を使用することで、トレードオフを最小限に抑えることができます。
- **重要なデータ**: ページの主要なコンテンツである重要な情報にはフォールバックを使用しないでください。これは、SEO とメタタグにとって特に重要です。重要なデータを遅らせて表示すると、正確なメタタグが提供されず、検索エンジンはページを正しくインデックス付けできません。
- **アプリのような感覚**: SEO が懸念事項ではないウェブアプリケーションの UI の場合、スケルトンフォールバックをより広範囲に使用することが有益です。これにより、スタンドアロンアプリの動作に似ているインターフェースが作成されます。ユーザーがリンクをクリックすると、スケルトンフォールバックにすぐに遷移します。
- **リンクのプリフェッチ**: [`<Link prefetch="intent">`][link-component-prefetch] を使用すると、多くの場合、フォールバックを完全にスキップできます。ユーザーがリンクにマウスオーバーまたはフォーカスすると、このメソッドは必要なデータをプリロードするため、ネットワークはユーザーがクリックする前にコンテンツをフェッチするための短い時間を取得できます。これにより、多くの場合、次のページへの即時ナビゲーションが可能になります。

## まとめ

ビジーインジケーター、楽観的 UI、スケルトンフォールバックを介してネットワークを意識した UI を作成することで、ネットワークの相互作用を必要とするアクション中に視覚的な手がかりを表示することにより、ユーザーエクスペリエンスが大幅に向上します。これをうまくできるようになることは、ユーザーが信頼するアプリケーションを構築する最良の方法です。

[use_navigation]: ../hooks/use-navigation
[nav_link_component_classname]: ../components/nav-link#classname-callback
[use_fetcher]: ../hooks/use-fetcher
[suspense_component]: https://react.dev/reference/react/Suspense
[cumulative_layout_shift]: https://web.dev/cls
[first_contentful_paint]: https://web.dev/fcp
[link-component-prefetch]: ../components/link#prefetch

