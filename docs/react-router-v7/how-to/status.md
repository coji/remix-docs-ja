---
title: ステータスコード
---

# ステータスコード

[MODES: framework ,data]

ローダーとアクションから `data` でステータスコードを設定します。

```tsx filename=app/project.tsx lines=[3,12-15,20,23]
// route('/projects/:projectId', './project.tsx')
import type { Route } from "./+types/project";
import { data } from "react-router";
import { fakeDb } from "../db";

export async function action({
  request,
}: Route.ActionArgs) {
  let formData = await request.formData();
  let title = formData.get("title");
  if (!title) {
    return data(
      { message: "無効なタイトル" },
      { status: 400 }
    );
  }

  if (!projectExists(title)) {
    let project = await fakeDb.createProject({ title });
    return data(project, { status: 201 });
  } else {
    let project = await fakeDb.updateProject({ title });
    // デフォルトのステータスコードは 200 なので、`data` は不要です
    return project;
  }
}
```

このようなフォームエラーのレンダリングに関する詳細は、[フォームのバリデーション](./form-validation)を参照してください。

もう1つの一般的なステータスコードは 404 です。

```tsx
// route('/projects/:projectId', './project.tsx')
import type { Route } from "./+types/project";
import { data } from "react-router";
import { fakeDb } from "../db";

export async function loader({ params }: Route.ActionArgs) {
  let project = await fakeDb.getProject(params.id);
  if (!project) {
    // ErrorBoundary に throw する
    throw data(null, { status: 404 });
  }
  return project;
}
```

`data` の throw に関する詳細は、[エラー境界](./error-boundary)を参照してください。