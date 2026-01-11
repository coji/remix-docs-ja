---
title: Index クエリパラメーター
---

# Index クエリパラメーター

[MODES: framework, data]

## 概要

フォームを送信する際、アプリのURLに思わぬ `?index` が現れることがあります。

ネストされたルートのため、ルーティング階層内の複数のルートがそのURLにマッチする可能性があります。マッチするすべてのルートの [`loader`][loader] が呼び出されてUIを構築するナビゲーションとは異なり、[`form`][form_element] が送信される際には、_1つの `action` のみが呼び出されます_。

`index route` はその `parent` と同じURLを共有するため、`?index` パラメーターによって両者を区別できます。

## Index ルートの理解

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

これにより、`/projects` にマッチする2つのルートが作成されます。

- `parent route` (`./pages/projects.tsx`)
- `index route` (`./pages/projects/index.tsx`)

## フォーム送信のターゲット指定

例えば、以下の `form` を考えてみましょう。

```tsx
<Form method="post" action="/projects" />
<Form method="post" action="/projects?index" />
```

`?index` パラメーターは `index route` に送信され、`index` パラメーターのない `action` は `parent route` に送信されます。

`action` のない [`<Form>`][form_component] が `index route` でレンダリングされると、`?index` パラメーターが自動的に追加され、`form` が `index route` に `post` されるようになります。以下の `form` は、送信されると`/projects?index` に `post` されます。これは `projects` `index route` のコンテキストでレンダリングされているためです。

```tsx filename=app/pages/projects/index.tsx
function ProjectsIndex() {
  return <Form method="post" />;
}
```

このコードをプロジェクトのレイアウト（この例では `./pages/projects.tsx`）に移動した場合、代わりに `/projects` に `post` されます。

これは `<Form>` と、その関連するすべての `hook` や `component` に適用されます。

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