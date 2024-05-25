---
title: ファイルアップロード
---

<docs-warning>このドキュメントは WIP です。これはファイルアップロードの API ドキュメントから抽出したものであり、少し文脈が異なります。これをファイルアップロードに関する一般的なガイドとして書き直す予定です。</docs-warning>

ほとんどの場合、ファイルホストにファイルをプロキシしたいと思うでしょう。

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
import { writeAsyncIterableToWritable } from "@remix-run/node"; // `writeAsyncIterableToWritable` は Node 専用のユーティリティです
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
    // その他すべてに対してメモリへのフォールバック
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const imageUrl = formData.get("avatar");

  // アップロードハンドラーは文字列を返すため、imageUrl は文字列になります。
  // ... 等
};
```

`UploadHandler` 関数は、ファイルに関するいくつかのパラメータを受け取ります。

| プロパティ    | 型                      | 説明                                                                  |
| ----------- | ------------------------- | ---------------------------------------------------------------------------- |
| name        | string                    | フィールド名（HTML フォームフィールドの「name」値から取得）                |
| data        | AsyncIterable<Uint8Array> | ファイルバイトのイテラブル                                               |
| filename    | string                    | ユーザーがアップロードのために選択したファイルの名前（例：`rickroll.mp4`） |
| contentType | string                    | ファイルのコンテンツタイプ（例：`videomp4`）                               |

あなたの仕事は、`data` を使って必要な操作を行い、有効な \[`FormData`]\[form-data] 値：\[`File`]\[the-browser-file-api]、`string`、または `undefined` を返し、結果の FormData に追加するかどうかをスキップします。

### アップロードハンドラの合成

`unstable_createFileUploadHandler` と `unstable_createMemoryUploadHandler` が組み込まれています。将来的に、さらに多くのアップロードハンドラーユーティリティが開発される予定です。さまざまなアップロードハンドラーを使用する必要があるフォームがある場合は、カスタムハンドラーと組み合わせて合成することができます。以下は理論的な例です。

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


