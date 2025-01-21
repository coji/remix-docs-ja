---
title: ステータスコード
---

# ステータスコード

`data` を使用して、ローダーとアクションからステータスコードを設定します。

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
      { message: "無効なタイトル" },
      { status: 400 }
    );
  }

  if (!projectExists(title)) {
    let project = await fakeDb.createProject({ title });
    return data(project, { status: 201 });
  } else {
    let project = await fakeDb.updateProject({ title });
    // デフォルトのステータスコードは 200 なので、`data` は不要
    return project;
  }
}
```

このようなフォームエラーのレンダリングに関する詳細は、[フォームの検証](./form-validation) を参照してください。

もう1つの一般的なステータスコードは 404 です。

```tsx
// route('/projects/:projectId', './project.tsx')
import type { Route } from "./+types/project";
import { data } from "react-router";
import { fakeDb } from "../db";

export async function loader({ params }: Route.ActionArgs) {
  let project = await fakeDb.getProject(params.id);
  if (!project) {
    // ErrorBoundary にスロー
    throw data(null, { status: 404 });
  }
  return project;
}
```

スローされた `data` に関する詳細は、[エラー境界](./error-boundary) を参照してください。

