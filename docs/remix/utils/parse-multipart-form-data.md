---
title: unstable_parseMultipartFormData
---

# `unstable_parseMultipartFormData`

アプリのマルチパートフォーム（ファイルアップロード）を処理できます。

このAPIの使い方を知るには、[ブラウザのファイルAPI][the-browser-file-api] を理解することが役立ちます。

これは `request.formData()` の代わりに使用されます。

```diff
- const formData = await request.formData();
+ const formData = await unstable_parseMultipartFormData(request, uploadHandler);
```

例：

```tsx lines=[4-7,12,25]
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler // <-- これは後で詳しく説明します
  );

  // ファイルフィールドの戻り値は、uploadHandler が返すものです。
  // アバターをS3にアップロードすると想像してみましょう。
  // そのため、uploadHandler はURLを返します。
  const avatarUrl = formData.get("avatar");

  // データベースに現在ログインしているユーザーのアバターを更新します
  await updateUserAvatar(request, avatarUrl);

  // 成功！ アカウントページにリダイレクトします
  return redirect("/account");
};

export default function AvatarUploadRoute() {
  return (
    <Form method="post" encType="multipart/form-data">
      <label htmlFor="avatar-input">Avatar</label>
      <input id="avatar-input" type="file" name="avatar" />
      <button>Upload</button>
    </Form>
  );
}
```

アップロードされたファイルの内容を読み取るには、[Blob API][the-blob-api] から継承されたメソッドのいずれかを使用します。たとえば、`.text()` はファイルのテキストコンテンツを非同期に返し、`.arrayBuffer()` はバイナリコンテンツを返します。

### `uploadHandler`

`uploadHandler` は、このすべての中心です。クライアントからストリーミングされているマルチパート/フォームデータのパーツがどのように処理されるかを担当します。ディスクに保存したり、メモリに保存したり、別の場所に（ファイルストレージプロバイダーなど）送信するためのプロキシとして機能したりできます。

Remixには、`uploadHandler` を作成するためのユーティリティが2つあります。

- `unstable_createFileUploadHandler`
- `unstable_createMemoryUploadHandler`

これらは、非常に単純なユースケースを処理するための、完全に機能するユーティリティです。メモリに非常に小さなファイルしか読み込まないことをお勧めします。ファイルをディスクに保存することは、多くのユースケースにおける妥当なソリューションです。しかし、ファイルをファイルホスティングプロバイダーにアップロードする場合は、自分で作成する必要があります。

[the-browser-file-api]: https://developer.mozilla.org/en-US/docs/Web/API/File
[the-blob-api]: https://developer.mozilla.org/en-US/docs/Web/API/Blob
