---
title: ファイルアップロード
---

# ファイルアップロード

React Routerアプリケーションでファイルアップロードを処理します。このガイドでは、ファイルアップロードを容易にするために、[Remix The Web][remix-the-web]プロジェクトのいくつかのパッケージを使用します。

_このドキュメントは、[David Adamsによるオリジナルガイド](https://programmingarehard.com/2024/09/06/remix-file-uploads-updated.html/)を基に作成されています。より多くの例については、そちらを参照してください。_

## 基本的なファイルアップロード

### 1. ルートの設定

ルートは自由に設定できます。この例では、次の構造を使用します。

```ts filename=routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  // ... その他のルート
  route("user/:id", "pages/user-profile.tsx", [
    route("avatar", "api/upload-avatar.tsx"),
  ]),
] satisfies RouteConfig;
```

### 2. フォームデータパーサーの追加

`form-data-parser`は、ファイルアップロードのストリーミングサポートを提供する`request.formData()`のラッパーです。

```shellscript
npm i @mjackson/form-data-parser
```

[詳しくは`form-data-parser`のドキュメントを参照してください][form-data-parser]

### 3. アップロードアクションを持つルートの作成

`parseFormData`関数は、`uploadHandler`関数を引数として受け取ります。この関数は、フォーム内の各ファイルアップロードに対して呼び出されます。

<docs-warning>

ファイルアップロードを機能させるには、フォームの`enctype`を`multipart/form-data`に設定する必要があります。

</docs-warning>

```tsx filename=pages/user-profile.tsx
import {
  type FileUpload,
  parseFormData,
} from "@mjackson/form-data-parser";

export async function action({
  request,
}: ActionFunctionArgs) {
  const uploadHandler = async (fileUpload: FileUpload) => {
    if (fileUpload.fieldName === "avatar") {
      // アップロードを処理し、Fileを返します
    }
  };

  const formData = await parseFormData(
    request,
    uploadHandler
  );
  // この時点で 'avatar' は既に処理されています
  const file = formData.get("avatar");
}

export default function Component() {
  return (
    <form method="post" encType="multipart/form-data">
      <input type="file" name="avatar" />
      <button>Submit</button>
    </form>
  );
}
```

## ローカルストレージの実装

### 1. ストレージパッケージの追加

`file-storage`は、JavaScriptで[Fileオブジェクト][file]を格納するためのキー/値インターフェースです。`localStorage`がブラウザに文字列のキー/値ペアを格納することを可能にするのと同様に、`file-storage`はサーバーにファイルのキー/値ペアを格納することを可能にします。

```shellscript
npm i @mjackson/file-storage
```

[詳しくは`file-storage`のドキュメントを参照してください][file-storage]

### 2. ストレージ設定の作成

さまざまなルートで使用される`LocalFileStorage`インスタンスをエクスポートするファイルを作成します。

```ts filename=avatar-storage.server.ts
import { LocalFileStorage } from "@mjackson/file-storage/local";

export const fileStorage = new LocalFileStorage(
  "./uploads/avatars"
);

export function getStorageKey(userId: string) {
  return `user-${userId}-avatar`;
}
```

### 3. アップロードハンドラの実装

`fileStorage`インスタンスにファイルを格納するようにフォームの`action`を更新します。

```tsx filename=pages/user-profile.tsx
import {
  FileUpload,
  parseFormData,
} from "@mjackson/form-data-parser";
import {
  fileStorage,
  getStorageKey,
} from "~/avatar-storage.server";
import type { Route } from "./+types/user-profile";

export async function action({
  request,
  params,
}: Route.ActionArgs) {
  async function uploadHandler(fileUpload: FileUpload) {
    if (
      fileUpload.fieldName === "avatar" &&
      fileUpload.type.startsWith("image/")
    ) {
      let storageKey = getStorageKey(params.id);

      // FileUploadオブジェクトは、長時間保持されることを意図していません（リクエストのbodyからストリーミングデータを取得します）。できるだけ早く格納してください。
      await fileStorage.set(storageKey, fileUpload);

      // FormDataオブジェクトに対してFileを返します。これは、必要に応じてファイルの内容にアクセスする方法（例：file.stream()）を知っているLazyFileですが、実際に読み取るまでは待ちます。
      return fileStorage.get(storageKey);
    }
  }

  const formData = await parseFormData(
    request,
    uploadHandler
  );
}

export default function UserPage({
  actionData,
  params,
}: Route.ComponentProps) {
  return (
    <div>
      <h1>User {params.id}</h1>
      <form
        method="post"
        // ファイルアップロードには、フォームのenctypeを「multipart/form-data」に設定する必要があります
        encType="multipart/form-data"
      >
        <input type="file" name="avatar" accept="image/*" />
        <button>Submit</button>
      </form>

      <img
        src={`/user/${params.id}/avatar`}
        alt="user avatar"
      />
    </div>
  );
}
```

### 4. アップロードされたファイルを配信するルートの追加

ファイルをレスポンスとしてストリーミングする[リソースルート][resource-route]を作成します。

```tsx filename=api/upload-avatar.tsx
import {
  fileStorage,
  getStorageKey,
} from "~/avatar-storage.server";
import type { Route } from "./+types/upload-avatar";

export async function loader({ params }: Route.LoaderArgs) {
  const storageKey = getStorageKey(params.id);
  const file = await fileStorage.get(storageKey);

  if (!file) {
    throw new Response("User avatar not found", {
      status: 404,
    });
  }

  return new Response(file.stream(), {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename=${file.name}`,
    },
  });
}
```

[remix-the-web]: https://github.com/mjackson/remix-the-web
[form-data-parser]: https://github.com/mjackson/remix-the-web/tree/main/packages/form-data-parser
[file-storage]: https://github.com/mjackson/remix-the-web/tree/main/packages/file-storage
[file]: https://developer.mozilla.org/en-US/docs/Web/API/File
[resource-route]: ../how-to/resource-routes


