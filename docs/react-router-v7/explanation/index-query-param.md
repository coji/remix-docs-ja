---
title: インデックスクエリパラメータ
---

# インデックスクエリパラメータ

[MODES: framework, data]

## 概要

フォームを送信する際、アプリのURLに`?index`が突然現れることがあります。

ネストされたルートのため、ルート階層内の複数のルートがURLに一致する可能性があります。UIを構築するために一致するすべてのルートの[`loader`][loader]が呼び出されるナビゲーションとは異なり、[`form`][form_element]が送信されると、_1つのアクションのみが呼び出されます_。

インデックスルートは親と同じURLを共有するため、`?index`パラメータを使用すると、この2つを区別できます。

## インデックスルートの理解

例えば、以下のルート構造を考えてみましょう。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  route("projects", "./pages/projects.tsx", [
    index("./pages/projects/index.tsx"),
    route(":id", "./pages/projects/project.tsx"),
  ]),
] satisfies RouteConfig;
```

これにより、`/projects`に一致する2つのルートが作成されます。

- 親ルート (`./pages/projects.tsx`)
- インデックスルート (`./pages/projects/index.tsx`)

## フォーム送信のターゲット指定

例えば、以下のフォームを考えてみましょう。

```tsx
<Form method="post" action="/projects" />
<Form method="post" action="/projects?index" />
```

`?index`パラメータはインデックスルートに送信され、インデックスパラメータのないアクションは親ルートに送信されます。

[`<Form>`][form_component]がインデックスルートで[`action`][action]なしでレンダリングされると、フォームがインデックスルートにポストされるように`?index`パラメータが自動的に追加されます。以下のフォームは、`projects`インデックスルートのコンテキストでレンダリングされているため、送信されると`/projects?index`にポストされます。

```tsx filename=app/pages/projects/index.tsx
function ProjectsIndex() {
  return <Form method="post" />;
}
```

このコードをプロジェクトレイアウト（この例では`./pages/projects.tsx`）に移動した場合、代わりに`/projects`にポストされます。

これは`<Form>`とそのすべての関連する機能に適用されます。

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
  <fetcher.Form />; // defaults to the route in context
}
```

[loader]: ../api/data-routers/loader
[form_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
[form_component]: ../api/components/Form
[action]: ../api/data-routers/action