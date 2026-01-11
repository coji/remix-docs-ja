---
title: Form と fetcher の比較
---

# Form と fetcher

[MODES: framework, data]

## 概要

React Router で開発する場合、時には機能が重複する豊富なツールセットが提供され、初心者にとっては曖昧さを感じるかもしれません。React Router で効果的に開発するための鍵は、各ツールのニュアンスと適切なユースケースを理解することです。このドキュメントは、特定の API をいつ、なぜ使用するのかについて明確にすることを目的としています。

## 注目する API

- [`<Form>`][form-component]
- [`useFetcher`][use-fetcher]
- [`useNavigation`][use-navigation]

これらの API の違いと相互作用を理解することは、効率的で効果的な React Router 開発にとって不可欠です。

## URL の考慮事項

これらのツールの中から選択する際の主な基準は、URL を変更したいかどうかです。

- **URL の変更が必要な場合**: ページ間をナビゲートまたは遷移する場合、またはレコードの作成や削除などの特定のアクションの後。これにより、ユーザーのブラウザ履歴がアプリケーションを通じた移動を正確に反映するようになります。
  - **期待される動作**: 多くの場合、ユーザーが「戻る」ボタンを押すと、前のページに移動するはずです。その他の場合、履歴エントリが置き換えられることもありますが、それでも URL の変更は重要です。

- **URL の変更が不要な場合**: 現在のビューのコンテキストや主要なコンテンツを大幅に変更しないアクションの場合。これには、新しい URL やページのリロードを必要としない個々のフィールドの更新や軽微なデータ操作が含まれる場合があります。これは、ポップオーバー、コンボボックスなどのためのデータをフェッチャーで読み込む場合にも当てはまります。

### URL を変更すべき場合

これらのアクションは通常、ユーザーのコンテキストや状態に大きな変化を反映します。

- **新しいレコードの作成**: 新しいレコードを作成した後、ユーザーをその新しいレコード専用のページにリダイレクトし、そこで閲覧したりさらに変更したりするのが一般的です。

- **レコードの削除**: ユーザーが特定のレコード専用のページにいて、それを削除することにした場合、論理的な次のステップは、すべてのレコードのリストなど、一般的なページにリダイレクトすることです。

これらのケースでは、開発者は[`<Form>`][form-component] と [`useNavigation`][use-navigation] の組み合わせを使用することを検討すべきです。これらのツールは連携して、フォームの送信を処理し、特定のアクションを呼び出し、コンポーネントの props を介してアクション関連のデータを取得し、それぞれナビゲーションを管理することができます。

### URL を変更すべきでない場合

これらのアクションは一般的に、より微妙であり、ユーザーのコンテキスト切り替えを必要としません。

- **単一フィールドの更新**: ユーザーがリスト内のアイテムの名前を変更したり、レコードの特定のプロパティを更新したりする場合があります。このアクションは軽微であり、新しいページや URL を必要としません。

- **リストからのレコードの削除**: リストビューで、ユーザーがアイテムを削除した場合、そのアイテムがリストからなくなり、リストビューにとどまることを期待するでしょう。

- **リストビューでのレコードの作成**: リストに新しいアイテムを追加する場合、ユーザーがそのコンテキストにとどまり、ページ全体の遷移なしに新しいアイテムがリストに追加されるのを見るのが理にかなっていることがよくあります。

- **ポップオーバーまたはコンボボックスのデータ読み込み**: ポップオーバーまたはコンボボックスのデータを読み込む場合、ユーザーのコンテキストは変更されません。データはバックグラウンドで読み込まれ、小さく自己完結型の UI エレメントに表示されます。

このようなアクションには、[`useFetcher`][use-fetcher] が最適な API です。これは汎用性が高く、これらの API の機能を組み合わせており、URL を変更すべきでないタスクに完全に適しています。

## API の比較

ご覧のとおり、これら2つの API セットには多くの類似点があります。

| ナビゲーション/URL API        | Fetcher API          |
| ----------------------------- | -------------------- |
| `<Form>`                      | `<fetcher.Form>`     |
| `actionData` (component prop) | `fetcher.data`       |
| `navigation.state`            | `fetcher.state`      |
| `navigation.formAction`       | `fetcher.formAction` |
| `navigation.formData`         | `fetcher.formData`   |

## 例

### 新しいレコードの作成

```tsx filename=app/pages/new-recipe.tsx lines=[16,23-24,29]
import {
  Form,
  redirect,
  useNavigation,
} from "react-router";
import type { Route } from "./+types/new-recipe";

export async function action({
  request,
}: Route.ActionArgs) {
  const formData = await request.formData();
  const errors = await validateRecipeFormData(formData);
  if (errors) {
    return { errors };
  }
  const recipe = await db.recipes.create(formData);
  return redirect(`/recipes/${recipe.id}`);
}

export function NewRecipe({
  actionData,
}: Route.ComponentProps) {
  const { errors } = actionData || {};
  const navigation = useNavigation();
  const isSubmitting =
    navigation.formAction === "/recipes/new";

  return (
    <Form method="post">
      <label>
        Title: <input name="title" />
        {errors?.title ? <span>{errors.title}</span> : null}
      </label>
      <label>
        Ingredients: <textarea name="ingredients" />
        {errors?.ingredients ? (
          <span>{errors.ingredients}</span>
        ) : null}
      </label>
      <label>
        Directions: <textarea name="directions" />
        {errors?.directions ? (
          <span>{errors.directions}</span>
        ) : null}
      </label>
      <button type="submit">
        {isSubmitting ? "Saving..." : "Create Recipe"}
      </button>
    </Form>
  );
}
```

この例では、[`<Form>`][form-component]、component props、および [`useNavigation`][use-navigation] を活用して、直感的なレコード作成プロセスを促進しています。

`<Form>` を使用することで、直接的で論理的なナビゲーションが保証されます。レコードを作成した後、ユーザーは新しいレシピの一意の URL に自然に誘導され、アクションの結果が強化されます。

component props はサーバーとクライアントを橋渡しし、送信の問題に関する即時のフィードバックを提供します。この迅速な応答により、ユーザーは障害なくエラーを修正できます。

最後に、`useNavigation` はフォームの送信状態を動的に反映します。ボタンのラベルの切り替えのようなこの微妙な UI の変更は、ユーザーにアクションが処理中であることを保証します。

これらの API を組み合わせることで、構造化されたナビゲーションとフィードバックのバランスの取れたブレンドが提供されます。

### レコードの更新

次に、各アイテムに削除ボタンがあるレシピのリストを見ているとします。ユーザーが削除ボタンをクリックしたとき、データベースからレシピを削除し、リストからそれを削除したいのですが、リストからナビゲートせずに削除したいとします。

まず、ページにレシピのリストを表示するための基本的なルート設定を考えてみましょう。

```tsx filename=app/pages/recipes.tsx
import type { Route } from "./+types/recipes";

export async function loader({
  request,
}: Route.LoaderArgs) {
  return {
    recipes: await db.recipes.findAll({ limit: 30 }),
  };
}

export default function Recipes({
  loaderData,
}: Route.ComponentProps) {
  const { recipes } = loaderData;
  return (
    <ul>
      {recipes.map((recipe) => (
        <RecipeListItem key={recipe.id} recipe={recipe} />
      ))}
    </ul>
  );
}
```

次に、レシピを削除する action と、リスト内の各レシピをレンダリングする component を見ていきましょう。

```tsx filename=app/pages/recipes.tsx lines=[10,21,27]
import { useFetcher } from "react-router";
import type { Recipe } from "./recipe.server";
import type { Route } from "./+types/recipes";

export async function action({
  request,
}: Route.ActionArgs) {
  const formData = await request.formData();
  const id = formData.get("id");
  await db.recipes.delete(id);
  return { ok: true };
}

export default function Recipes() {
  return (
    // ...
    // doesn't matter, somewhere it's using <RecipeListItem />
  )
}

function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== "idle";

  return (
    <li>
      <h2>{recipe.title}</h2>
      <fetcher.Form method="post">
        <input type="hidden" name="id" value={recipe.id} />
        <button disabled={isDeleting} type="submit">
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </fetcher.Form>
    </li>
  );
}
```

このシナリオでは、[`useFetcher`][use-fetcher] が完璧に機能します。ナビゲートしたりページ全体をリフレッシュしたりするのではなく、インプレースでの更新が必要な場合です。ユーザーがレシピを削除すると、`action` が呼び出され、fetcher が対応する state 遷移を管理します。

ここでの主な利点は、コンテキストの維持です。削除が完了しても、ユーザーはリスト上に留まります。fetcher の state 管理機能はリアルタイムのフィードバックを提供するために活用されます。ボタンのラベルを `"Deleting..."` と `"Delete"` の間で切り替えることで、進行中のプロセスを明確に示します。

さらに、各 `fetcher` が独自の state を管理する自律性を持つため、個々のリストアイテムに対する操作は独立しており、あるアイテムに対するアクションが他のアイテムに影響を与えないようにします（ただし、ページのデータの再検証は [Network Concurrency Management][network-concurrency-management] でカバーされる共有の懸念事項です）。

本質的に、`useFetcher` は、URL やナビゲーションの変更を必要としないアクションに対してシームレスなメカニズムを提供し、リアルタイムのフィードバックとコンテキストの保持を提供することでユーザーエクスペリエンスを向上させます。

### 記事を既読にする

ユーザーがページにしばらく滞在し、下部までスクロールした後、その記事を現在のユーザーが読んだことをマークしたいと想像してみてください。次のような hook を作成できます。

```tsx
import { useFetcher } from "react-router";

function useMarkAsRead({ articleId, userId }) {
  const marker = useFetcher();

  useSpentSomeTimeHereAndScrolledToTheBottom(() => {
    marker.submit(
      { userId },
      {
        action: `/article/${articleId}/mark-as-read`,
        method: "post",
      },
    );
  });
}
```

### ユーザーアバターの詳細ポップアップ

ユーザーアバターを表示するたびに、ホバーエフェクトを設定して、loader からデータをフェッチし、ポップアップに表示できます。

```tsx filename=app/pages/user-details.tsx
import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/user-details";

export async function loader({ params }: Route.LoaderArgs) {
  return await fakeDb.user.find({
    where: { id: params.id },
  });
}

type LoaderData = Route.ComponentProps["loaderData"];

function UserAvatar({ partialUser }) {
  const userDetails = useFetcher<LoaderData>();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (
      showDetails &&
      userDetails.state === "idle" &&
      !userDetails.data
    ) {
      userDetails.load(`/user-details/${partialUser.id}`);
    }
  }, [showDetails, userDetails, partialUser.id]);

  return (
    <div
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <img src={partialUser.profileImageUrl} />
      {showDetails ? (
        userDetails.state === "idle" && userDetails.data ? (
          <UserPopup user={userDetails.data} />
        ) : (
          <UserPopupLoading />
        )
      ) : null}
    </div>
  );
}
```

## 結論

React Router は、さまざまな開発ニーズに対応するための幅広いツールを提供しています。一部の機能は重複しているように見えるかもしれませんが、各ツールは特定のシナリオを念頭に置いて設計されています。`<Form>`、`useFetcher`、`useNavigation` の複雑さ、および理想的なアプリケーション、そして component props を介してデータがどのように流れるかを理解することで、開発者はより直感的で応答性が高く、ユーザーフレンドリーなウェブアプリケーションを作成できます。

[form-component]: ../api/components/Form
[use-fetcher]: ../api/hooks/useFetcher
[use-navigation]: ../api/hooks/useNavigation
[network-concurrency-management]: ./concurrency