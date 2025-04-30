---
title: Pending UI
order: 8
---

# ペンディングUIと楽観的UI

Webにおける優れたユーザーエクスペリエンスと平凡なエクスペリエンスの違いは、ネットワークを多用するアクション中に、開発者が視覚的な手がかりを提供することで、ネットワークを意識したユーザーインターフェースのフィードバックをどれだけうまく実装しているかによります。ペンディングUIには、主にビジーインジケーター、楽観的UI、スケルトンフォールバックの3つのタイプがあります。このドキュメントでは、特定のシナリオに基づいて適切なフィードバックメカニズムを選択および実装するためのガイドラインを提供します。

## UIフィードバックメカニズム（保留中）

**ビジーインジケーター**: ビジーインジケーターは、サーバーでアクションが処理されている間、ユーザーに視覚的な手がかりを表示します。このフィードバックメカニズムは、アプリケーションがアクションの結果を予測できず、UIを更新する前にサーバーの応答を待つ必要がある場合に使用されます。

**楽観的UI**: 楽観的UIは、サーバーの応答を受信する前に、予想される状態でUIを即座に更新することにより、知覚される速度と応答性を向上させます。このアプローチは、アプリケーションがコンテキストとユーザー入力に基づいてアクションの結果を予測できる場合に使用され、アクションへの即時応答を可能にします。

**スケルトンフォールバック**: スケルトンフォールバックは、UIが最初にロードされるときに使用され、ユーザーに今後のコンテンツの構造を概説する視覚的なプレースホルダーを提供します。このフィードバックメカニズムは、できるだけ早く何か有用なものをレンダリングするのに特に役立ちます。

## フィードバック選択の指針

楽観的UIを使用する場合：

* **次の状態の予測可能性**: アプリケーションは、ユーザーのアクションに基づいてUIの次の状態を正確に予測できます。
* **エラー処理**: プロセス中に発生する可能性のあるエラーに対処するための堅牢なエラー処理メカニズムが整備されています。
* **URLの安定性**: アクションによってURLが変更されることはなく、ユーザーが同じページにとどまることができます。

ビジーインジケーターを使用する場合：

* **次の状態の不確実性**: アクションの結果を確実に予測できないため、サーバーからの応答を待つ必要があります。
* **URLの変更**: アクションによってURLが変更され、新しいページまたはセクションへのナビゲーションが示されます。
* **エラー境界**: エラー処理のアプローチは、主に例外や予期しない動作を管理するエラー境界に依存しています。
* **副作用**: アクションは、メールの送信、支払いの処理など、重要なプロセスを伴う副作用を引き起こします。

スケルトンフォールバックを使用する場合：

* **初期ロード**: UIがロード中で、ユーザーに今後のコンテンツ構造を視覚的に示すことができます。
* **重要なデータ**: データはページの初期レンダリングに不可欠ではないため、データのロード中にスケルトンフォールバックを表示できます。
* **アプリのような感覚**: アプリケーションはスタンドアロンアプリの動作に似せて設計されており、フォールバックへの即時的なトランジションが可能です。

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

### 保留中のリンク

**ビジーインジケーター**: ユーザーがナビゲーションしていることをナビリンク自体で示すには、[`<NavLink className>`][nav_link_component_classname] コールバックを使用できます。

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

または、パラメーターを調べて、その横にスピナーを追加することもできます。

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

リンク上のローカライズされたインジケーターは便利ですが、不完全です。ナビゲーションをトリガーする方法は他にもたくさんあります。フォームの送信、ブラウザの戻る/進むボタンのクリック、アクションのリダイレクト、命令的な `navigate(path)` 呼び出しなどです。そのため、通常はすべてをキャプチャするためのグローバルインジケーターが必要になります。

### レコードの作成

**ビジーインジケーター**: 通常、レコードが作成されるのを待つのが最善です。楽観的なUIを使用する代わりに、IDやその他のフィールドが完了するまで不明なためです。また、このアクションはアクションから新しいレコードにリダイレクトすることに注意してください。

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

  // ペンディングUIのために、任意のアクションだけでなく、アクションに送信しているかを確認することが重要です
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

URLを変更しない場合（リストにレコードを追加する場合など）に便利な[`useFetcher`][use_fetcher]でも同じことができます。

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

**楽観的UI**: UIがレコードのフィールドを単純に更新する場合、楽観的UIは素晴らしい選択肢です。Webアプリでのユーザーインタラクションの多くは、更新である傾向があるため、これは一般的なパターンです。

```tsx lines=[6-8,19,22]
import { useFetcher } from "@remix-run/react";

function ProjectListItem({ project }) {
  const fetcher = useFetcher();

  const starred = fetcher.formData
    ? // 送信中の場合は楽観的な値を使用
      fetcher.formData.get("starred") === "1"
    : // データベースの状態に戻る
      project.starred;

  return (
    <>
      <div>{project.name}</div>
      <fetcher.Form method="post">
        <button
          type="submit"
          name="starred"
          // 中断を許可するために楽観的な値を使用
          value={starred ? "0" : "1"}
        >
          {/* 👇 楽観的な値を表示 */}
          {starred ? "★" : "☆"}
        </button>
      </fetcher.Form>
    </>
  );
}
```

## 遅延データ読み込み

**スケルトンフォールバック**: データが遅延される場合、[`<Suspense>`][suspense_component] を使用してフォールバックを追加できます。これにより、UI はデータの読み込みを待たずにレンダリングできるため、アプリケーションの知覚的および実際のパフォーマンスが向上します。

```tsx lines=[11-14,24-28]
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { defer } from "@remix-run/node"; // または cloudflare/deno
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

* **一貫したサイズ:** スケルトンフォールバックが実際のコンテンツの寸法と一致するようにしてください。これにより、突然のレイアウトシフトを防ぎ、よりスムーズで視覚的にまとまりのある読み込みエクスペリエンスを提供します。ウェブパフォーマンスの観点から、このトレードオフは、[Cumulative Layout Shift][cumulative_layout_shift] (CLS) を最小限に抑え、[First Contentful Paint][first_contentful_paint] (FCP) を改善します。フォールバックで正確な寸法を使用することで、トレードオフを最小限に抑えることができます。
* **重要なデータ:** ページメインコンテンツである重要な情報にはフォールバックを使用しないでください。これは SEO およびメタタグにとって特に重要です。重要なデータの表示を遅らせると、正確なメタタグを提供できず、検索エンジンがページを正しくインデックス化しません。
* **アプリのような感覚**: SEO の懸念がないウェブアプリケーション UI の場合、スケルトンフォールバックをより広範囲に使用すると有益な場合があります。これにより、スタンドアロンアプリの動作に似たインターフェースが作成されます。ユーザーがリンクをクリックすると、スケルトンフォールバックへの即時トランジションが得られます。
* **リンクプリフェッチ:** [`<Link prefetch="intent">`][link-component-prefetch] を使用すると、フォールバックを完全にスキップできることがよくあります。ユーザーがリンクにカーソルを合わせたり、フォーカスしたりすると、このメソッドは必要なデータをプリロードし、ユーザーがクリックする前にネットワークがコンテンツをフェッチする短い時間を与えます。これにより、多くの場合、次のページへの即時ナビゲーションが実現します。

[suspense_component]: https://react.dev/reference/react/Suspense
[cumulative_layout_shift]: https://web.dev/cls/
[first_contentful_paint]: https://web.dev/fcp/
[link-component-prefetch]: https://remix.run/components/link#prefetch

## 結論

ビジーインジケーター、楽観的UI、スケルトンフォールバックを通じてネットワークを意識したUIを作成することは、ネットワークインタラクションを必要とするアクション中に視覚的な手がかりを示すことで、ユーザーエクスペリエンスを大幅に向上させます。これらを使いこなすことが、ユーザーが信頼するアプリケーションを構築するための最良の方法です。

[use_navigation]: ../hooks/use-navigation

[nav_link_component_classname]: ../components/nav-link#classname-callback

[use_fetcher]: ../hooks/use-fetcher

[suspense_component]: https://react.dev/reference/react/Suspense

[cumulative_layout_shift]: https://web.dev/cls

[first_contentful_paint]: https://web.dev/fcp

[link-component-prefetch]: ../components/link#prefetch

