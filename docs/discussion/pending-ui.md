---
title: 待ち UI
order: 8
---

# 待ち状態と楽観的 UI

Web 上の素晴らしいユーザーエクスペリエンスと平凡なユーザーエクスペリエンスの違いは、開発者がネットワークに依存するアクション中に視覚的な手がかりを提供することで、ネットワーク対応のユーザーインターフェースフィードバックをどのように実装するかということです。待ち UI には、ビジーインジケーター、楽観的 UI、スケルトンフォールバックの 3 つの主なタイプがあります。このドキュメントでは、特定のシナリオに基づいて適切なフィードバックメカニズムを選択して実装するためのガイドラインを提供します。

## 待ち UI フィードバックメカニズム

**ビジーインジケーター**: ビジーインジケーターは、サーバーでアクションが処理されている間にユーザーに視覚的な手がかりを表示します。このフィードバックメカニズムは、アプリケーションがアクションの結果を予測できず、UI を更新する前にサーバーからの応答を待つ必要がある場合に使用されます。

**楽観的 UI**: 楽観的 UI は、サーバーからの応答を受信する前に、期待される状態ですぐに UI を更新することで、知覚される速度と応答性を向上させます。このアプローチは、アプリケーションがコンテキストとユーザー入力に基づいてアクションの結果を予測できる場合に使用され、アクションへの即時の応答を可能にします。

**スケルトンフォールバック**: スケルトンフォールバックは、UI が最初にロードされているときに使用され、今後のコンテンツの構造を概説する視覚的なプレースホルダーをユーザーに提供します。このフィードバックメカニズムは、できるだけ早く何か有用なものをレンダリングするのに特に役立ちます。

## フィードバック選択のための指針

楽観的 UI を使用する:

- **次の状態の予測可能性**: アプリケーションは、ユーザーのアクションに基づいて、UI の次の状態を正確に予測できます。
- **エラー処理**: プロセス中に発生する可能性のあるエラーに対処するために、堅牢なエラー処理メカニズムが実装されています。
- **URL の安定性**: アクションは URL の変更をもたらさないため、ユーザーは同じページ内に留まります。

ビジーインジケーターを使用する:

- **次の状態の不確実性**: アクションの結果を確実に予測することはできず、サーバーからの応答を待つ必要があります。
- **URL の変更**: アクションは URL の変更につながり、新しいページまたはセクションへのナビゲーションを示します。
- **エラー境界**: エラー処理のアプローチは、主に例外と予期しない動作を管理するエラー境界に依存します。
- **副作用**: アクションは、メールの送信、支払いの処理など、重要なプロセスを含む副作用をトリガーします。

スケルトンフォールバックを使用する:

- **最初のロード**: UI はロードプロセス中にあり、ユーザーに今後のコンテンツ構造の視覚的なインジケーションを提供します。
- **重要なデータ**: データはページの最初のレンダリングには重要ではなく、スケルトンフォールバックをデータがロードされている間表示できます。
- **アプリのような感覚**: アプリケーションは、スタンドアロンアプリの動作に似せるように設計されているため、フォールバックへの即時の移行が可能です。

## 例

### ページナビゲーション

**ビジーインジケーター**: [`useNavigation`][use_navigation] を使用して、ユーザーが新しいページに移動していることを示すことができます。

```tsx
import { useNavigation } from "@remix-run/react";

function PendingNavigation() {
  const navigation = useNavigation();
  return navigation.state === "loading" ? (
    <div className="spinner" />
  ) : null;
}
```

### 待ち状態のリンク

**ビジーインジケーター**: [`<NavLink className>`][nav_link_component_classname] コールバックを使用して、ユーザーがナビゲートしていることをナビゲーションリンク自体に示すことができます。

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

リンク上のローカライズされたインジケーターは良いですが、不完全です。ナビゲーションをトリガーできる方法は他にもたくさんあります。フォームの送信、ブラウザのクロムでの戻るボタンと進むボタンのクリック、アクションのリダイレクト、および強制的な `navigate(path)` コールなどがあります。そのため、通常はすべてをキャプチャするグローバルインジケーターが必要になります。

### レコードの作成

**ビジーインジケーター**: ID やその他のフィールドは完了するまで不明であるため、通常は楽観的な UI を使用せずに、レコードが作成されるのを待つのが最適です。また、このアクションはアクションから新しいレコードにリダイレクトすることに注意してください。

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

URL を変更していない場合（レコードをリストに追加する場合など）、[`useFetcher`][use_fetcher] と同じことができます。

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

**楽観的 UI**: UI がレコード上のフィールドを単純に更新する場合、楽観的な UI は最適な選択肢です。Web アプリケーションでのユーザーインタラクションの多く、場合によってはほとんどが更新であるため、これは一般的なパターンです。

```tsx lines=[6-8,19,22]
import { useFetcher } from "@remix-run/react";

function ProjectListItem({ project }) {
  const fetcher = useFetcher();

  const starred = fetcher.formData
    ? // use to optimistic value if submitting
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
          {/* display optimistic value */}
          {starred ? "☆" : "★"}
        </button>
      </fetcher.Form>
    </>
  );
}
```

## 遅延データロード

**スケルトンフォールバック**: データが遅延している場合、[`<Suspense>`][suspense_component] を使用してフォールバックを追加できます。これにより、UI はデータのロードを待たずにレンダリングできるため、アプリケーションの知覚されるパフォーマンスと実際のパフォーマンスが向上します。

```tsx lines=[11-14,23-27]
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

- **一貫性のあるサイズ**: スケルトンフォールバックが実際のコンテンツの寸法と一致するようにします。これにより、突然のレイアウトのずれが防止され、よりスムーズで視覚的に一貫性のあるロードエクスペリエンスが提供されます。Web パフォーマンスの観点から、このトレードオフにより、[累積レイアウトシフト][cumulative_layout_shift] (CLS) を最小限に抑え、[最初のコンテンツフルペイント][first_contentful_paint] (FCP) を向上させることができます。フォールバックで正確な寸法を使用することで、トレードオフを最小限に抑えることができます。
- **重要なデータ**: ページの主なコンテンツである重要な情報にフォールバックを使用しないでください。これは、SEO とメタタグにとって特に重要です。重要なデータを遅延して表示すると、正確なメタタグを提供できず、検索エンジンがページを正しくインデックス付けできなくなります。
- **アプリのような感覚**: SEO の問題がない Web アプリケーションの UI の場合、スケルトンフォールバックをより広範囲に使用すると有益です。これにより、スタンドアロンアプリの動作に似せるインターフェースが作成されます。ユーザーがリンクをクリックすると、スケルトンフォールバックに瞬時に移行できます。
- **リンクプリフェッチ**: [`<Link prefetch="intent">`][link-component-prefetch] を使用すると、多くの場合、フォールバックを完全にスキップできます。ユーザーがリンクにマウスオーバーまたはフォーカスすると、このメソッドは必要なデータを事前にロードするため、ネットワークはユーザーがクリックする前にコンテンツをフェッチするための時間を短縮できます。これにより、多くの場合、次のページにすぐに移動できます。

## まとめ

ビジーインジケーター、楽観的な UI、スケルトンフォールバックを通じてネットワーク対応の UI を作成すると、ネットワークのやり取りを必要とするアクション中に視覚的な手がかりを表示することで、ユーザーエクスペリエンスが大幅に向上します。これが得意になることは、ユーザーが信頼できるアプリケーションを構築するための最良の方法です。

[use_navigation]: ../hooks/use-navigation
[nav_link_component_classname]: ../components/nav-link#classname-callback
[use_fetcher]: ../hooks/use-fetcher
[suspense_component]: https://react.dev/reference/react/Suspense
[cumulative_layout_shift]: https://web.dev/cls
[first_contentful_paint]: https://web.dev/fcp
[link-component-prefetch]: ../components/link#prefetch