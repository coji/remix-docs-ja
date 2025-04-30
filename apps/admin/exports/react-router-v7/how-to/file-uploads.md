---
title: ファイルアップロード
---

# ファイルアップロード

React Router アプリケーションでファイルアップロードを処理します。このガイドでは、ファイルアップロードを簡単にするために、[Remix The Web][remix-the-web] プロジェクトのいくつかのパッケージを使用します。

_このドキュメントのベースとなった[オリジナルのガイド](https://programmingarehard.com/2024/09/06/remix-file-uploads-updated.html/)を執筆してくれた David Adams に感謝します。さらに多くの例については、そちらを参照してください。_

## 基本的なファイルアップロード

### 1. いくつかのルートを設定する

ルートは好きなように設定できます。この例では、次の構造を使用します。

```ts filename=routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  // ... 他のルート
  route("user/:id", "pages/user-profile.tsx", [
    route("avatar", "api/avatar.tsx"),
  ]),
] satisfies RouteConfig;
```

### 2. フォームデータパーサーを追加する

`form-data-parser` は、ファイルアップロードを処理するためのストリーミングサポートを提供する `request.formData()` のラッパーです。

```shellscript
npm i @mjackson/form-data-parser
```

[詳細については、`form-data-parser` のドキュメントを参照してください][form-data-parser]

### 3. アップロードアクション付きのルートを作成する

`parseFormData` 関数は、引数として `uploadHandler` 関数を取ります。この関数は、フォーム内の各ファイルアップロードに対して呼び出されます。

<docs-warning>

ファイルアップロードを機能させるには、フォームの `enctype` を `multipart/form-data` に設定する必要があります。

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
      // アップロードを処理して File を返す
    }
  };

  const formData = await parseFormData(
    request,
    uploadHandler
  );
  // 'avatar' はこの時点で既に処理済み
  const file = formData.get("avatar");
}

export default function Component() {
  return (
    <form method="post" encType="multipart/form-data">
      <input type="file" name="avatar" />
      <button>送信</button>
    </form>
  );
}
```

## ローカルストレージの実装

### 1. ストレージパッケージを追加する

`file-storage` は、JavaScript で [File オブジェクト][file] を保存するためのキー/値インターフェースです。`localStorage` がブラウザで文字列のキー/値ペアを保存できるのと同様に、file-storage ではサーバー上のファイルのキー/値ペアを保存できます。

```shellscript
npm i @mjackson/file-storage
```

[詳細については、`file-storage` のドキュメントを参照してください][file-storage]

### 2. ストレージ構成を作成する

異なるルートで使用される `LocalFileStorage` インスタンスをエクスポートするファイルを作成します。

```ts filename=avatar-storage.server.ts
import { LocalFileStorage } from "@mjackson/file-storage/local";

export const fileStorage = new LocalFileStorage(
  "./uploads/avatars"
);

export function getStorageKey(userId: string) {
  return `user-${userId}-avatar`;
}
```

### 3. アップロードハンドラーを実装する

フォームの `action` を更新して、ファイルを `fileStorage` インスタンスに保存します。

```tsx filename=pages/user-profile.tsx
import {
  type FileUpload,
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

      // FileUpload オブジェクトは、あまり長く保持することを意図していません (request.body からのストリーミングデータです)。できるだけ早く保存してください。
      await fileStorage.set(storageKey, fileUpload);

      // FormData オブジェクトの File を返します。これは、必要に応じて (例: file.stream() を使用して) ファイルのコンテンツにアクセスする方法を知っている LazyFile ですが、実際に何かを読み取るのは要求されるまで待機します。
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
      <h1>ユーザー {params.id}</h1>
      <form
        method="post"
        // ファイルアップロードの場合、フォームの enctype は "multipart/form-data" に設定する必要があります
        encType="multipart/form-data"
      >
        <input type="file" name="avatar" accept="image/*" />
        <button>送信</button>
      </form>

      <img
        src={`/user/${params.id}/avatar`}
        alt="ユーザーアバター"
      />
    </div>
  );
}
```

### 4. アップロードされたファイルを提供するルートを追加する

ファイルをレスポンスとしてストリーミングする [リソースルート][resource-route] を作成します。

```tsx filename=api/avatar.tsx
import {
  fileStorage,
  getStorageKey,
} from "~/avatar-storage.server";
import type { Route } from "./+types/avatar";

export async function loader({ params }: Route.LoaderArgs) {
  const storageKey = getStorageKey(params.id);
  const file = await fileStorage.get(storageKey);

  if (!file) {
    throw new Response("ユーザーアバターが見つかりません", {
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

