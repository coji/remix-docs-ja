---
title: Form vs. fetcher
---

# Form vs. fetcher

[MODES: framework, data]

## 概要

React Routerでの開発では、機能が重複しているように見える豊富なツールセットが提供されており、初心者にとっては曖昧さを感じることがあります。React Routerで効果的な開発を行うための鍵は、各ツールのニュアンスと適切なユースケースを理解することです。このドキュメントは、特定のAPIをいつ、なぜ使用すべきかについて明確にすることを目指しています。

## 注目するAPI

- [`<Form>`][form-component]
- [`useFetcher`][use-fetcher]
- [`useNavigation`][use-navigation]

これらのAPIの区別と相互関係を理解することは、効率的で効果的なReact Router開発にとって不可欠です。

## URLに関する考慮事項

これらのツールを選択する際の主要な基準は、URLを変更したいかどうかです。

- **URLの変更を希望する場合**: ページのナビゲーションや遷移、またはレコードの作成や削除などの特定のアクションの後。これにより、ユーザーのブラウザ履歴がアプリケーション内での移動を正確に反映するようになります。

  - **期待される動作**: 多くの場合、ユーザーが戻るボタンを押すと、前のページに戻るべきです。他の場合では履歴エントリが置き換えられることもありますが、それでもURLの変更は重要です。

- **URLの変更を希望しない場合**: 現在のビューのコンテキストや主要なコンテンツを大きく変更しないアクションの場合。これには、個々のフィールドの更新や、新しいURLやページの再読み込みを必要としない軽微なデータ操作が含まれる場合があります。これは、ポップオーバーやコンボボックスなどのためにフェッチャーでデータをロードする場合にも適用されます。

### URLを変更すべき場合

これらのアクションは通常、ユーザーのコンテキストや状態に大きな変更を反映します。

- **新しいレコードの作成**: 新しいレコードを作成した後、ユーザーをその新しいレコード専用のページにリダイレクトし、そこで表示したりさらに変更したりするのが一般的です。

- **レコードの削除**: ユーザーが特定のレコード専用のページにいて、それを削除することを決定した場合、論理的な次のステップは、すべてのレコードのリストなど、一般的なページにリダイレクトすることです。

これらのケースでは、開発者は[`<Form>`][form-component]と[`useNavigation`][use-navigation]の組み合わせを使用することを検討すべきです。これらのツールは、フォームの送信を処理し、特定のアクションを呼び出し、コンポーネントのプロパティを介してアクション関連のデータを取得し、それぞれナビゲーションを管理するために連携させることができます。

### URLを変更すべきでない場合

これらのアクションは一般的に、より微妙であり、ユーザーのコンテキスト切り替えを必要としません。

- **単一フィールドの更新**: ユーザーがリスト内のアイテムの名前を変更したり、レコードの特定のプロパティを更新したりしたい場合。このアクションは軽微であり、新しいページやURLを必要としません。

- **リストからのレコードの削除**: リストビューでユーザーがアイテムを削除した場合、そのアイテムがリストからなくなり、リストビューに留まることを期待するでしょう。

- **リストビューでのレコードの作成**: リストに新しいアイテムを追加する場合、ユーザーがそのコンテキストに留まり、ページ全体の遷移なしに新しいアイテムがリストに追加されるのを見るのが理にかなっていることがよくあります。

- **ポップオーバーまたはコンボボックスのデータ読み込み**: ポップオーバーまたはコンボボックスのデータを読み込む際、ユーザーのコンテキストは変更されません。データはバックグラウンドで読み込まれ、小さく自己完結型のUI要素に表示されます。

このようなアクションには、[`useFetcher`][use-fetcher]が最適なAPIです。これは多機能であり、これらのAPIの機能を組み合わせ、URLを変更すべきでないタスクに完全に適しています。

## APIの比較

ご覧のとおり、2つのAPIセットには多くの類似点があります。

| Navigation/URL API            | Fetcher API          |
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

この例では、[`<Form>`][form-component]、コンポーネントプロパティ、および[`useNavigation`][use-navigation]を活用して、直感的なレコード作成プロセスを促進しています。

`<Form>`を使用することで、直接的かつ論理的なナビゲーションが保証されます。レコード作成後、ユーザーは自然に新しいレシピの一意のURLに誘導され、アクションの結果が強化されます。

コンポーネントプロパティはサーバーとクライアントを橋渡しし、送信の問題に関する即時フィードバックを提供します。この迅速な応答により、ユーザーは妨げられることなくエラーを修正できます。

最後に、`useNavigation`はフォームの送信状態を動的に反映します。ボタンのラベルを切り替えるようなこの微妙なUI変更は、ユーザーにアクションが処理されていることを保証します。

これらのAPIを組み合わせることで、構造化されたナビゲーションとフィードバックのバランスの取れた組み合わせが提供されます。

### レコードの更新

次に、各アイテムに削除ボタンがあるレシピのリストを見ているとします。ユーザーが削除ボタンをクリックしたとき、データベースからレシピを削除し、リストから削除したいが、リストから移動したくありません。

まず、ページにレシピのリストを取得するための基本的なルート設定を検討します。

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

次に、レシピを削除するアクションと、リスト内の各レシピをレンダリングするコンポーネントを見ていきます。

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

このシナリオで[`useFetcher`][use-fetcher]を使用すると完璧に機能します。ページから移動したり、ページ全体をリフレッシュしたりする代わりに、インプレース更新を望んでいます。ユーザーがレシピを削除すると、`action`が呼び出され、フェッチャーが対応する状態遷移を管理します。

ここでの主な利点は、コンテキストの維持です。削除が完了しても、ユーザーはリストに留まります。フェッチャーの状態管理機能は、リアルタイムのフィードバックを提供するために活用されます。つまり、`"Deleting..."`と`"Delete"`を切り替えることで、進行中のプロセスを明確に示します。

さらに、各`fetcher`が独自のステートを管理する自律性を持つことで、個々のリストアイテムに対する操作が独立し、あるアイテムに対するアクションが他のアイテムに影響を与えないようにします（ただし、ページデータの再検証は[ネットワーク同時実行管理][network-concurrency-management]でカバーされる共通の懸念事項です）。

要するに、`useFetcher`は、URLの変更やナビゲーションを必要としないアクションに対してシームレスなメカニズムを提供し、リアルタイムのフィードバックとコンテキストの維持によってユーザーエクスペリエンスを向上させます。

### 記事を既読にする

ユーザーがしばらくページに滞在し、一番下までスクロールした後、その記事を現在のユーザーが読んだとマークしたいとします。次のようなフックを作成できます。

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

### ユーザーアバター詳細ポップアップ

ユーザーアバターを表示するたびに、ローダーからデータをフェッチしてポップアップに表示するホバーエフェクトを付けることができます。

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

React Routerは、さまざまな開発ニーズに対応するための幅広いツールを提供します。一部の機能は重複しているように見えるかもしれませんが、各ツールは特定のシナリオを念頭に置いて作成されています。`<Form>`、`useFetcher`、`useNavigation`の複雑さと理想的なアプリケーション、およびコンポーネントのプロパティを介してデータがどのように流れるかを理解することで、開発者はより直感的で応答性が高く、ユーザーフレンドリーなWebアプリケーションを作成できます。

[form-component]: ../api/components/Form
[use-fetcher]: ../api/hooks/useFetcher
[use-navigation]: ../api/hooks/useNavigation
[network-concurrency-management]: ./concurrency