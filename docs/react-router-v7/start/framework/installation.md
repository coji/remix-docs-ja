---
title: インストール
order: 1
---

# インストール

## はじめに

ほとんどのプロジェクトはテンプレートから始まります。React Router が管理している基本的なテンプレートを使用してみましょう。

```shellscript nonumber
npx create-react-router@latest my-react-router-app
```

次に、新しいディレクトリに移動してアプリを起動します。

```shellscript nonumber
cd my-react-router-app
npm i
npm run dev
```

ブラウザで `http://localhost:5173` を開くことができます。

プロジェクトを手動でセットアップする方法については、[GitHub でテンプレートを表示][default-template]してください。

また、すぐにデプロイできる[テンプレート][react-router-templates]も多数用意しています。

```shellscript nonumber
npx create-react-router@latest --template remix-run/react-router-templates/<template-name>
```

---

次: [ルーティング](./routing)

[manual_usage]: ../how-to/manual-usage
[default-template]: https://github.com/remix-run/react-router-templates/tree/main/default
[react-router-templates]: https://github.com/remix-run/react-router-templates
