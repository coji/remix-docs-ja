---
title: インストール
order: 1
---

# インストール

<docs-info>

React Router v7 は、以下の最小バージョンが必要です。

- `node@20`
- `react@18`
- `react-dom@18`

</docs-info>

ほとんどのプロジェクトはテンプレートから開始します。React Router がメンテナンスしている基本的なテンプレートを使用してみましょう。

```shellscript nonumber
npx create-react-router@latest my-react-router-app
```

次に、新しいディレクトリに移動してアプリを起動します。

```shellscript nonumber
cd my-react-router-app
npm i
npm run dev
```

ブラウザで `http://localhost:5173` を開けるようになります。

プロジェクトを手動でセットアップする方法については、[GitHub でテンプレートを表示する][default-template]ことができます。

また、すぐにデプロイできる[多数のテンプレート][react-router-templates]も用意していますので、ぜひご利用ください。

```shellscript nonumber
npx create-react-router@latest --template remix-run/react-router-templates/<template-name>
```

---

次: [ルーティング](./routing)

[manual_usage]: ../how-to/manual-usage
[default-template]: https://github.com/remix-run/react-router-templates/tree/main/default
[react-router-templates]: https://github.com/remix-run/react-router-templates

