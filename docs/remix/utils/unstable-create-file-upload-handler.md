---
title: unstable_createFileUploadHandler
toc: false
---

# `unstable_createFileUploadHandler`

<docs-warning>このAPIはReact Router v7で削除されました。推奨される代替APIについては、<a href="https://reactrouter.com/how-to/file-uploads">React Routerのファイルアップロードガイド</a>を参照してください。</docs-warning>

Node.js のアップロードハンドラーで、ファイル名を持つパートをディスクに書き込み、メモリに保持しないようにします。ファイル名のないパートは解析されません。別のアップロードハンドラーと組み合わせて使用する必要があります。

**例:**

```tsx
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      file: ({ filename }) => filename,
    }),
    // その他すべてをメモリに解析
    unstable_createMemoryUploadHandler()
  );
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("avatar");

  // file は "File" API を実装する "NodeOnDiskFile" です
  // ... など
};
```

**オプション:**

| プロパティ           | 型               | デフォルト                         | 説明                                                                                                                                                     |
| ------------------ | ------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| avoidFileConflicts | boolean            | true                            | ディスクに既に存在する場合、ファイル名の末尾にタイムスタンプを追加して、ファイル名の競合を回避します。                                                                                                                              |
| directory          | string \| Function | os.tmpdir()                     | アップロードを書き込むディレクトリ。                                                                                                                              |
| file               | Function           | () => `upload_${random}.${ext}` | ディレクトリ内のファイル名。相対パスを指定できます。ディレクトリ構造が存在しない場合は作成されます。                                                                                                  |
| maxPartSize        | number             | 3000000                         | 許可される最大アップロードサイズ（バイト単位）。サイズを超過すると、MaxPartSizeExceededError がスローされます。                                                  |
| filter             | Function           | OPTIONAL                        | ファイル名、コンテンツタイプ、またはフィールド名に基づいて、ファイルアップロードの保存を防止するために記述できる関数。`false` を返すと、ファイルは無視されます。 |

`file` および `directory` の関数 API は同じです。`object` を受け取り、`string` を返します。受け取るオブジェクトには、`filename`、`name`、および `contentType`（すべて文字列）があります。返される `string` はパスです。

`filter` 関数は `object` を受け取り、`boolean`（または `boolean` に解決される Promise）を返します。受け取るオブジェクトには、`filename`、`name`、および `contentType`（すべて文字列）があります。返される `boolean` は、そのファイルストリームを処理する場合は `true` です。
