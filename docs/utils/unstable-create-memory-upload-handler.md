---
title: unstable_createMemoryUploadHandler
toc: false
---

# `unstable_createMemoryUploadHandler`

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

  // file は "File" (https://mdn.io/File) であり、node 用にポリフィルされています
  // ... 等
};
```

**オプション:** サポートされる唯一のオプションは `maxPartSize` と `filter` であり、上記の `unstable_createFileUploadHandler` と同じように機能します。この API は、大規模な用途にはお勧めできませんが、単純なユースケースや他のハンドラのフォールバックとして便利なユーティリティです。 
