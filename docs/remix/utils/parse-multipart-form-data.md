---
title: unstable_parseMultipartFormData
---

# `unstable_parseMultipartFormData`

<docs-warning>このAPIはReact Router v7で削除されました。推奨される代替APIについては、<a href="https://reactrouter.com/how-to/file-uploads">React Routerのファイルアップロードガイド</a>を参照してください。</docs-warning>

アプリでマルチパートフォーム（ファイルアップロード）を処理できるようにします。

このAPIの使用方法を理解するには、[ブラウザのFile API][the-browser-file-api]を理解すると役立ちます。

これは、`request.formData()` の代わりに使用します。

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
    uploadHandler // <-- これについては後で詳しく見ていきます
  );

  // ファイルフィールドの戻り値は、uploadHandler が返すものです。
  // アバターをs3にアップロードしていると仮定すると、
  // uploadHandlerはURLを返します。
  const avatarUrl = formData.get("avatar");

  // 現在ログインしているユーザーのアバターをデータベースで更新します
  await updateUserAvatar(request, avatarUrl);

  // 成功！アカウントページにリダイレクトします
  return redirect("/account");
};

export default function AvatarUploadRoute() {
  return (
    <Form method="post" encType="multipart/form-data">
      <label htmlFor="avatar-input">アバター</label>
      <input id="avatar-input" type="file" name="avatar" />
      <button>アップロード</button>
    </Form>
  );
}
```

アップロードされたファイルの内容を読み取るには、[Blob API][the-blob-api]から継承したメソッドのいずれかを使用します。たとえば、`.text()` はファイルのテキストコンテンツを非同期的に返し、`.arrayBuffer()` はバイナリコンテンツを返します。

### `uploadHandler`

`uploadHandler` は、全体の鍵となるものです。クライアントからストリーミングされるマルチパート/フォームデータのパーツに対して何が起こるかを担当します。ディスクに保存したり、メモリに保存したり、プロキシとして機能して他の場所（ファイルストレージプロバイダーなど）に送信したりできます。

Remixには、`uploadHandler`を作成するための2つのユーティリティがあります。

- `unstable_createFileUploadHandler`
- `unstable_createMemoryUploadHandler`

これらは、比較的単純なユースケースを処理するためのフル機能のユーティリティです。非常に小さなファイル以外はメモリにロードしないことをお勧めします。ファイルをディスクに保存することは、多くのユースケースにとって妥当な解決策です。ただし、ファイルをファイルホスティングプロバイダーにアップロードする場合は、独自のものを記述する必要があります。

[the-browser-file-api]: https://developer.mozilla.org/en-US/docs/Web/API/File
[the-blob-api]: https://developer.mozilla.org/en-US/docs/Web/API/Blob
