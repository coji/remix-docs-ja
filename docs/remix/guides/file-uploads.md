---
title: ファイルアップロード
---

<docs-warning>このガイドで説明されているAPIはReact Router v7で削除されました。<a href="https://reactrouter.com/how-to/file-uploads">React Routerのファイルアップロードに関するガイド</a>で推奨されるアプローチを参照してください。</docs-warning>

ほとんどの場合、ファイルをファイルホストにプロキシしたいと思うでしょう。

**例:**

```tsx
import type {
  ActionFunctionArgs,
  UploadHandler,
} from "@remix-run/node"; // または cloudflare/deno
import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node"; // または cloudflare/deno
import { writeAsyncIterableToWritable } from "@remix-run/node"; // `writeAsyncIterableToWritable` は Node のみのユーティリティ
import type {
  UploadApiOptions,
  UploadApiResponse,
  UploadStream,
} from "cloudinary";
import cloudinary from "cloudinary";

async function uploadImageToCloudinary(
  data: AsyncIterable<Uint8Array>
) {
  const uploadPromise = new Promise<UploadApiResponse>(
    async (resolve, reject) => {
      const uploadStream =
        cloudinary.v2.uploader.upload_stream(
          {
            folder: "remix",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(result);
          }
        );
      await writeAsyncIterableToWritable(
        data,
        uploadStream
      );
    }
  );

  return uploadPromise;
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const userId = getUserId(request);

  const uploadHandler = unstable_composeUploadHandlers(
    // カスタムアップロードハンドラー
    async ({ name, contentType, data, filename }) => {
      if (name !== "img") {
        return undefined;
      }
      const uploadedImage = await uploadImageToCloudinary(
        data
      );
      return uploadedImage.secure_url;
    },
    // それ以外はすべてメモリにフォールバック
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const imageUrl = formData.get("avatar");

  // uploadHandlerが文字列を返すため、imageUrlは文字列になります。
  // ... など
};
```

`UploadHandler`関数は、ファイルに関するいくつかのパラメーターを受け取ります。

| プロパティ    | 型                      | 説明                                                                  |
| ----------- | ------------------------- | ---------------------------------------------------------------------------- |
| name        | string                    | フィールド名（HTMLフォームフィールドの「name」の値から取得）                |
| data        | AsyncIterable<Uint8Array> | ファイルのバイトのイテラブル                                               |
| filename    | string                    | ユーザーがアップロード用に選択したファイルの名前（例：`rickroll.mp4`） |
| contentType | string                    | ファイルのコンテンツタイプ（例：`videomp4`）                               |

あなたの仕事は、`data`を使って必要なことを行い、有効な[`FormData`][form-data]値である[`File`][the-browser-file-api]、`string`、または結果のFormDataに追加しない場合は`undefined`を返すことです。

### アップロードハンドラーの構成

組み込みの`unstable_createFileUploadHandler`と`unstable_createMemoryUploadHandler`があり、将来的にはより多くのアップロードハンドラーユーティリティが開発されると予想されます。異なるアップロードハンドラーを使用する必要があるフォームがある場合は、カスタムハンドラーでそれらを構成できます。以下に理論的な例を示します。

```ts filename=file-upload-handler.server.ts
import type { UploadHandler } from "@remix-run/node"; // または cloudflare/deno
import { unstable_createFileUploadHandler } from "@remix-run/node"; // または cloudflare/deno
import { createCloudinaryUploadHandler } from "some-handy-remix-util";

export const standardFileUploadHandler =
  unstable_createFileUploadHandler({
    directory: "public/calendar-events",
  });

export const cloudinaryUploadHandler =
  createCloudinaryUploadHandler({
    folder: "/my-site/avatars",
  });

export const fileUploadHandler: UploadHandler = (args) => {
  if (args.name === "calendarEvent") {
    return standardFileUploadHandler(args);
  } else if (args.name === "eventBanner") {
    return cloudinaryUploadHandler(args);
  }
  return undefined;
};
```
