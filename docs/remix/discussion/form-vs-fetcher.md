---
title: Form vs. fetcher
---

# Form vs. fetcher

Remixでの開発は、機能が重複することがある豊富なツールセットを提供しており、新規参入者にとっては曖昧さを感じることがあります。Remixで効果的な開発を行うための鍵は、各ツールのニュアンスと適切なユースケースを理解することです。このドキュメントでは、特定APIをいつ、なぜ使用するのかについて明確にすることを目的としています。

## 注目のAPI

* [`<Form>`][form_component]
* [`useActionData`][use_action_data]
* [`useFetcher`][use_fetcher]
* [`useNavigation`][use_navigation]

これらのAPIの区別と交差点を理解することは、効率的かつ効果的なRemix開発にとって不可欠です。

### URLに関する考慮事項

これらのツールを選択する際の主な基準は、URLを変更したいかどうかです。

* **URL変更が必要な場合**: ページ間を移動または遷移する場合、あるいはレコードの作成や削除などの特定のアクションの後。これにより、ユーザーのブラウザ履歴がアプリケーション内での移動を正確に反映します。

  * **期待される動作**: 多くの場合、ユーザーが戻るボタンを押すと、前のページに戻る必要があります。場合によっては履歴エントリが置き換えられることもありますが、それでもURLの変更は重要です。

* **URL変更が不要な場合**: 現在のビューのコンテキストや主要なコンテンツを大幅に変更しないアクションの場合。これには、新しいURLやページのリロードを必要としない、個々のフィールドの更新や軽微なデータ操作が含まれる場合があります。これは、ポップオーバーやコンボボックスなどのためにフェッチャーでデータをロードする場合にも当てはまります。

### 具体的なユースケース

#### URLを変更すべき時

これらのアクションは通常、ユーザーのコンテキストや状態の重要な変化を反映します。

* **新規レコードの作成**: 新規レコードを作成した後、ユーザーをその新しいレコード専用のページにリダイレクトし、そこで閲覧やさらなる変更ができるようにするのが一般的です。

* **レコードの削除**: ユーザーが特定のレコード専用のページにいて、それを削除することにした場合、論理的な次のステップは、すべてのレコードのリストなど、一般的なページにリダイレクトすることです。

これらのケースでは、開発者は[`<Form>`][form_component]、[`useActionData`][use_action_data]、[`useNavigation`][use_navigation]の組み合わせを使用することを検討すべきです。これらのツールはそれぞれ、フォームの送信処理、特定のアクションの呼び出し、アクション関連データの取得、ナビゲーションの管理を連携して行うことができます。

#### URLを変更すべきでない場合

これらのアクションは一般的に、より微妙で、ユーザーのコンテキストスイッチを必要としません。

* **単一フィールドの更新**: 例えば、ユーザーがリスト内のアイテムの名前を変更したり、レコードの特定のプロパティを更新したい場合などです。このアクションは軽微であり、新しいページやURLを必要としません。

* **リストからのレコードの削除**: リストビューで、ユーザーがアイテムを削除した場合、そのアイテムがリストからなくなった状態で、リストビューに留まることを期待するでしょう。

* **リストビューでのレコードの作成**: リストに新しいアイテムを追加する場合、ユーザーがそのコンテキストに留まり、新しいアイテムがページ全体を遷移することなくリストに追加されるのを見るのが理にかなっていることが多いです。

* **ポップオーバーまたはコンボボックスのデータの読み込み**: ポップオーバーまたはコンボボックスのデータを読み込む場合、ユーザーのコンテキストは変わりません。データはバックグラウンドで読み込まれ、小さく自己完結型のUI要素に表示されます。

このようなアクションには、[`useFetcher`][use_fetcher]が最適なAPIです。これは他の4つのAPIの機能を組み合わせた多用途なAPIであり、URLを変更すべきでないタスクに最適です。

## API比較

ご覧のとおり、2つのAPIセットには多くの類似点があります。

| ナビゲーション/URL API      | Fetcher API          |
| ----------------------- | -------------------- |
| `<Form>`                | `<fetcher.Form>`     |
| `useActionData()`       | `fetcher.data`       |
| `navigation.state`      | `fetcher.state`      |
| `navigation.formAction` | `fetcher.formAction` |
| `navigation.formData`   | `fetcher.formData`   |

## 例

### 新規レコードの作成

```tsx filename=app/routes/recipes/new.tsx lines=[18,22-23,28]
import type { ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { redirect } from "@remix-run/node"; // or cloudflare/deno
import {
  Form,
  useActionData,
  useNavigation,
} from "@remix-run/react";

export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const errors = await validateRecipeFormData(formData);
  if (errors) {
    return json({ errors });
  }
  const recipe = await db.recipes.create(formData);
  return redirect(`/recipes/${recipe.id}`);
}

export function NewRecipe() {
  const { errors } = useActionData<typeof action>();
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

この例では、[`<Form>`][form_component]、[`useActionData`][use_action_data]、および[`useNavigation`][use_navigation]を活用して、直感的なレコード作成プロセスを容易にしています。

`<Form>`を使用することで、直接的で論理的なナビゲーションが保証されます。レコードを作成した後、ユーザーは自然に新しいレシピの一意のURLに誘導され、アクションの結果が強化されます。

`useActionData`はサーバーとクライアントを橋渡しし、送信に関する問題について即座にフィードバックを提供します。この迅速な応答により、ユーザーは妨げられることなくエラーを修正できます。

最後に、`useNavigation`はフォームの送信状態を動的に反映します。ボタンのラベルを切り替えるなどの微妙なUIの変更は、ユーザーにアクションが処理されていることを保証します。

これらのAPIを組み合わせることで、構造化されたナビゲーションとフィードバックのバランスの取れた組み合わせが提供されます。

### レコードの更新

次に、各項目に削除ボタンがあるレシピのリストを見ていると仮定します。ユーザーが削除ボタンをクリックすると、データベースからレシピを削除し、リストから削除して、リストから移動しないようにします。

まず、ページにレシピのリストを取得するための基本的なルート設定を検討します。

```tsx filename=app/routes/recipes/_index.tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno
import { useLoaderData } from "@remix-run/react";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  return json({
    recipes: await db.recipes.findAll({ limit: 30 }),
  });
}

export default function Recipes() {
  const { recipes } = useLoaderData<typeof loader>();
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

```tsx filename=app/routes/recipes/_index.tsx lines=[7,13,19]
export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get("id");
  await db.recipes.delete(id);
  return json({ ok: true });
}

const RecipeListItem: FunctionComponent<{
  recipe: Recipe;
}> = ({ recipe }) => {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== "idle";

  return (
    <li>
      <h2>{recipe.title}</h2>
      <fetcher.Form method="post">
        <button disabled={isDeleting} type="submit">
          {isDeleting ? "削除中..." : "削除"}
        </button>
      </fetcher.Form>
    </li>
  );
};
```

このシナリオで[`useFetcher`][use_fetcher]を使用すると、完全に機能します。ページ全体を移動したり更新したりする代わりに、インプレース更新が必要です。ユーザーがレシピを削除すると、アクションが呼び出され、フェッチャーが対応する状態遷移を管理します。

ここでの主な利点は、コンテキストの維持です。削除が完了すると、ユーザーはリストにとどまります。フェッチャーの状態管理機能は、リアルタイムのフィードバックを提供するために活用されます。`"削除中..."`と`"削除"`を切り替えることで、進行中のプロセスを明確に示します。

さらに、各フェッチャーが独自の状態を管理する自律性を持つことで、個々のリスト項目の操作が独立し、1つの項目に対するアクションが他の項目に影響を与えないようにします（ただし、ページデータの再検証は、[ネットワーク同時実行管理][network_concurrency_management]で説明されている共有の懸念事項です）。

要するに、`useFetcher`は、URLの変更やナビゲーションを必要としないアクションのためのシームレスなメカニズムを提供し、リアルタイムのフィードバックとコンテキストの保持を提供することで、ユーザーエクスペリエンスを向上させます。

### 記事を既読にする

ユーザーがページにしばらく滞在し、一番下までスクロールした後、記事を現在のユーザーによって既読にしたとマークしたいと想像してください。次のようなフックを作成できます。

```tsx
function useMarkAsRead({ articleId, userId }) {
  const marker = useFetcher();

  useSpentSomeTimeHereAndScrolledToTheBottom(() => {
    marker.submit(
      { userId },
      {
        action: `/article/${articleId}/mark-as-read`,
        method: "post",
      }
    );
  });
}
```

### ユーザーアバター詳細ポップアップ

ユーザーアバターを表示する際は、ローダーからデータを取得し、ポップアップで表示するホバーエフェクトを追加できます。

```tsx filename=app/routes/users.$id.details.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  return json(
    await fakeDb.user.find({ where: { id: params.id } })
  );
}

function UserAvatar({ partialUser }) {
  const userDetails = useFetcher<typeof loader>();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (
      showDetails &&
      userDetails.state === "idle" &&
      !userDetails.data
    ) {
      userDetails.load(`/users/${user.id}/details`);
    }
  }, [showDetails, userDetails]);

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

Remixは、多様な開発ニーズに対応するための幅広いツールを提供しています。いくつかの機能は重複しているように見えるかもしれませんが、各ツールは特定のシナリオを念頭に置いて作成されています。`<Form>`、`useActionData`、`useFetcher`、`useNavigation`の複雑さと理想的なアプリケーションを理解することで、開発者はより直感的で、レスポンシブで、ユーザーフレンドリーなWebアプリケーションを作成できます。

[form_component]: ../components/form

[use_action_data]: ../hooks/use-action-data

[use_fetcher]: ../hooks/use-fetcher

[use_navigation]: ../hooks/use-navigation

[network_concurrency_management]: ./concurrency
