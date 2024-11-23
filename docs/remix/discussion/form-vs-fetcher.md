---
title: フォーム vs. フェッチャー
---

# フォーム vs. フェッチャー

Remixでの開発では、機能が重複するツールが多く提供されるため、初心者にとっては混乱を招く可能性があります。Remixで効果的な開発を行うための鍵は、それぞれのツールのニュアンスと適切なユースケースを理解することです。このドキュメントでは、いつ、なぜ特定のAPIを使用するかについて明確に説明することを目指しています。

## 注目すべきAPI

- [`<Form>`][form_component]
- [`useActionData`][use_action_data]
- [`useFetcher`][use_fetcher]
- [`useNavigation`][use_navigation]

これらのAPIの区別と交差を理解することは、効率的で効果的なRemix開発にとって不可欠です。

### URLに関する考慮事項

これらのツールから選択する際の主な基準は、URLを変更するかどうかです。

- **URLの変更を希望する場合**: ページ間を移動したり、レコードの作成や削除など特定のアクションを実行した後など。これにより、ユーザーのブラウザの履歴がアプリケーション内での移動を正確に反映します。

  - **期待される動作**: 多くの場合、ユーザーが戻るボタンを押すと、前のページに戻ります。履歴エントリは置換される場合もありますが、URLの変更は依然として重要です。

- **URLの変更を希望しない場合**: 現行のビューのコンテキストまたは主要なコンテンツを大きく変更しないアクションの場合。これは、個々のフィールドの更新や、新しいURLまたはページの再読み込みを必要としないマイナーなデータ操作など、さまざまな状況に当てはまります。これは、ポッパー、コンボボックスなどのためにフェッチャーを使用してデータを読み込む場合にも当てはまります。

### 特定のユースケース

#### URLを変更する必要がある場合

これらのアクションは、通常、ユーザーのコンテキストまたは状態の大きな変更を反映します。

- **新規レコードの作成**: 新規レコードを作成した後、ユーザーをその新規レコード専用のページにリダイレクトするのが一般的です。そこで、ユーザーはレコードを表示したり、さらに変更したりできます。

- **レコードの削除**: ユーザーが特定のレコード専用のページにいて、レコードを削除することを決定した場合、論理的な次のステップは、すべてのレコードのリストなどの一般的なページにリダイレクトすることです。

これらのケースでは、開発者は[`<Form>`][form_component]、[`useActionData`][use_action_data]、および[`useNavigation`][use_navigation]を組み合わせることを検討する必要があります。これらの各ツールは、それぞれ、フォーム送信の処理、特定のアクションの実行、アクション関連データの取得、およびナビゲーションの管理を連携して行うことができます。

#### URLを変更する必要がない場合

これらのアクションは、一般的により微妙で、ユーザーのコンテキストの切り替えを必要としません。

- **単一フィールドの更新**: ユーザーがリスト内のアイテムの名前を変更したり、レコードの特定のプロパティを更新したりする場合など。このアクションはマイナーなものであり、新しいページやURLを必要としません。

- **リストからのレコードの削除**: リストビューでユーザーがアイテムを削除した場合、ユーザーはリストビューにとどまり、そのアイテムがリストから削除されることを期待します。

- **リストビューでのレコードの作成**: リストに新しいアイテムを追加する場合、ユーザーがリストのコンテキストにとどまり、新しいアイテムがリストに追加されたことを、ページ全体を遷移することなく確認するのが理にかなっています。

- **ポッパーまたはコンボボックスのデータの読み込み**: ポッパーまたはコンボボックスのデータを読み込む場合、ユーザーのコンテキストは変更されません。データはバックグラウンドで読み込まれ、小さく、独立したUI要素に表示されます。

このようなアクションの場合、[`useFetcher`][use_fetcher]は、最適なAPIです。これは、他の4つのAPIの機能を組み合わせた汎用的なものであり、URLを変更する必要のないタスクに最適です。

## API比較

ご覧のとおり、2つのAPIセットには多くの類似点があります。

| ナビゲーション/URL API      | フェッチャーAPI          |
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
        タイトル: <input name="title" />
        {errors?.title ? <span>{errors.title}</span> : null}
      </label>
      <label>
        材料: <textarea name="ingredients" />
        {errors?.ingredients ? (
          <span>{errors.ingredients}</span>
        ) : null}
      </label>
      <label>
        作り方: <textarea name="directions" />
        {errors?.directions ? (
          <span>{errors.directions}</span>
        ) : null}
      </label>
      <button type="submit">
        {isSubmitting ? "保存中..." : "レシピを作成"}
      </button>
    </Form>
  );
}
```

この例では、[`<Form>`][form_component]、[`useActionData`][use_action_data]、および[`useNavigation`][use_navigation]を活用して、直感的なレコード作成プロセスを実現しています。

`<Form>`を使用すると、直接的で論理的なナビゲーションが保証されます。レコードを作成した後、ユーザーは自動的に新しいレシピのユニークなURLに案内され、アクションの結果が強化されます。

`useActionData`は、サーバーとクライアントを橋渡しし、送信に関する問題の即時のフィードバックを提供します。この迅速な対応により、ユーザーは妨げられることなくエラーを修正できます。

最後に、`useNavigation`は、フォームの送信状態を動的に反映します。ボタンのラベルを切り替えるなど、この微妙なUIの変更により、ユーザーは自分のアクションが処理されていることを確認できます。

これらすべてのAPIを組み合わせることで、構造化されたナビゲーションとフィードバックのバランスの取れたブレンドを提供します。

### レコードの更新

次に、レシピのリストが表示され、各アイテムに削除ボタンが付いている状況を考えます。ユーザーが削除ボタンをクリックすると、レシピをデータベースから削除し、リストから削除しますが、リストから移動することはありません。

まず、ページにレシピのリストを取得するための基本的なルーティング設定を考えます。

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

次に、レシピを削除するアクションと、リストの各レシピをレンダリングするコンポーネントを見ていきましょう。

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

このシナリオでは、[`useFetcher`][use_fetcher]を使用すると完璧に機能します。ページ全体を移動したり、更新したりするのではなく、その場で更新したいと考えています。ユーザーがレシピを削除すると、アクションが呼び出され、フェッチャーが対応する状態遷移を管理します。

ここでの主な利点は、コンテキストを維持することです。ユーザーは削除が完了してもリストにとどまります。フェッチャーの状態管理機能を活用して、リアルタイムのフィードバックを提供します。`"削除中..."`と`"削除"`の間を切り替えることで、進行中のプロセスを明確に示します。

さらに、各フェッチャーは自分の状態を管理する自律性を持ち、個々のリストアイテムに対する操作が独立したままになります。これにより、あるアイテムに対するアクションが他のアイテムに影響を与えないことが保証されます（ただし、ページデータの再検証は、[ネットワークコンカレンシー管理][network_concurrency_management]で説明されている共有の懸念事項です）。

本質的に、`useFetcher`は、URLの変更やナビゲーションを必要としないアクションのためのシームレスなメカニズムを提供し、リアルタイムのフィードバックとコンテキストの保持を提供することで、ユーザーエクスペリエンスを向上させます。

### 記事を既読にする

ユーザーがしばらくページにいて、一番下までスクロールした後、記事を既読としてマークしたいとします。次のようなフックを作成することができます。

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

### ユーザーのアバター詳細ポップアップ

ユーザーのアバターを表示するたびに、ローダーからデータを取得してポップアップに表示するホバー効果を追加することができます。

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

## まとめ

Remixは、さまざまな開発ニーズに対応する幅広いツールを提供しています。いくつかの機能が重複しているように見えるかもしれませんが、各ツールは特定のシナリオを念頭に置いて作られています。`<Form>`、`useActionData`、`useFetcher`、および`useNavigation`の複雑さと理想的なアプリケーションを理解することで、開発者はより直感的で、反応が良く、ユーザーフレンドリーなWebアプリケーションを作成できます。

[form_component]: ../components/form
[use_action_data]: ../hooks/use-action-data
[use_fetcher]: ../hooks/use-fetcher
[use_navigation]: ../hooks/use-navigation
[network_concurrency_management]: ./concurrency


