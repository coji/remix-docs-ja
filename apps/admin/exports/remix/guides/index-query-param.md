---
title: インデックスクエリパラメータ
toc: false
---

# インデックスクエリパラメータ

フォームを送信する際に、アプリのURLに `?index` という見慣れないものが現れることがあります。

ネストされたルートのため、ルート階層内の複数のルートがURLに一致する可能性があります。UIを構築するために一致するすべてのルートの[`loader`][loader]が呼び出されるナビゲーションとは異なり、[`form`][form_element]が送信されると、_1つのアクションのみが呼び出されます_。

インデックスルートは親と同じURLを共有するため、`?index` パラメータを使用すると、2つを区別できます。

たとえば、次のフォームを考えてみましょう。

```tsx
<Form method="post" action="/projects" />;
<Form method="post" action="/projects?index" />;
```

`?index` パラメータはインデックスルートに送信し、インデックスパラメータのない[`action`][form_component_action]は親ルートに送信します。

[`<Form>`][form_component]が[`action`][action]なしでインデックスルートでレンダリングされると、フォームがインデックスルートにポストされるように、`?index` パラメータが自動的に追加されます。次のフォームは、プロジェクトのインデックスルートのコンテキストでレンダリングされるため、送信されると `/projects?index` にポストされます。

```tsx filename=app/routes/projects._index.tsx
function ProjectsIndex() {
  return <Form method="post" />;
}
```

コードを `ProjectsLayout` ルートに移動すると、代わりに `/projects` にポストされます。

これは `<Form>` とそのすべての親戚に適用されます。

```tsx
function Component() {
  const submit = useSubmit();
  submit({}, { action: "/projects" });
  submit({}, { action: "/projects?index" });
}
```

```tsx
function Component() {
  const fetcher = useFetcher();
  fetcher.submit({}, { action: "/projects" });
  fetcher.submit({}, { action: "/projects?index" });
  <fetcher.Form action="/projects" />;
  <fetcher.Form action="/projects?index" />;
  <fetcher.Form />; // コンテキスト内のルートをデフォルトとする
}
```

[loader]: ../route/loader
[form_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
[form_component_action]: ../components/form#action
[form_component]: ../components/form
[action]: ../route/action

