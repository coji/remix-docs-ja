---
title: unstable_createFileUploadHandler
toc: false
---

# `unstable_createFileUploadHandler`

ディスクにファイル名を付けてパーツを書き込み、メモリから削除するNode.jsアップロードハンドラ。ファイル名のないパーツは解析されません。別のアップロードハンドラと組み合わせる必要があります。

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
    // メモリにすべてを解析
    unstable_createMemoryUploadHandler()
  );
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("avatar");

  // fileは"NodeOnDiskFile"であり、"File" APIを実装しています
  // ... etc
};
```

**オプション:**

| プロパティ             | タイプ               | デフォルト                         | 説明                                                                                                                                                                                                                                                              |
| ---------------------- | ------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| avoidFileConflicts     | boolean            | true                            | ディスク上に既に存在する場合、ファイル名の最後にタイムスタンプを追加することでファイルの競合を回避します                                                                                                                                                                     |
| directory             | string \| Function | os.tmpdir()                     | アップロードを書き込むディレクトリ。                                                                                                                                                                                                                                           |
| file                 | Function           | () => `upload_${random}.${ext}` | ディレクトリ内のファイル名。相対パスにすることができます。ディレクトリ構造が存在しない場合は作成されます。                                                                                                                                                                                        |
| maxPartSize            | number             | 3000000                         | 許可される最大アップロードサイズ（バイト単位）。サイズを超えるとMaxPartSizeExceededErrorがスローされます。                                                                                                                                                                   |
| filter                | Function           | オプション                        | ファイル名、コンテンツタイプ、またはフィールド名に基づいてファイルのアップロードを保存しないようにするために使用できる関数。`false`を返すと、ファイルは無視されます。                                                                                                                                                                                             |

`file`と`directory`の関数APIは同じです。これらは`object`を受け取り`string`を返します。受け取るオブジェクトには`filename`、`name`、`contentType`（すべて文字列）があります。返される`string`はパスです。

`filter`関数は`object`を受け取り`boolean`（または`boolean`に解決されるPromise）を返します。受け取るオブジェクトには`filename`、`name`、`contentType`（すべて文字列）があります。返される`boolean`は、そのファイルストリームを処理したい場合`true`です。


