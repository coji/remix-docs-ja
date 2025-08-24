---
title: unstable_createMemoryUploadHandler
toc: false
---

# `unstable_createMemoryUploadHandler`

<docs-warning>このAPIはReact Router v7で削除されました。<a href="https://reactrouter.com/how-to/file-uploads">React Routerのファイルアップロードガイド</a>で推奨される代替APIを参照してください。</docs-warning>

**例:**

```tsx
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000,
  });
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("avatar");

  // file は node 用にポリフィルされた "File" (https://mdn.io/File) です
  // ... など
};
```

**オプション:** サポートされているオプションは `maxPartSize` と `filter` のみで、これらは上記の `unstable_createFileUploadHandler` と同じように動作します。この API は大規模な用途には推奨されませんが、簡単なユースケースや別のハンドラーのフォールバックとして便利なユーティリティです。
