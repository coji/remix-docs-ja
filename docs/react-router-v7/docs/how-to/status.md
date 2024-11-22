---
title: ステータスコード
---

# ステータスコード

ローダーとアクションから`data`を使ってステータスコードを設定します。

```tsx filename=app/project.tsx lines=[3,12-15,20,23]
// route('/projects/:projectId', './project.tsx')
import type { Route } from "./+types/project";
import { data } from "react-router";
import { fakeDb } from "../db";

export async function action({
  request,
}: Route.ActionArgs) {
  let formData = await request.formData();
  let title = await formData.get("title");
  if (!title) {
    return data(
      { message: "Invalid title" },
      { status: 400 }
    );
  }

  if (!projectExists(title)) {
    let project = await fakeDb.createProject({ title });
    return data(project, { status: 201 });
  } else {
    let project = await fakeDb.updateProject({ title });
    // デフォルトのステータスコードは200なので、`data`は不要です
    return project;
  }
}
```

このようなフォームエラーのレンダリングについては、[フォーム検証](./form-validation)を参照してください。

もう1つの一般的なステータスコードは404です。

```tsx
// route('/projects/:projectId', './project.tsx')
import type { Route } from "./+types/project";
import { data } from "react-router";
import { fakeDb } from "../db";

export async function loader({ params }: Route.ActionArgs) {
  let project = await fakeDb.getProject(params.id);
  if (!project) {
    // ErrorBoundaryにスローする
    throw data(null, { status: 404 });
  }
  return project;
}
```

スローされた`data`については、[エラーバウンダリ](./error-boundary)を参照してください。

