---
title: インデックスクエリパラメータ
toc: false
---

# インデックスクエリパラメータ

フォームを送信すると、アプリの URL にワイルドな `?index` が表示されることがあります。

ネストされたルートのため、ルート階層内の複数のルートが URL に一致する可能性があります。ナビゲーションでは、一致するすべてのルートの [`loader`][loader] が呼び出されて UI が構築されますが、[`form`][form_element] を送信すると、_1 つのアクションのみが呼び出されます_。

インデックスルートは親ルートと同じ URL を共有するため、`?index` パラメータを使用すると、2 つを区別できます。

たとえば、次のフォームについて考えてみましょう。

```tsx
<Form method="post" action="/projects" />;
<Form method="post" action="/projects?index" />;
```

`?index` パラメータはインデックスルートに送信され、[`action`][form_component_action] にインデックスパラメータがない場合は親ルートに送信されます。

[`<Form>`][form_component] がインデックスルートで [`action`][action] なしでレンダリングされると、`?index` パラメータが自動的に追加され、フォームがインデックスルートに投稿されます。次のフォームは、送信されると `/projects?index` に投稿されます。これは、プロジェクトインデックスルートのコンテキストでレンダリングされるためです。

```tsx filename=app/routes/projects._index.tsx
function ProjectsIndex() {
  return <Form method="post" />;
}
```

コードを `ProjectsLayout` ルートに移動すると、代わりに `/projects` に投稿されます。

これは `<Form>` およびそのすべての仲間にも適用されます。

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
